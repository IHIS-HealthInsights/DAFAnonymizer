import { DEFAULT_KVALUES } from "../constants";

// This is required for worker-loader - typescript integration
import "./custom.d";

const ctx: Worker = self as any;

function isLeaf(arg: any): arg is number[] {
  return arg.length !== undefined;
}

function extractEqClasses(o: object, eqClasses: number[][]) {
  /**
   * Traverse through JSON object representing nested groups,
   * collapsing all the indexes into a single array.
   */
  for (const key in o) {
    if (!!o[key]) {
      if (isLeaf(o[key])) {
        eqClasses.push(o[key]);
      } else if (typeof o[key] === "object") {
        extractEqClasses(o[key], eqClasses);
      }
    }
  }
}

function nestedGroupby(data: object[], keys: string[], updateProgress) {
  /**
   * Takes in a list of objects, form nested groups using
   * a list of key values.
   * To optimize space, store only indexes instead of the actual
   * records. Lookup against data array can be done later.
   */

  const groups = {};
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    if (rowIndex % 10000 === 0) {
      updateProgress((rowIndex / data.length) * 100);
    }

    const row = data[rowIndex];
    let curPointer = groups;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (curPointer[row[key]]) {
        curPointer = curPointer[row[key]];
      } else {
        // if last key
        if (i + 1 === keys.length) {
          // used to store indexes of records belonging to eq class
          curPointer[row[key]] = [];
        } else {
          // continue to setup for next partition
          curPointer[row[key]] = {};
        }
        curPointer = curPointer[row[key]];
      }
    }

    // Push indexes to save space, lookup later from data array
    if (isLeaf(curPointer)) {
      curPointer.push(rowIndex);
    }
  }
  return groups;
}

ctx.onmessage = event => {
  const { rawData, quasiIdentifiers } = event.data;

  const nestedGroupby_weightage = 50;
  const countingWeightage = 50;

  const eqClasses = [];
  extractEqClasses(
    nestedGroupby(rawData, quasiIdentifiers, progressPercent => {
      ctx.postMessage({
        type: "PROGRESS",
        progress: Math.floor((nestedGroupby_weightage / 100) * progressPercent)
      });
    }),
    eqClasses
  );

  const recordLoss = [];
  const eqClassLoss = [];
  const indexes: Record<number, number[]> = {};
  DEFAULT_KVALUES.forEach((k, i) => {
    ctx.postMessage({
      type: "PROGRESS",
      progress:
        Math.floor(nestedGroupby_weightage +
        (countingWeightage / DEFAULT_KVALUES.length) * i)
    });

    indexes[k] = [];
    let recordCount = 0;
    let classCount = 0;
    for (const c of eqClasses) {
      if (c.length <= k) {
        recordCount += c.length;
        classCount += 1;
        // only add samples when exact match for k, so that we don't double count
        if (c.length === k) {
          indexes[k] = indexes[k].concat(c);
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

  // Reverse so that we can draw chart in order of increasing risk
  recordLoss.reverse();
  eqClassLoss.reverse();

  ctx.postMessage({
    type: "COMPLETE",
    result: {
      recordLoss,
      eqClassLoss,
      indexes
    }
  });
};
