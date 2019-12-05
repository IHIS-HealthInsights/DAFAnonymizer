import Transforms, { resolveTransform } from "../anonymizer/Transforms";
import { FIELD_TYPES, TRANSFORM_TYPES } from "../anonymizer/Types";

// This is required for worker-loader - typescript integration
import "./custom.d";

const ctx: Worker = self as any;

ctx.onmessage = event => {
  const { rawData, selectedTransforms, selectedMode } = event.data;
  const anonymizedData = [];
  let processedCount = 0;
  let totalCount = rawData.length;

  if (!rawData.length) {
    return;
  }

  // Resolve transformations to be applied once, assume that every record has the same keys
  const transforms = {};
  for (const col in rawData[0]) {
    transforms[col] = resolveTransform(selectedMode, selectedTransforms[col]);
  }

  for (const record of rawData) {
    if (processedCount % 10000 === 0) {
      ctx.postMessage({
        type: "UPDATE_PROGRESS",
        progress: Math.floor((processedCount / totalCount) * 100)
      });
    }
    const anonymizedRecord = {};
    for (const col in record) {
      const output = transforms[col].process(record[col]);
      if (output !== null) {
        // null means that the column will be dropped
        anonymizedRecord[col] = output;
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
