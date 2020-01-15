import { Table } from "antd";
import React from "react";

import { resolveTransformStr } from "../../anonymizer/Transforms";
import { FIELD_TYPES, TRANSFORM_TYPES } from "../../anonymizer/Types";

const TransformSummary = ({
  selectedTransforms,
  selectedMode,
  fieldNames,
  saltMap
}) => {
  const data = [];
  const columns = [
    {
      title: "Field Name",
      dataIndex: "fieldName",
      render: text => <strong>{text}</strong>
    },
    {
      title: "DAFAA Field Type",
      dataIndex: "fieldType"
    },
    {
      title: "Transformation To Apply",
      dataIndex: "transformType"
    },
    {
      title: "Args",
      dataIndex: "args",
      render: text => <span style={{ fontFamily: "monospace" }}>{text}</span>
    }
  ];
  for (const field of fieldNames) {
    let fieldOrTransformType =
      selectedTransforms[field] || TRANSFORM_TYPES.NONE;
    const d = {
      key: field,
      fieldName: field,
      fieldType: FIELD_TYPES[fieldOrTransformType] ? (
        fieldOrTransformType
      ) : (
        <span style={{ fontStyle: "italic", color: "grey" }}>Unspecified</span>
      ),
      transformType: resolveTransformStr(selectedMode, fieldOrTransformType)
    };
    if (saltMap[field]) {
      d["args"] = `salt: ${saltMap[field]}`;
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
