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

function nestedGroupby(data: object[], keys: string[]) {
  /**
   * Takes in a list of objects, form nested groups using
   * a list of key values.
   * To optimize space, store only indexes instead of the actual
   * records. Lookup against data array can be done later.
   */

  const groups = {};
  for (let row_index = 0; row_index < data.length; row_index++) {
    const row = data[row_index];
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
      curPointer.push(row_index);
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

ctx.onmessage = event => {
  const { rawData, quasiIdentifiers } = event.data;

  const eqClasses = [];
  extractEqClasses(nestedGroupby(rawData, quasiIdentifiers), eqClasses);

  const recordLoss = [];
  const eqClassLoss = [];
  const indexes: (number[] | null)[] = [];
  GRAPH_KVALUES.forEach((k, i) => {
    let recordCount = 0;
    let classCount = 0;
    for (const c of eqClasses) {
      if (c.length <= k) {
        recordCount += c.length;
        classCount += 1;
        // only add samples when exact match for k, so that we don't double count
        if (c.length === k) {
          indexes[i] = indexes[i] ? indexes[i].concat(c) : c;
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
      indexes: indexes,
      kValues: GRAPH_KVALUES,
      totalRecords: rawData.length
    }
  });
};
