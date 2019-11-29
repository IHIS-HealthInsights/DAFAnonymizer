import React from "react";
import Button from "antd/es/button";
import data from "../dummydata/data";
import { Table, Divider, Tag } from "antd";
import AnonTypeSelector from "../components/AnonTypeSelector";

const NRIC_REGEX = /([STFG]\d{7}[A-Z])/;

const highlightSHIPII = text => {
  let matches = [...text.split(NRIC_REGEX)];
  let output = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.length === 0) continue;
    if (match.match(NRIC_REGEX)) {
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
  const columns = [
    {
      key: "key",
      title: (
        <div>
          <strong>NRIC</strong>
          <br />
          <AnonTypeSelector></AnonTypeSelector>
        </div>
      ),
      dataIndex: "nric",
      render: highlightSHIPII
    },
    {
      key: "name",
      title: (
        <div>
          <strong>Name</strong>
          <br />
          <AnonTypeSelector></AnonTypeSelector>
        </div>
      ),
      dataIndex: "name"
    }
  ];
  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey={record => record.key}
    ></Table>
  );
};

export default AnonPreviewer;
