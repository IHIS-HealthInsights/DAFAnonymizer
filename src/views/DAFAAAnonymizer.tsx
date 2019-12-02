import { Button, PageHeader, Radio, Steps, Table } from "antd";
import Papa from "papaparse";
import React, { useState } from "react";

import Transforms from "../anonymizer/Transforms";
import { ANON_TYPES, FIELD_TYPES } from "../anonymizer/Types";
import AnonTypeSelector from "./components/AnonTypeSelector";
import FileUploader from "./components/FileUploader";

const { Step } = Steps;

const DAFAAAnonymizer = () => {
  const SCROLL_COLUMNS_THRESHOLD = 5;
  const [previewData, setPreviewData] = useState([]);
  const [anonTypes, setAnonTypes] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [previewCount, setPreviewCount] = useState(100);
  const [hasHeader, setHasHeader] = useState(true);
  const [selectedMode, setSelectedMode] = useState("modeB");
  let columnsConfig = [];

  // Derive columns spec from the data
  if (previewData.length) {
    const colKeys = Object.keys(previewData[0]).filter(key => key !== "key");
    const isFixedMode = colKeys.length >= SCROLL_COLUMNS_THRESHOLD;
    columnsConfig = colKeys.map((key, i) => ({
      fixed: isFixedMode && i === 0 ? "left" : null,
      width: isFixedMode && i === 0 ? 200 : undefined,
      ellipsis: true,
      title: (
        <div style={{ width: "100%" }}>
          <strong>{key.toUpperCase()}</strong>
          <br />
          <AnonTypeSelector
            onAnonTypeChange={value =>
              setAnonTypes({
                ...anonTypes,
                [key]: value
              })
            }
          />
        </div>
      ),
      dataIndex: key,
      render: text => {
        let selectedFilter = anonTypes[key];
        if (FIELD_TYPES[selectedFilter]) {
          selectedFilter = FIELD_TYPES[selectedFilter][selectedMode];
        }
        // If no option supplied or Transform not specified
        if (!selectedFilter || !Transforms[selectedFilter]) {
          return Transforms[ANON_TYPES.NONE](text);
        }
        return Transforms[selectedFilter](text);
      }
    }));
  }

  const fileUploaderProps = {
    accept: ".csv",
    multiple: false,
    previewCount,
    setPreviewCount,
    hasHeader,
    setHasHeader,
    // Make use of transformFile hook to read, transform, and setPreviewData on Previewer component
    // If `resolve` is not called, data will not be uploaded
    transformFile(file) {
      return new Promise(resolve => {
        Papa.parse(file, {
          header: hasHeader,
          preview: previewCount,
          complete: ({ data, errors, meta }) => {
            if (errors.length) {
              console.error(errors);
              alert("Failed to parse CSV file");
              return;
            }

            if (!data.length) {
              alert("CSV file is empty");
              return;
            }

            if (!hasHeader) {
              // Convert 2d array into objects with generated header
              const numCols = data[0].length;
              data = data.map(row => {
                const d = {};
                for (let i = 0; i < numCols; i++) {
                  d[`Column${i + 1}`] = row[i];
                }
                return d;
              });
            }

            // Add incrementing key to each record
            data = data.map((d, i) => ({ ...d, key: i }));

            setPreviewData(data);
            setCurrentStep(1);
          }
        });
      });
    }
  };

  const steps = [
    {
      index: 0,
      title: "Upload CSV",
      content: <FileUploader {...fileUploaderProps} />
    },
    {
      index: 1,
      title: "Apply Filters",
      content: (
        <Table
          dataSource={previewData}
          columns={columnsConfig}
          rowKey={record => record.key}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1000, y: 700 }}
        ></Table>
      )
    },
    {
      index: 2,
      title: "Anonymize",
      content: null
    }
  ];

  const getStepStatus = (step, currentStep) => {
    if (step === currentStep) return "process";
    else if (step < currentStep) return "finish";
    else if (step > currentStep) return "wait";
  };

  return (
    <PageHeader
      ghost={false}
      title="DAFAA Anonymizer"
      subTitle=""
      extra={[
        <strong key="dafaalabel">DAFAA Mode</strong>,
        <Radio.Group
          key="dafaamode"
          defaultValue="modeB"
          style={{ marginRight: 60 }}
          onChange={e => setSelectedMode(e.target.value)}
        >
          <Radio.Button value="modeA">Mode A</Radio.Button>
          <Radio.Button value="modeB">Mode B</Radio.Button>
        </Radio.Group>,

        <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
          Previous
        </Button>,
        <Button
          key="next"
          type="primary"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Next
        </Button>
      ]}
    >
      <Steps
        type="navigation"
        size="small"
        current={currentStep}
        style={{
          marginBottom: 4,
          boxShadow: "0px -1px 0 0 #e8e8e8 inset"
        }}
      >
        {steps.map(step => (
          <Step
            key={step.index}
            status={getStepStatus(step.index, currentStep)}
            title={step.title}
            onClick={() => {
              setCurrentStep(step.index);
            }}
          />
        ))}
      </Steps>
      {steps[currentStep].content}
    </PageHeader>
  );
};

export default DAFAAAnonymizer;
