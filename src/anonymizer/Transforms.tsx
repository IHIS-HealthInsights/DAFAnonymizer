import React from "react";
import * as CryptoJS from "crypto-js";
import { ANON_TYPES } from "./Types";
import * as Matchers from "./Matchers";

const key = CryptoJS.lib.WordArray.random(16);
const iv = CryptoJS.lib.WordArray.random(16);

const Transforms: Record<string, (text: String) => React.ReactNode> = {
  [ANON_TYPES.NONE]: text => {
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
  [ANON_TYPES.ENCRYPT]: text => (
    <span style={{ fontStyle: "italic", color: "blue" }}>
      {CryptoJS.AES.encrypt(text, key, { iv: iv }).toString()}
    </span>
  ),
  [ANON_TYPES.REMOVE]: text => (
    <span style={{ textDecoration: "line-through", color: "grey" }}>
      {text}
    </span>
  ),
  [ANON_TYPES.SUPPRESS]: text => <span>Add Random Noise</span>
};

export default Transforms;
