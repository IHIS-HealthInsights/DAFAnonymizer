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
import KThresholdSelector from "./components/KThresholdSelector";
import QISelector from "./components/QISelector";
import RiskAnalysisChart from "./components/RiskAnalysisChart";
import TransformSummary from "./components/TransformSummary";
import TransformTypeSelector from "./components/TransformTypeSelector";
import streamSaver from "streamsaver";

const anonymizerWorker = new AnonymizerWorker();
const riskAnalyzerWorker = new RiskAnalyzerWorker();

const { Step } = Steps;
const { Title } = Typography;

let rawData = []; // This could potentially be large, do not store in React state

const DAFAAAnonymizer = () => {
  const DEBOUNCE_MS = 100;
  const SCROLL_COLUMNS_THRESHOLD = 5;
  const COLUMN_WIDTH = 250;

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
  const [riskAnalysisPercent, setRiskAnalysisPercent] = useDebounce(
    0,
    DEBOUNCE_MS,
    true
  );
  const [riskAnalysisReportData, setRiskAnalysisReportData] = useState();
  const [
    riskAnalysisReportColumnConfig,
    setRiskAnalysisReportColumnConfig
  ] = useState();
  const [riskAnalysisChartData, setRiskAnalysisChartData] = useState();
  const [anonymizeIsLoading, setAnonymizeIsLoading] = useState(false);
  const [riskAnalysisIsLoading, setRiskAnalysisIsLoading] = useState(false);
  const [previewRiskRecordsK, setPreviewRiskRecordsK] = useState();
  const [fieldNames, setFieldNames] = useState([]);
  const [selectedKThreshold, setSelectedKThreshold] = useState(0);

  /**
   * Define shared functions between different views
   */

  const reset = () => {
    rawData = [];
    setSelectedTransforms({});
    setSelectedQuasiIdentifiers([]);
    setProcessFileReadPercent(0);
    setProcessFileTransformPercent(0);
    setRiskAnalysisPercent(0);
    setRiskAnalysisReportData(undefined);
    setRiskAnalysisChartData(undefined);
    setRiskAnalysisReportColumnConfig(undefined);
    setAnonymizeIsLoading(false);
    setRiskAnalysisIsLoading(false);
    setPreviewRiskRecordsK(undefined);
    setSelectedKThreshold(0);
    setPreviewRiskRecordsK(undefined);
    setFieldNames([]);
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

  /**
   * Define separate components rendered as steps
   */
  interface StepDefinition {
    title: string;
    content: () => React.ReactNode;
    index?: number; // nullable, assign after order is fixed
  }

  const Step_UploadCSV: StepDefinition = {
    title: "Upload CSV",
    content: () => {
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
                reset();

                setFileReadPercent(100);
                // Add incrementing key to each record for table display
                previewData = previewData.map((d, i) => ({
                  ...d,
                  key: i
                }));

                setPreviewData(previewData);
                setCurrentStep(1);
                if (previewData.length) {
                  setFieldNames(
                    Object.keys(previewData[0]).filter(key => key !== "key")
                  );
                }
              }
            });
          });
        }
      };
      return <FileUploader {...fileUploaderProps} progress={fileReadPercent} />;
    }
  };

  const Step_ApplyTransformations: StepDefinition = {
    title: "Apply Transformations",
    content: () => {
      // Derive columns spec from the data
      let columnsConfig = [];
      const isFixed = fieldNames.length >= SCROLL_COLUMNS_THRESHOLD;
      if (previewData.length) {
        columnsConfig = fieldNames.map((key, i) => ({
          fixed: isFixed && i === 0 ? "left" : null,
          width: COLUMN_WIDTH,
          ellipsis: false, // do word wrapping instead
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
          render: text => (
            <div
              style={{
                width: COLUMN_WIDTH - 20
              }}
            >
              {resolveTransform(selectedMode, selectedTransforms[key]).preview(
                text
              )}
            </div>
          )
        }));
      }
      return (
        <Table
          dataSource={previewData}
          columns={columnsConfig}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1000, y: 700 }}
          size="middle"
        ></Table>
      );
    }
  };

  const Step_RiskAnalysis: StepDefinition = {
    title: "Risk Analysis",
    content: () => {
      const generateRiskReport = () => {
        // Push computation to web worker
        riskAnalyzerWorker.postMessage({
          rawData,
          quasiIdentifiers: selectedQuasiIdentifiers
        });
        // Listen for completion and progress updates
        riskAnalyzerWorker.onmessage = ({ data }) => {
          if (data.type === "PROGRESS") {
            setRiskAnalysisPercent(data.progress);
          } else if (data.type === "COMPLETE") {
            setRiskAnalysisReportData(data.result);
            const fieldNames_qi = [...fieldNames];
            // Move selected QI columns to the start of table, and fix the columns
            for (const qi of selectedQuasiIdentifiers.reverse()) {
              fieldNames_qi.splice(fieldNames_qi.indexOf(qi), 1);
              fieldNames_qi.unshift(qi);
            }
            const columnConfig_qi = fieldNames_qi.map((key, i) => ({
              fixed:
                fieldNames.length >= SCROLL_COLUMNS_THRESHOLD &&
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

            const chart = [];
            chart.push({
              id: "RecordLoss",
              data: data.result.recordLoss
            });
            chart.push({
              id: "EqClassLoss",
              data: data.result.eqClassLoss
            });
            setTimeout(() => setRiskAnalysisPercent(100), DEBOUNCE_MS);
            setTimeout(() => {
              setRiskAnalysisChartData(chart);
              setRiskAnalysisIsLoading(false);
            }, 500); // wait for awhile, so that user can see full progress bar
          }
        };
      };

      const onGenerateRiskReport = () => {
        setRiskAnalysisIsLoading(true);
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

      // Setup for preview table of records
      let previewRiskData = [];
      if (riskAnalysisReportData && previewRiskRecordsK) {
        previewRiskData = riskAnalysisReportData.indexes[
          previewRiskRecordsK
        ].map(i => {
          const record = rawData[i];
          record["key"] = i; // to make react happy
          return record;
        });
      }

      return (
        <Card>
          <div style={{ textAlign: "left" }}>
            <strong>
              Select Quasi Identifiers to analyze Re-idenfication Risk
            </strong>
          </div>
          <div style={{ display: "flex" }}>
            <QISelector
              fieldNames={fieldNames}
              selectedQuasiIdentifiers={selectedQuasiIdentifiers}
              setSelectedQuasiIdentifiers={setSelectedQuasiIdentifiers}
            />
            <Button
              style={{ marginLeft: 10 }}
              size="large"
              type="primary"
              onClick={onGenerateRiskReport}
              loading={riskAnalysisIsLoading}
              disabled={selectedQuasiIdentifiers.length === 0}
            >
              Run Analysis
            </Button>
          </div>
          <br />
          {riskAnalysisIsLoading ? (
            <Descriptions
              column={1}
              bordered
              size="small"
              style={{ width: "100%" }}
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
              <Descriptions.Item label="Analysis Progress">
                <Progress
                  strokeColor={{
                    from: "#108ee9",
                    to: "#87d068"
                  }}
                  percent={riskAnalysisPercent}
                ></Progress>
              </Descriptions.Item>
            </Descriptions>
          ) : null}
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
              <Title
                level={4}
              >{`Preview records with k=${previewRiskRecordsK} (${(
                (1 / previewRiskRecordsK) *
                100
              ).toFixed(1)}% re-identification risk) [${
                previewRiskData.length
              }/${rawData.length}]`}</Title>
              <Table
                dataSource={previewRiskData}
                columns={riskAnalysisReportColumnConfig}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 1000, y: 300 }}
                size="middle"
              ></Table>
            </div>
          ) : null}
        </Card>
      );
    }
  };

  const Step_Download: StepDefinition = {
    title: "Anonymize",
    content: () => {
      const onAnonymizeDownload = () => {
        setAnonymizeIsLoading(true);
        setProcessFileTransformPercent(0);

        // Two levels of anonymization may be applied:
        // 1. Field level transformations
        // 2. Record level suppression, based on k-anonymity risk analysis

        // Figure out which records have greater risk than k threshold
        let dropIndexes = [];
        if (selectedKThreshold !== 0) {
          // 0 = no suppression
          Object.keys(riskAnalysisReportData.indexes).forEach((k, i) => {
            if (parseInt(k) <= selectedKThreshold) {
              dropIndexes = dropIndexes.concat(
                riskAnalysisReportData.indexes[k]
              );
            }
          });
        }

        // Push computation to web worker
        anonymizerWorker.postMessage({
          file: userFile,
          hasHeader,
          selectedTransforms,
          selectedMode,
          dropIndexes
        });

        // Download directly to file in chunks, never storing entire file in memory
        const downloadStream = streamSaver.createWriteStream(
          `anonymized_${userFile.name}`
        );
        const writer = downloadStream.getWriter();

        // Listen for completion and progress updates
        anonymizerWorker.onmessage = ({ data }) => {
          if (data.type === "PROGRESS") {
            setProcessFileTransformPercent(data.progress);
          } else if (data.type === "NEW_CHUNK") {
            writer.write(data.chunk);
          } else if (data.type === "COMPLETE") {
            // Set as complete after DEBOUNCE so that it will not get skipped
            setTimeout(() => setProcessFileTransformPercent(100), DEBOUNCE_MS);
            setAnonymizeIsLoading(false);
            writer.close();
          }
        };
      };

      return (
        <Card>
          <div style={{ textAlign: "left", fontWeight: "bold" }}>
            1. Field-Level Transformations
          </div>
          <TransformSummary
            fieldNames={fieldNames}
            selectedTransforms={selectedTransforms}
            selectedMode={selectedMode}
          />
          <br />
          <div style={{ textAlign: "left", fontWeight: "bold" }}>
            2. Record-Level Suppression (using k-Anonymity)
          </div>
          <KThresholdSelector
            onChange={setSelectedKThreshold}
            value={selectedKThreshold}
            riskAnalysisReportData={riskAnalysisReportData}
            selectedQuasiIdentifiers={selectedQuasiIdentifiers}
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
                disabled={!userFile}
              >
                Anonymize and Download
              </Button>
            </div>
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
          </div>
        </Card>
      );
    }
  };

  const STEPS: StepDefinition[] = [
    Step_UploadCSV,
    Step_ApplyTransformations,
    Step_RiskAnalysis,
    Step_Download
  ].map((step, i) => {
    step["index"] = i;
    return step;
  });

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
          disabled={currentStep === STEPS.length - 1}
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
        {STEPS.map(step => (
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
      {STEPS[currentStep].content()}
    </PageHeader>
  );
};

export default DAFAAAnonymizer;
