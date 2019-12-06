import { useDebounce } from "@react-hook/debounce";
import {
  Button,
  Card,
  Descriptions,
  PageHeader,
  Progress,
  Radio,
  Steps,
  Table
} from "antd";
import Papa from "papaparse";
import React, { useState } from "react";
/* eslint import/no-webpack-loader-syntax: off */
import AnonymizerWorker from "worker-loader!../workers/anonymizer.worker";

import { resolveTransform } from "../anonymizer/Transforms";
import FileUploader from "./components/FileUploader";
import TransformSummary from "./components/TransformSummary";
import TransformTypeSelector from "./components/TransformTypeSelector";

const anonymizerWorker = new AnonymizerWorker();

const { Step } = Steps;

const DAFAAAnonymizer = () => {
  const DEBOUNCE_MS = 100;
  const SCROLL_COLUMNS_THRESHOLD = 5;
  const [userFile, setUserFile] = useState();
  const [fileReadPercent, setFileReadPercent] = useDebounce(
    0,
    DEBOUNCE_MS,
    true
  );
  const [processFileReadPercent, setProcessFileReadPercent] = useDebounce(
    0,
    DEBOUNCE_MS,
    true
  );
  const [
    processFileTransformPercent,
    setProcessFileTransformPercent
  ] = useDebounce(0, DEBOUNCE_MS, true);
  const [previewData, setPreviewData] = useState([]);
  const [selectedTransforms, setSelectedTransforms] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [previewCount, setPreviewCount] = useState(100);
  const [hasHeader, setHasHeader] = useState(true);
  const [selectedMode, setSelectedMode] = useState("modeB");

  // Derive columns spec from the data
  let columnsConfig = [];
  let colKeys = [];

  if (previewData.length) {
    colKeys = Object.keys(previewData[0]).filter(key => key !== "key");
    const isFixedMode = colKeys.length >= SCROLL_COLUMNS_THRESHOLD;
    columnsConfig = colKeys.map((key, i) => ({
      fixed: isFixedMode && i === 0 ? "left" : null,
      width: 250,
      ellipsis: true,
      title: (
        <div style={{ width: "100%" }}>
          <strong>{key.toUpperCase()}</strong>
          <br />
          <TransformTypeSelector
            value={selectedTransforms[key]}
            onTransformTypeChange={value =>
              setSelectedTransforms({
                ...selectedTransforms,
                [key]: value
              })
            }
          />
        </div>
      ),
      dataIndex: key,
      render: text =>
        resolveTransform(selectedMode, selectedTransforms[key]).preview(text)
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
      setUserFile(file);
      let previewData = [];
      let readRowsCount = 0;

      return new Promise(resolve => {
        Papa.parse(file, {
          header: hasHeader,
          preview: previewCount,
          skipEmptyLines: true,
          chunk: ({ data, errors, meta }) => {
            if (!data.length) {
              alert("CSV file is empty");
              return;
            }

            if (errors.length) {
              console.error(errors);
              alert("Failed to parse CSV file");
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

            setProcessFileReadPercent(
              Math.round((readRowsCount / previewCount) * 100)
            );
            previewData = previewData.concat(data);
          },
          complete: () => {
            setSelectedTransforms({}); // Reset in case there was a previous upload
            setFileReadPercent(100);
            // Add incrementing key to each record
            previewData = previewData.map((d, i) => ({ ...d, key: i }));

            setPreviewData(previewData);
            setCurrentStep(1);
          }
        });
      });
    }
  };

  const onAnonymizeDownload = () => {
    let rawData = [];
    Papa.parse(userFile, {
      skipEmptyLines: true,
      header: hasHeader,
      worker: true,
      chunk: ({ data, errors, meta }) => {
        if (!data.length) {
          alert("CSV file is empty");
          return;
        }

        if (errors.length) {
          console.error(errors);
          alert("Failed to write CSV file");
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
        setProcessFileReadPercent(
          Math.round((meta.cursor / userFile.size) * 100)
        );
        rawData = rawData.concat(data);
      },
      complete: () => {
        // Set as complete after DEBOUNCE so that it will not get skipped
        setTimeout(() => setProcessFileReadPercent(100), DEBOUNCE_MS);
        setProcessFileTransformPercent(0);
        // Push computation to web worker
        anonymizerWorker.postMessage({
          rawData,
          selectedTransforms,
          selectedMode
        });
        // Listen for completion and progress updates
        anonymizerWorker.onmessage = ({ data }) => {
          if (data.type === "UPDATE_PROGRESS") {
            setProcessFileTransformPercent(data.progress);
          } else if (data.type === "COMPLETE") {
            console.log("Anonymizing complete");
            const anonymizedData = data.result;
            // Trigger user download
            const element = document.createElement("a");
            const file = new Blob(
              [
                Papa.unparse(anonymizedData, {
                  skipEmptyLines: true
                })
              ],
              {
                type: "text/csv"
              }
            );
            element.href = URL.createObjectURL(file);

            // Set as complete after DEBOUNCE so that it will not get skipped
            setTimeout(() => setProcessFileTransformPercent(100), DEBOUNCE_MS);

            element.download = "anonymized.csv";
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
          }
        };
      }
    });
  };

  const steps = [
    {
      index: 0,
      title: "Upload CSV",
      content: (
        <FileUploader {...fileUploaderProps} progress={fileReadPercent} />
      )
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
      content: (
        <Card>
          <TransformSummary
            fields={colKeys}
            selectedTransforms={selectedTransforms}
            selectedMode={selectedMode}
          />
          <br />
          <table style={{ width: "100%", tableLayout: "fixed" }}>
            <tbody>
              <tr>
                <td style={{ width: 260, textAlign: "left", paddingLeft: 0 }}>
                  <Button
                    size="large"
                    type="primary"
                    icon="download"
                    style={{ height: 75 }}
                    onClick={onAnonymizeDownload}
                    loading={
                      processFileReadPercent > 0 &&
                      processFileTransformPercent < 100
                    }
                  >
                    Anonymize and Download
                  </Button>
                </td>
                <td>
                  {processFileReadPercent > 0 ? (
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="File Read Progress">
                        <Progress
                          strokeColor={{
                            from: "#108ee9",
                            to: "#87d068"
                          }}
                          percent={processFileReadPercent}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="Anonymization Progress">
                        <Progress
                          strokeColor={{
                            from: "#108ee9",
                            to: "#87d068"
                          }}
                          percent={processFileTransformPercent}
                        />
                      </Descriptions.Item>
                    </Descriptions>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      )
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

        <Button
          key="prev"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Previous
        </Button>,
        <Button
          key="next"
          type="primary"
          disabled={currentStep === steps.length - 1}
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
