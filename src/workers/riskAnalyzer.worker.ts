// This is required for worker-loader - typescript integration
import "./custom.d";

const ctx: Worker = self as any;

function traverse(o: object, fn: (arr: any[]) => any, results: any[]) {
  /**
   * Traverse through JSON object representing nested groups,
   * for each array that is found, pass it through supplied function,
   * and collect results in result arr.
   */
  for (const key in o) {
    if (!!o[key] && typeof o[key] == "object") {
      if (o[key].length) {
        // is array
        results.push(fn(o[key]));
      } else {
        traverse(o[key], fn, results);
      }
    }
  }
}

function nested_groupby(data: object[], keys: string[]) {
  /**
   * Takes in a list of objects, form nested groups using
   * a list of key values
   */
  return data.reduce((r, currentObj) => {
    keys
      .reduce(
        (group, key, i, { length }) =>
          (group[currentObj[key]] =
            group[currentObj[key]] || (i + 1 === length ? [] : {})),
        r
      )
      .push(currentObj);
    return r;
  }, {});
}

const GRAPH_KVALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 200];

ctx.onmessage = event => {
  const { rawData, quasiIdentifiers } = event.data;

  const eqClasses = [];
  traverse(
    nested_groupby(rawData, quasiIdentifiers),
    arr => arr.length,
    eqClasses
  );

  const recordLoss = GRAPH_KVALUES.map(k => {
    let recordCount = 0;
    for (const c of eqClasses) {
      if (c <= k) {
        recordCount += c;
      }
    }
    const percent = (recordCount / rawData.length) * 100;
    return { y: percent, x: k };
  });

  const eqClassLoss = GRAPH_KVALUES.map(k => {
    let classCount = 0;
    for (const c of eqClasses) {
      if (c <= k) {
        classCount += 1;
      }
    }
    const percent = (classCount / eqClasses.length) * 100;
    return { y: percent, x: k };
  });

  ctx.postMessage({
    type: "COMPLETE",
    result: {
      recordLoss,
      eqClassLoss
    }
  });
};
