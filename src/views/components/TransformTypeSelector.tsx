import React from "react";
import { TRANSFORM_TYPES, FIELD_TYPES } from "../../anonymizer/Types";
import { Select } from "antd";
const { Option, OptGroup } = Select;

const TransformTypeSelector = props => {
  return (
    <Select
      showSearch
      placeholder="Select Transformation"
      onChange={props.onTransformTypeChange}
      value={props.value}
      filterOption={(input, option) => {
        if (typeof option.props.children === "object") {
          return (option.props.children as any[]).find(n => {
            return n.props.children.indexOf(input.toLowerCase()) >= 0;
          });
        } else if (typeof option.props.children === "string") {
          return (
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          );
        }
      }}
    >
      <OptGroup label="Transform Types">
        {Object.keys(TRANSFORM_TYPES).map(type => {
          return (
            <Option key={type} value={type}>
              {TRANSFORM_TYPES[type]}
            </Option>
          );
        })}
      </OptGroup>
      <OptGroup label="DAFAA Field Types">
        {Object.keys(FIELD_TYPES).map(type => {
          return (
            <Option key={type} value={type}>
              {FIELD_TYPES[type].display}
            </Option>
          );
        })}
      </OptGroup>
    </Select>
  );
};

export default TransformTypeSelector;
