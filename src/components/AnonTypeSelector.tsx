import React from "react";
import { Select } from "antd";

const { Option } = Select;

function onChange(value) {
  console.log(`selected ${value}`);
}

function onBlur() {
  console.log("blur");
}

function onFocus() {
  console.log("focus");
}

function onSearch(val) {
  console.log("search:", val);
}

const ANON_TYPES = {
  NAME: "NAME",
  NRIC: "NRIC"
};

const AnonTypeSelector = () => {
  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Field Type"
      optionFilterProp="children"
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      // onSearch={onSearch}
      filterOption={(input, option) =>
        (option.props.children as string)
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      }
    >
      {Object.keys(ANON_TYPES).map(type => {
        return (
          <Option key={type} value={type}>
            {type}
          </Option>
        );
      })}
    </Select>
  );
};

export default AnonTypeSelector;
