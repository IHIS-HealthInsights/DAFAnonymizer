import React, { useState } from "react";
import data from "../dummydata/data";
import { Table } from "antd";
import AnonTypeSelector from "./components/AnonTypeSelector";
import Transforms from "../anonymizer/Transforms";
import * as Matchers from "../anonymizer/Matchers";

const highlightSHIPII = text => {
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
};

const AnonPreviewer = () => {
  // Derive columns spec from the data
  const colKeys = Object.keys(data[0]).filter(key => key !== "key");
  const initialState = {};
  for (const key of colKeys) {
    initialState[key] = "OTHER";
  }
  const [anonTypes, setAnonTypes] = useState(initialState);
  const columns = colKeys.map((key, i) => ({
    ellipsis: true,
    title: (
      <div>
        <strong>{key.toUpperCase()}</strong>
        <br />
        <AnonTypeSelector
          onAnonTypeChange={value =>
            setAnonTypes({ ...anonTypes, [key]: value })
          }
        />
      </div>
    ),
    dataIndex: key,
    render: text => {
      return [Transforms[anonTypes[key]], highlightSHIPII].reduce(
        (prev, fn) => fn(prev),
        text
      );
    }
  }));

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey={record => record.key}
    ></Table>
  );
};

export default AnonPreviewer;
