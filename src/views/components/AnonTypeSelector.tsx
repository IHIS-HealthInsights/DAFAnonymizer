import React from "react";
import ANON_TYPES from "../../anonymizer/AnonTypes";
import { Select } from "antd";
const { Option } = Select;

const AnonTypeSelector = props => {
  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Field Type"
      optionFilterProp="children"
      onChange={props.onAnonTypeChange}
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
