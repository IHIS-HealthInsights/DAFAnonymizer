import React from "react";
import { Select } from "antd";

const QISelector = ({
  colKeys,
  selectedQuasiIdentifiers,
  setSelectedQuasiIdentifiers
}) => {
  const filteredOptions = colKeys.filter(
    o => !selectedQuasiIdentifiers.includes(o)
  );
  return (
    <Select
      mode="multiple"
      placeholder="Select multiple"
      value={selectedQuasiIdentifiers}
      onChange={selectedItems => {
        setSelectedQuasiIdentifiers(selectedItems);
      }}
      size="large"
    >
      {filteredOptions.map(item => (
        <Select.Option key={item} value={item}>
          {item}
        </Select.Option>
      ))}
    </Select>
  );
};

export default QISelector;
