import React, { useState } from "react";
import { Input, Button } from "antd";
const { TextArea } = Input;

const SaltMapInput = ({ setSaltMap, saltMap }) => {
  const [saltString, setSaltString] = useState(
    JSON.stringify(saltMap, null, 2)
  );
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <div style={{ textAlign: "left" }}>
      <p>
        <strong>Apply Custom Salt for hashing</strong>
        <br />
        <span>
          A random salt has been generated for each field you want to
          pseudonymize. You may override the defaults by editing the salt values
          in the JSON dictionary.
        </span>
      </p>
      <TextArea
        style={{ fontFamily: "monospace", color: isInvalid ? "red" : null }}
        rows={4}
        value={saltString}
        onChange={e => setSaltString(e.target.value)}
      />
      <Button
        style={{ marginTop: 10 }}
        size="small"
        type="primary"
        onClick={() => {
          try {
            const saltMap = JSON.parse(saltString);
            setSaltMap(saltMap);
            setIsInvalid(false);
            setSaltString(JSON.stringify(saltMap, null, 2));
          } catch (e) {
            if (e instanceof SyntaxError) {
              setIsInvalid(true);
              alert(e.message);
            }
          }
        }}
        disabled={saltString.length === 0}
      >
        Update
      </Button>
    </div>
  );
};

export default SaltMapInput;
