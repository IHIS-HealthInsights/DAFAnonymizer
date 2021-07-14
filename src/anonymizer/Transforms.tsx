import * as CryptoJS from "crypto-js";
import React from "react";

import { Matcher, NricMatcher, SHIMatcher, TelephoneMatcher } from "./Matchers";
import { FIELD_TYPES, TRANSFORM_TYPES } from "./Types";
import { FIXED_IV } from "src/constants";

interface ITransform {
  preview: (text: string, args: Record<string, any>) => React.ReactNode;
  process: (text: string, args: Record<string, any>) => string | null;
  // Optionally define additional helper functions
  // The other functions should use function() instead of arrow functions,
  // in order to access internal functions on `this`
  [_internal: string]: any;
}

const Transforms: Record<string, ITransform> = {
  [TRANSFORM_TYPES.NONE]: {
    preview: function (text) {
      // Match and highlight sensitive values
      const matchers: Matcher[] = [
        new NricMatcher(),
        new SHIMatcher(),
        new TelephoneMatcher(),
      ];
      let matches = [];
      for (let m of matchers) {
        matches = matches.concat(m.match(text));
      }

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
    process: function (text) {
      return text;
    },
  },
  [TRANSFORM_TYPES.DEIDENTIFY]: {
    _hash: function (text) {
      return CryptoJS.SHA256(text).toString();
    },
    preview: function (text, args) {
      return (
        <span style={{ fontStyle: "italic", color: "blue" }}>
          To be hashed with TTP's salt
          {/* {`${this._hash(text + args.salt || "").substring(
            0,
            args.output_len
          )}...`} */}
        </span>
      );
    },
    process: function (text, args) {
      if (Object.is(args.output_len, undefined)) {
        return this._hash(text + args.salt || "");
      }
      return this._hash(text + args.salt || "").substring(0, args.output_len);
    },
  },
  [TRANSFORM_TYPES.ENCRYPT]: {
    _encrypt: function (text, passphrase) {
      // Use passphrase to determistically generate actual key
      // We will also use a deterministic IV so that each identifer is encrypted
      // into the same ciphertext.
      const key256Bits = CryptoJS.PBKDF2(passphrase, FIXED_IV, {
        keySize: 256 / 32,
      });
      const e = CryptoJS.AES.encrypt(text, key256Bits, {
        iv: FIXED_IV,
        mode: CryptoJS.mode.CBC,
      });
      return e.toString();
    },
    preview: function (text, args) {
      return (
        <span style={{ fontStyle: "italic", color: "blue" }}>
          {this._encrypt(text, args.passphrase)}
        </span>
      );
    },
    process: function (text, args) {
      return this._encrypt(text, args.passphrase);
    },
  },
  [TRANSFORM_TYPES.DECRYPT]: {
    _decrypt: function (ciphertext, passphrase) {
      const plaintext = CryptoJS.AES.decrypt(
        ciphertext,
        CryptoJS.PBKDF2(passphrase, FIXED_IV, {
          keySize: 256 / 32,
        }),
        {
          iv: FIXED_IV,
          mode: CryptoJS.mode.CBC,
        }
      );
      try {
        return plaintext.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        return "Malformed String - Passphrase is likely incorrect";
      }
    },
    preview: function (text, args) {
      return (
        <span style={{ fontStyle: "italic", color: "blue" }}>
          {this._decrypt(text, args.passphrase)}
        </span>
      );
    },
    process: function (text, args) {
      return this._decrypt(text, args.passphrase);
    },
  },
  [TRANSFORM_TYPES.REMOVE]: {
    preview: function (text) {
      return (
        <span style={{ textDecoration: "line-through", color: "grey" }}>
          {text}
        </span>
      );
    },
    process: function () {
      return null;
    },
  },
  [TRANSFORM_TYPES.TRUNCATE_RIGHT]: {
    preview: function (text, args) {
      return (
        <div>
          <span>{text.substring(0, text.length - args.num_chars)}</span>{" "}
          <span style={{ textDecoration: "line-through", color: "grey" }}>
            {text.substring(text.length - args.num_chars, text.length)}
          </span>
        </div>
      );
    },
    process: function (text, args) {
      return text.substring(0, text.length - args.num_chars);
    },
  },
  [TRANSFORM_TYPES.TRUNCATE_LEFT]: {
    preview: function (text, args) {
      return (
        <div>
          <span style={{ textDecoration: "line-through", color: "grey" }}>
            {text.substring(0, args.num_chars)}
          </span>
          <span>{text.substring(args.num_chars, text.length)}</span>{" "}
        </div>
      );
    },
    process: function (text, args) {
      return text.substring(args.num_chars, text.length);
    },
  },
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
