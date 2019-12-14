import { resolveTransform } from "../anonymizer/Transforms";
import Papa from "papaparse";

// This is required for worker-loader - typescript integration
import "./custom.d";

const ctx: Worker = self as any;
const encode = TextEncoder.prototype.encode.bind(new TextEncoder());

ctx.onmessage = event => {
  const {
    file,
    hasHeader,
    selectedTransforms,
    selectedMode,
    dropIndexes
  } = event.data;

  let isFirstChunk = true;
  let transforms = {};

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

      // Resolve transformations to be applied once, assume that every record has the same keys
      if (isFirstChunk) {
        for (const col in data[0]) {
          transforms[col] = resolveTransform(
            selectedMode,
            selectedTransforms[col]
          );
        }
      }

      data = anonymize(data, transforms, dropIndexes);

      let lines = Papa.unparse(data, {
        skipEmptyLines: true,
        header: isFirstChunk
      });
      if (!lines.endsWith("\n")) {
        lines += "\n";
      }

      ctx.postMessage({
        type: "NEW_CHUNK",
        chunk: encode(lines)
      });

      isFirstChunk = false;

      ctx.postMessage({
        type: "PROGRESS",
        progress: Math.round((meta.cursor / file.size) * 100)
      });
    },
    complete: () => {
      ctx.postMessage({
        type: "COMPLETE"
      });
    }
  });
};

function anonymize(
  data: Record<string, any>[],
  transforms,
  dropIndexes
): Record<string, any>[] {
  return data
    .filter((_, i) => {
      return !dropIndexes.includes(i);
    })
    .map(record => {
      const anonymizedRecord = {};
      for (const col in record) {
        const output = transforms[col].process(record[col]);
        if (output !== null) {
          // null means that the column will be dropped
          anonymizedRecord[col] = output;
        }
      }
      return anonymizedRecord;
    });
}
