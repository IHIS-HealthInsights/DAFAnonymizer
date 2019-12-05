import { Table } from "antd";
import React from "react";

import { resolveTransformStr } from "../../anonymizer/Transforms";
import { FIELD_TYPES, TRANSFORM_TYPES } from "../../anonymizer/Types";

const TransformSummary = ({ selectedTransforms, selectedMode, fields }) => {
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
    }
  ];
  for (const field of fields) {
    let fieldOrTransformType =
      selectedTransforms[field] || TRANSFORM_TYPES.NONE;
    data.push({
      key: field,
      fieldName: field,
      fieldType: FIELD_TYPES[fieldOrTransformType] ? (
        fieldOrTransformType
      ) : (
        <span style={{ fontStyle: "italic", color: "grey" }}>Unspecified</span>
      ),
      transformType: resolveTransformStr(selectedMode, fieldOrTransformType)
    });
  }
  return <Table dataSource={data} columns={columns} pagination={false}></Table>;
};

export default TransformSummary;
