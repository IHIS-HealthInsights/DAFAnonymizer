import * as CryptoJS from "crypto-js";
import React from "react";

import * as Matchers from "./Matchers";
import { FIELD_TYPES, TRANSFORM_TYPES } from "./Types";

interface ITransform {
  preview: (text: String, args?: any[]) => React.ReactNode;
  process: (text: String, args?: any[]) => String | null;
  // Optionally define additional helper functions
  // The other functions should use function() instead of arrow functions,
  // in order to access internal functions on `this`
  [_internal: string]: any;
}

const Transforms: Record<string, ITransform> = {
  [TRANSFORM_TYPES.NONE]: {
    preview: function(text) {
      // Match and highlight sensitive values
      const matches = new Matchers.NricMatcher().match(text);

      if (!matches.length) return text;
      const output = [];
      let curIndex = 0;

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        output.push(
          <span key={i + matches.length}>
            {text.substring(curIndex, match.start)}
          </span>
        );

        output.push(
          <span key={i} style={{ backgroundColor: "yellow" }}>
            {text.substring(match.start, match.end)}
          </span>
        );
        curIndex = match.end;
      }
      output.push(
        <span key="last">{text.substring(curIndex, text.length)}</span>
      );
      return output;
    },
    process: function(text) {
      return text;
    }
  },
  [TRANSFORM_TYPES.PSEUDONYMIZE]: {
    _hash: function(text) {
      return CryptoJS.SHA256(text).toString();
    },
    preview: function(text) {
      return (
        <span style={{ fontStyle: "italic", color: "blue" }}>
          {`${this._hash(text).substring(0, 12)}...`}
        </span>
      );
    },
    process: function(text) {
      return this._hash(text);
    }
  },
  [TRANSFORM_TYPES.REMOVE]: {
    preview: function(text) {
      return (
        <span style={{ textDecoration: "line-through", color: "grey" }}>
          {text}
        </span>
      );
    },
    process: function() {
      return null;
    }
  },
  [TRANSFORM_TYPES.SUPPRESS]: {
    preview: function(text) {
      return <span>Add Random Noise</span>;
    },
    process: function() {
      return null;
    }
  }
};

export const resolveTransformStr = (
  mode: string,
  transformOrFieldType?: string
): string => {
  if (!transformOrFieldType) return TRANSFORM_TYPES.NONE;

  if (FIELD_TYPES[transformOrFieldType]) {
    return FIELD_TYPES[transformOrFieldType][mode] || TRANSFORM_TYPES.NONE;
  } else if (TRANSFORM_TYPES[transformOrFieldType]) {
    return transformOrFieldType;
  } else {
    return TRANSFORM_TYPES.NONE;
  }
};

export const resolveTransform = (
  mode: string,
  transformOrFieldType?: string
): ITransform => {
  return (
    Transforms[resolveTransformStr(mode, transformOrFieldType)] ||
    Transforms[TRANSFORM_TYPES.NONE]
  );
};

export default Transforms;
