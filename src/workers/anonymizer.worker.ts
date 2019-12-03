import Transforms from "../anonymizer/Transforms";
import { ANON_TYPES, FIELD_TYPES } from "../anonymizer/Types";
import "./custom.d"; // This is required for worker-loader - typescript integration

const ctx: Worker = self as any;

ctx.onmessage = event => {
  const { rawData, anonTypes, selectedMode } = event.data;
  const anonymizedData = [];
  let processedCount = 0;
  let totalCount = rawData.length;

  for (const record of rawData) {
    if (processedCount % 10000 === 0) {
      ctx.postMessage({
        type: "UPDATE_PROGRESS",
        progress: Math.floor((processedCount / totalCount) * 100)
      });
    }
    const anonymizedRecord = {};
    for (const col in record) {
      let selectedFilter = anonTypes[col];
      if (FIELD_TYPES[selectedFilter]) {
        selectedFilter = FIELD_TYPES[selectedFilter][selectedMode];
      }
      // If no option supplied or Transform not specified
      if (!selectedFilter || !Transforms[selectedFilter]) {
        anonymizedRecord[col] = Transforms[ANON_TYPES.NONE].process(
          record[col]
        );
      } else {
        const output = Transforms[selectedFilter].process(record[col]);
        if (output !== null) {
          // null means that the column will be dropped
          anonymizedRecord[col] = output;
        }
      }
    }
    anonymizedData.push(anonymizedRecord);
    processedCount++;
  }
  ctx.postMessage({
    type: "COMPLETE",
    result: anonymizedData
  });
};

ctx.postMessage({ foo: "foo" });
