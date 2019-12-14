import { Descriptions, Select, Tag } from "antd";
import React from "react";

import { DEFAULT_KVALUES } from "../../constants";

const KThresholdSelector = ({
  onChange,
  value,
  selectedQuasiIdentifiers,
  riskAnalysisReportData
}) => {
  const enabled = !!riskAnalysisReportData;

  let dropCount = 0;
  if (value !== 0) {
    // 0 = no suppression
    DEFAULT_KVALUES.forEach(k => {
      if (k <= value) {
        dropCount += riskAnalysisReportData.indexes[k].length;
      }
    });
  }

  return (
    <Descriptions
      column={1}
      bordered
      size="small"
      style={{ width: "100%", textAlign: "left" }}
    >
      <Descriptions.Item label="Select Risk Threshold (k-Value)">
        <Select
          style={{ width: 200 }}
          onChange={onChange}
          value={value}
          disabled={!enabled}
        >
          <Select.Option key={0} value={0}>
            No Suppression
          </Select.Option>
          {DEFAULT_KVALUES.map(k => {
            if (k > 1) {
              // 1 is an invalid k value
              return (
                <Select.Option key={k} value={k}>{`${((1 / k) * 100).toFixed(
                  0
                )}% (k≤${k})`}</Select.Option>
              );
            }
            return null;
          })}
        </Select>
        {!enabled ? (
          <div style={{ fontStyle: "italic" }}>
            Record suppression only available after risk analysis has been
            performed
          </div>
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Quasi Identifiers">
        {selectedQuasiIdentifiers.map(qi => (
          <Tag key={qi}>{qi}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Action">
        {value === 0
          ? "No Action"
          : `Delete ${dropCount} records with ≥ ${((1 / value) * 100).toFixed(
              1
            )}% re-identification risk (k≤${value})`}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default KThresholdSelector;
