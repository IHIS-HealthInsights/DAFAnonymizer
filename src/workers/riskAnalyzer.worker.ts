import { DEFAULT_KVALUES } from "../constants";
import Papa from "papaparse";

// This is required for worker-loader - typescript integration
import "./custom.d";
import { NricMatcher, SHIMatcher, Matcher } from "src/anonymizer/Matchers";

const ctx: Worker = self as any;

function isLeaf(arg: any): arg is any[] | number {
  return arg.length !== undefined || typeof arg === "number";
}

function extractEqClasses(o: object, eqClasses: (object[] | number)[]) {
  /**
   * Traverse through JSON object representing nested groups,
   * collapsing all the indexes into a single array.
   */
  for (const key in o) {
    if (isLeaf(o[key])) {
      eqClasses.push(o[key]);
    } else if (typeof o[key] === "object") {
      extractEqClasses(o[key], eqClasses);
    }
  }
}

ctx.onmessage = event => {
  const {
    file,
    hasHeader,
    quasiIdentifiers,
    previewEnabled,
    maxPreviewCount
  } = event.data;

  const groups = {};
  let curCount = 0;
  let matchCounts = {};
  const matchers: Matcher[] = [new NricMatcher(), new SHIMatcher()];
  for (let m of matchers) {
    matchCounts[m.description] = {};
  }

  Papa.parse(file, {
    skipEmptyLines: true,
    header: hasHeader,
    chunk: ({ data, errors, meta }) => {
      if (!data.length || errors.length) {
        console.error(errors);
        return;
      }
      if (!hasHeader) {
        // Convert 2d array into objects with generated header
        const numCols = data[0].length;
        data = data.map(row => {
          const d = {};
          for (let i = 0; i < numCols; i++) {
            d[`Column${i + 1}`] = row[i];
          }
          return d;
        });
      }

      for (let chunkIndex = 0; chunkIndex < data.length; chunkIndex++) {
        const rowIndex = curCount + chunkIndex;
        const row = data[chunkIndex];

        // 1. Scan for PII and SHI
        for (let key in row) {
          const text = row[key];
          for (const matcher of matchers) {
            const count = matcher.match(text).length;
            if (count > 0) {
              if (!matchCounts[matcher.description][key]) {
                matchCounts[matcher.description][key] = {
                  count: 0,
                  examples: []
                };
              }
              matchCounts[matcher.description][key].count += count;
              if (matchCounts[matcher.description][key].examples.length < 5) {
                matchCounts[matcher.description][key].examples.push(text);
              }
            }
          }
        }

        // 2. Sort into bucket based on quasi identifier values
        let curPointer = groups;
        let prevPointer;
        let key;
        for (let i = 0; i < quasiIdentifiers.length; i++) {
          const key = quasiIdentifiers[i];
          if (curPointer[row[key]]) {
            prevPointer = curPointer;
            curPointer = curPointer[row[key]];
          } else {
            // if last key
            if (i + 1 === quasiIdentifiers.length) {
              // used to store indexes of records belonging to eq class
              curPointer[row[key]] = [];
            } else {
              // continue to setup for next partition
              curPointer[row[key]] = {};
            }
            prevPointer = curPointer;
            curPointer = curPointer[row[key]];
          }
        }

        // Push indexes to save space, lookup later from data array
        if (isLeaf(curPointer)) {
          if (typeof curPointer === "number") {
            prevPointer[row[key]] = prevPointer[row[key]] + 1;
          } else {
            const record = { index: rowIndex };
            if (previewEnabled) {
              // only save data for preview if total file size is too large
              record["data"] = row;
            }
            curPointer.push(record);
            if (
              curPointer.length > DEFAULT_KVALUES[DEFAULT_KVALUES.length - 1]
            ) {
              prevPointer[row[key]] = curPointer.length;
            }
          }
        }
      }
      curCount += data.length; // update index to include this chunk

      ctx.postMessage({
        type: "PROGRESS",
        progress: Math.round((meta.cursor / file.size) * 100)
      });
    },

    complete: () => {
      const eqClasses = [];
      extractEqClasses(groups, eqClasses);

      const recordLoss = [];
      const eqClassLoss = [];
      const records: Record<number, Record<string, any>> = {};
      DEFAULT_KVALUES.forEach(k => {
        records[k] = [];
        let recordCount = 0;
        let classCount = 0;
        for (let c of eqClasses) {
          const length = typeof c === "number" ? c : c.length;
          if (length <= k) {
            recordCount += length;
            classCount += 1;
            // only add samples when exact match for k, so that we don't double count
            // only store up to maxPreviewCount samples, delete data field afterwards
            if (length === k) {
              if (records[k].length > maxPreviewCount) {
                c = c.map(record => {
                  record.data = null;
                  return record;
                });
              }
              records[k] = records[k].concat(c);
            }
          }
        }
        recordLoss.push({
          x: k,
          y: (recordCount / curCount) * 100
        });
        eqClassLoss.push({
          x: k,
          y: (classCount / eqClasses.length) * 100
        });
      });

      // Reverse so that we can draw chart in order of increasing risk
      recordLoss.reverse();
      eqClassLoss.reverse();

      ctx.postMessage({
        type: "COMPLETE",
        result: {
          matchCounts,
          recordLoss,
          eqClassLoss,
          records,
          totalRecordCount: curCount
        }
      });
    }
  });
};
