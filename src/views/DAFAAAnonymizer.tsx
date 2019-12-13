import { useDebounce } from "@react-hook/debounce";
import {
  Button,
  Card,
  Descriptions,
  PageHeader,
  Progress,
  Radio,
  Steps,
  Table,
  Typography
} from "antd";
import Papa from "papaparse";
import React, { useState } from "react";

/* eslint import/no-webpack-loader-syntax: off */
import AnonymizerWorker from "worker-loader!../workers/anonymizer.worker";
import RiskAnalyzerWorker from "worker-loader!../workers/riskAnalyzer.worker";

import { resolveTransform } from "../anonymizer/Transforms";
import FileUploader from "./components/FileUploader";
import TransformSummary from "./components/TransformSummary";
import TransformTypeSelector from "./components/TransformTypeSelector";
import QISelector from "./components/QISelector";
import RiskAnalysisChart from "./components/RiskAnalysisChart";

const anonymizerWorker = new AnonymizerWorker();
const riskAnalyzerWorker = new RiskAnalyzerWorker();

const { Step } = Steps;
const { Title } = Typography;

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
  const [selectedQuasiIdentifiers, setSelectedQuasiIdentifiers] = useState([]);
  const [riskAnalysisPercent, setRiskAnalysisPercent] = useState(100);
  const [riskAnalysisReportData, setRiskAnalysisReportData] = useState();
  const [
    riskAnalysisReportColumnConfig,
    setRiskAnalysisReportColumnConfig
  ] = useState();
  const [riskAnalysisChartData, setRiskAnalysisChartData] = useState();
  const [anonymizeIsLoading, setAnonymizeIsLoading] = useState(false);
  const [previewRiskRecordsK, setPreviewRiskRecordsK] = useState();
  let rawData = [];

  // Derive columns spec from the data
  let columnsConfig = [];
  let colKeys = [];

  if (previewData.length) {
    colKeys = Object.keys(previewData[0]).filter(key => key !== "key");
    columnsConfig = colKeys.map((key, i) => ({
      fixed:
        colKeys.length >= SCROLL_COLUMNS_THRESHOLD && i === 0 ? "left" : null,
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
            // Reset in case there was a previous upload
            setSelectedTransforms({});
            rawData = [];
            setSelectedQuasiIdentifiers([]);
            setRiskAnalysisReportData(undefined);
            setRiskAnalysisChartData(undefined);
            setPreviewRiskRecordsK(undefined);

            setFileReadPercent(100);
            // Add incrementing key to each record for table display
            previewData = previewData.map((d, i) => ({
              ...d,
              key: i
            }));

            setPreviewData(previewData);
            setCurrentStep(1);
          }
        });
      });
    }
  };

  const download = data => {
    // Trigger user download of csv file from Array<object>
    const element = document.createElement("a");
    const file = new Blob(
      [
        Papa.unparse(data, {
          skipEmptyLines: true
        })
      ],
      {
        type: "text/csv"
      }
    );
    element.href = URL.createObjectURL(file);
    element.download = "anonymized.csv";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const anonymizeAndDownload = () => {
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
        download(data.result);
        // Set as complete after DEBOUNCE so that it will not get skipped
        setTimeout(() => setProcessFileTransformPercent(100), DEBOUNCE_MS);
        setAnonymizeIsLoading(false);
      }
    };
  };

  const readFullFile = complete => {
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
      complete: complete
    });
  };

  const onAnonymizeDownload = () => {
    setAnonymizeIsLoading(true);
    if (rawData.length > 0) {
      // Data has already been loaded
      anonymizeAndDownload();
    } else {
      readFullFile(() => {
        // Set as complete after DEBOUNCE so that it will not get skipped
        setTimeout(() => setProcessFileReadPercent(100), DEBOUNCE_MS);
        anonymizeAndDownload();
      });
    }
  };

  const generateRiskReport = () => {
    // Push computation to web worker
    riskAnalyzerWorker.postMessage({
      rawData,
      quasiIdentifiers: selectedQuasiIdentifiers
    });
    // Listen for completion and progress updates
    riskAnalyzerWorker.onmessage = ({ data }) => {
      setRiskAnalysisReportData(data.result);
      const colKeys_qi = [...colKeys];
      // Move selected QI columns to the start of table, and fix the columns
      for (const qi of selectedQuasiIdentifiers.reverse()) {
        colKeys_qi.splice(colKeys_qi.indexOf(qi), 1);
        colKeys_qi.unshift(qi);
      }
      const columnConfig_qi = colKeys_qi.map((key, i) => ({
        fixed:
          colKeys.length >= SCROLL_COLUMNS_THRESHOLD &&
          i < selectedQuasiIdentifiers.length
            ? "left"
            : null,
        width: 120,
        ellipsis: true,
        title:
          i < selectedQuasiIdentifiers.length ? (
            <strong style={{ color: "blue" }}>{key.toUpperCase()}</strong>
          ) : (
            key.toUpperCase()
          ),
        dataIndex: key
      }));
      setRiskAnalysisReportColumnConfig(columnConfig_qi);
      if (data.type === "COMPLETE") {
        const chart = [];
        chart.push({
          id: "RecordLoss",
          data: data.result.recordLoss
        });
        chart.push({
          id: "EqClassLoss",
          data: data.result.eqClassLoss
        });
        setRiskAnalysisChartData(chart);
        setRiskAnalysisPercent(100);
      }
    };
  };

  const onGenerateRiskReport = () => {
    setRiskAnalysisPercent(0);
    if (rawData.length > 0) {
      // Data has already been loaded
      generateRiskReport();
    } else {
      readFullFile(() => {
        // Set as complete after DEBOUNCE so that it will not get skipped
        setTimeout(() => setProcessFileReadPercent(100), DEBOUNCE_MS);
        generateRiskReport();
      });
    }
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
      title: "Apply Transformations",
      content: (
        <Table
          dataSource={previewData}
          columns={columnsConfig}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1000, y: 700 }}
          size="small"
        ></Table>
      )
    },
    {
      index: 2,
      title: "Risk Analysis",
      content: () => {
        let riskPreviewData;
        let riskPreviewDataLength;

        if (riskAnalysisReportData && previewRiskRecordsK) {
          const index = riskAnalysisReportData.kValues.indexOf(
            previewRiskRecordsK
          );
          riskPreviewData = riskAnalysisReportData.samples[index];
          if (riskPreviewData) {
            riskPreviewData = riskPreviewData.map((o, i) => {
              // add incrementing key to make react happy
              o.key = i;
              return o;
            });
            riskPreviewDataLength = riskPreviewData.length;
          }
        }
        return (
          <Card>
            <div style={{ display: "flex" }}>
              <strong
                style={{
                  marginRight: 10,
                  textAlign: "right",
                  marginBottom: 10
                }}
              >
                Quasi Identifiers
              </strong>
              <QISelector
                colKeys={colKeys}
                selectedQuasiIdentifiers={selectedQuasiIdentifiers}
                setSelectedQuasiIdentifiers={setSelectedQuasiIdentifiers}
              />
              <Button
                style={{ marginLeft: 10 }}
                size="large"
                type="primary"
                onClick={onGenerateRiskReport}
                loading={riskAnalysisPercent >= 0 && riskAnalysisPercent < 100}
              >
                Run Analysis
              </Button>
            </div>
            {riskAnalysisChartData ? (
              <div style={{ height: 300, marginBottom: 20 }}>
                <Title level={4}>Risk vs Utility Tradeoff</Title>
                <RiskAnalysisChart
                  data={riskAnalysisChartData}
                  setPreviewRiskRecordsK={setPreviewRiskRecordsK}
                />
              </div>
            ) : null}
            {riskAnalysisReportData && previewRiskRecordsK ? (
              <div style={{ marginTop: 50 }}>
                {riskPreviewDataLength ? (
                  <Title
                    level={4}
                  >{`Preview records with k=${previewRiskRecordsK} (${(
                    (1 / previewRiskRecordsK) *
                    100
                  ).toFixed(
                    1
                  )}% re-identification risk) [${riskPreviewDataLength}/${
                    riskAnalysisReportData.totalRecords
                  }]`}</Title>
                ) : (
                  <Title level={4}>
                    Nothing to preview, no samples or too many unique samples
                  </Title>
                )}
                <Table
                  dataSource={riskPreviewData}
                  columns={riskAnalysisReportColumnConfig}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 1000, y: 300 }}
                  size="small"
                ></Table>
              </div>
            ) : null}
          </Card>
        );
      }
    },
    {
      index: 3,
      title: "Anonymize",
      content: (
        <Card>
          <TransformSummary
            fields={colKeys}
            selectedTransforms={selectedTransforms}
            selectedMode={selectedMode}
          />
          <br />
          <div style={{ display: "flex" }}>
            <div style={{ width: 260, textAlign: "left", paddingLeft: 0 }}>
              <Button
                size="large"
                type="primary"
                icon="download"
                style={{ height: 75 }}
                onClick={onAnonymizeDownload}
                loading={anonymizeIsLoading}
              >
                Anonymize and Download
              </Button>
            </div>
            {processFileReadPercent > 0 ? (
              <Descriptions
                column={1}
                bordered
                size="small"
                style={{ width: "100%", marginLeft: 20 }}
              >
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
          </div>
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
      {steps[currentStep].content instanceof Function
        ? (steps[currentStep].content as Function)()
        : steps[currentStep].content}
    </PageHeader>
  );
};

export default DAFAAAnonymizer;
