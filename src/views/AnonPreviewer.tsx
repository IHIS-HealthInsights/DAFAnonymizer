import React, { useState } from "react";
import data from "../dummydata/data";
import { Table } from "antd";
import AnonTypeSelector from "./components/AnonTypeSelector";
import Transforms from "../anonymizer/Transforms";

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
    render: Transforms[anonTypes[key]]
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
