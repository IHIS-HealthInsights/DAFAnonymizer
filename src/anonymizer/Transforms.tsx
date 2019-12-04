import React from "react";
import * as CryptoJS from "crypto-js";
import { TRANSFORM_TYPES } from "./Types";
import * as Matchers from "./Matchers";

const key = CryptoJS.lib.WordArray.random(16);
const iv = CryptoJS.lib.WordArray.random(16);

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
      let matches = [...text.split(Matchers.NRIC)];
      let output = [];
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.length === 0) continue;
        if (match.match(Matchers.NRIC)) {
          output.push(
            <span key={i} style={{ backgroundColor: "yellow" }}>
              {match}
            </span>
          );
        } else {
          output.push(<span key={i}>{match}</span>);
        }
      }
      return <div>{output}</div>;
    },
    process: function(text) {
      return text;
    }
  },
  [TRANSFORM_TYPES.ENCRYPT]: {
    _encrypt: function(text) {
      return CryptoJS.AES.encrypt(text, key, { iv: iv }).toString();
    },
    preview: function(text) {
      return (
        <span style={{ fontStyle: "italic", color: "blue" }}>
          {this._encrypt(text)}
        </span>
      );
    },
    process: function(text) {
      return this._encrypt(text);
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

export default Transforms;
