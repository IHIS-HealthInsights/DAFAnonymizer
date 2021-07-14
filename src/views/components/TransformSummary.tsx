import { Table } from "antd";
import React from "react";

import { resolveTransformStr } from "../../anonymizer/Transforms";
import { TRANSFORM_TYPES } from "../../anonymizer/Types";

const TransformSummary = ({
  selectedTransforms,
  selectedMode,
  fieldNames,
  args,
}) => {
  const data = [];
  const columns = [
    {
      title: "Field Name",
      dataIndex: "fieldName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Transformation To Apply",
      dataIndex: "transformType",
    },
    {
      title: "Args",
      dataIndex: "args",
      render: (text) => <span style={{ fontFamily: "monospace" }}>{text}</span>,
    },
  ];
  for (const field of fieldNames) {
    let fieldOrTransformType =
      selectedTransforms[field] || TRANSFORM_TYPES.NONE;
    const d = {
      key: field,
      fieldName: field,
      transformType: resolveTransformStr(selectedMode, fieldOrTransformType),
    };

    // display args for each field, if exist
    if (args[field]) {
      d["args"] = JSON.stringify(args[field]);
    }

    data.push(d);
  }
  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      size="middle"
    ></Table>
  );
};

export default TransformSummary;
