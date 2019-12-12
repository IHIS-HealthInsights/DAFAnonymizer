// This is required for worker-loader - typescript integration
import "./custom.d";

const ctx: Worker = self as any;

function isArray(arg: any): arg is Array<object> {
  return arg.length !== undefined;
}

function extractEqClasses(
  o: object,
  eqClasses: { count: number; samples?: object[] }[]
) {
  /**
   * Traverse through JSON object representing nested groups,
   * for each equivalence class, collapse into array of
   * {
   *   count: number
   *   samples?: object[] // only available if samples < SAMPLE_COUNT
   * }
   */
  for (const key in o) {
    if (!!o[key]) {
      if (isArray(o[key])) {
        eqClasses.push({
          count: o[key].length,
          samples: o[key]
        });
      } else if (typeof o[key] === "number") {
        eqClasses.push({ count: o[key] });
      } else if (typeof o[key] === "object") {
        extractEqClasses(o[key], eqClasses);
      }
    }
  }
}

function nestedGroupby(data: object[], keys: string[]) {
  /**
   * Takes in a list of objects, form nested groups using
   * a list of key values.
   * To optimize space, store only counts instead of
   * every record when number of records exceed SAMPLE_COUNT.
   */

  const groups = {};
  for (const row of data) {
    let curPointer = groups;
    let prevPointer;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (curPointer[row[key]]) {
        prevPointer = curPointer;
        curPointer = curPointer[row[key]];
      } else {
        if (i + 1 === keys.length) {
          // if last key
          curPointer[row[key]] = [];
        } else {
          curPointer[row[key]] = {}; // continue to setup for next partition
        }
        prevPointer = curPointer;
        curPointer = curPointer[row[key]];
      }
    }

    // Push up to SAMPLE_COUNT objects, after which convert to count
    if (isArray(curPointer)) {
      curPointer.push(row);
      if (curPointer.length > SAMPLE_COUNT) {
        prevPointer[row[keys[keys.length - 1]]] = curPointer.length;
      }
    } else if (typeof curPointer === "number") {
      prevPointer[row[keys[keys.length - 1]]] = curPointer += 1;
    }
  }
  return groups;
}

const GRAPH_KVALUES = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  25,
  50,
  75,
  100
].reverse(); // reverse so that we can draw chart in order of increasing risk
const SAMPLE_COUNT = 100;

ctx.onmessage = event => {
  const { rawData, quasiIdentifiers } = event.data;

  const eqClasses = [];
  extractEqClasses(nestedGroupby(rawData, quasiIdentifiers), eqClasses);

  const recordLoss = [];
  const eqClassLoss = [];
  const samples: (object[] | null)[] = [];
  GRAPH_KVALUES.forEach((k, i) => {
    let recordCount = 0;
    let classCount = 0;
    for (const c of eqClasses) {
      if (c.count <= k) {
        recordCount += c.count;
        classCount += 1;
        // only add samples when exact match for k, so that we don't double count
        if (c.count === k && c.samples) {
          samples[i] = samples[i] ? samples[i].concat(c.samples) : c.samples;
        }
      }
    }
    recordLoss.push({
      x: k,
      y: (recordCount / rawData.length) * 100
    });
    eqClassLoss.push({
      x: k,
      y: (classCount / eqClasses.length) * 100
    });
  });

  ctx.postMessage({
    type: "COMPLETE",
    result: {
      recordLoss,
      eqClassLoss,
      samples,
      kValues: GRAPH_KVALUES,
      totalRecords: rawData.length
    }
  });
};
