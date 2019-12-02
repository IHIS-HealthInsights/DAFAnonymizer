import React from "react";
import { ANON_TYPES, FIELD_TYPES } from "../../anonymizer/Types";
import { Select } from "antd";
const { Option, OptGroup } = Select;

const AnonTypeSelector = props => {
  return (
    <Select
      showSearch
      placeholder="Select Filter"
      onChange={props.onAnonTypeChange}
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
        {Object.keys(ANON_TYPES).map(type => {
          return (
            <Option key={type} value={type}>
              {ANON_TYPES[type]}
            </Option>
          );
        })}
      </OptGroup>
      <OptGroup label="Field Types">
        {Object.keys(FIELD_TYPES).map(type => {
          return (
            <Option key={type} value={type}>
              {FIELD_TYPES[type]}
            </Option>
          );
        })}
      </OptGroup>
    </Select>
  );
};

export default AnonTypeSelector;
