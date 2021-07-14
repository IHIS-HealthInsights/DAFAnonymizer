import React, { useState } from "react";
import { Input } from "antd";
const { TextArea } = Input;

const SaltMapInput = ({ setSaltMap, saltMap }) => {
  const [saltString, setSaltString] = useState(
    JSON.stringify(saltMap, null, 2)
  );
  const [error, setError] = useState(null);
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <div style={{ textAlign: "left" }}>
      <p>
        <strong>Apply Secret Salt</strong>
        <br />
        <span>
          A secret salt must be provided for each field you want to de-identify,
          by editing the values in the JSON configuration below.
        </span>
        <br />
        <strong style={{ color: "red" }}>Important Note:</strong>
        <span>
          &nbsp;Keep a copy of the salts used for hashing, in order to replicate
          the process with a different dataset for subsequent merging.
        </span>
      </p>
      {error ? <span style={{ color: "red" }}>{error}</span> : null}
      <TextArea
        style={{ fontFamily: "monospace", color: isInvalid ? "red" : null }}
        rows={4}
        value={saltString}
        onChange={(e) => {
          const saltString = e.target.value;
          setError(null);
          try {
            const saltMap = JSON.parse(saltString);
            setSaltMap(saltMap);
            setIsInvalid(false);
            setSaltString(JSON.stringify(saltMap, null, 2));
          } catch (e) {
            if (e instanceof SyntaxError) {
              setIsInvalid(true);
              setError(e.message);
              setSaltString(saltString);
            }
          }
        }}
      />
    </div>
  );
};

export default SaltMapInput;
