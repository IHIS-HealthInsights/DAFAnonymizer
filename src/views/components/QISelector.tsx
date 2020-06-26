import React from "react";
import { Select } from "antd";

const QISelector = ({
  fieldNames,
  selectedQuasiIdentifiers,
  setSelectedQuasiIdentifiers,
}) => {
  const filteredOptions = fieldNames.filter(
    (o) => !selectedQuasiIdentifiers.includes(o)
  );
  return (
    <Select
      mode="multiple"
      placeholder="Select Quasi Identifiers (Optional)"
      value={selectedQuasiIdentifiers}
      onChange={(selectedItems) => {
        setSelectedQuasiIdentifiers(selectedItems);
      }}
      size="large"
    >
      {filteredOptions.map((item) => (
        <Select.Option key={item} value={item}>
          {item}
        </Select.Option>
      ))}
    </Select>
  );
};

export default QISelector;
