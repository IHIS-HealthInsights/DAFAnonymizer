import React, { useState } from "react";
import { Table } from "antd";
import AnonTypeSelector from "./components/AnonTypeSelector";
import Transforms from "../anonymizer/Transforms";
import FileUploader from "./components/FileUploader";
import Papa from "papaparse";
import ANON_TYPES from "../anonymizer/AnonTypes";

const AnonPreviewer = () => {
  const [previewData, setPreviewData] = useState([]);
  const [anonTypes, setAnonTypes] = useState({});
  let columnsConfig = [];

  // Derive columns spec from the data
  if (previewData.length) {
    const colKeys = Object.keys(previewData[0]).filter(key => key !== "key");
    columnsConfig = colKeys.map(key => ({
      ellipsis: true,
      title: (
        <div>
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
        if (!anonTypes[key]) {
          return Transforms[ANON_TYPES.OTHER](text);
        }
        return Transforms[anonTypes[key]](text);
      }
    }));
  }

  const fileUploaderProps = {
    accept: ".csv",
    multiple: false,
    // Make use of transformFile hook to read, transform, and setPreviewData on Previewer component
    // If `resolve` is not called, data will not be uploaded
    transformFile(file) {
      return new Promise(resolve => {
        Papa.parse(file, {
          header: true,
          preview: 100,
          complete: ({ data, errors, meta }) => {
            if (errors.length) {
              console.error(errors);
              alert("Failed to parse CSV file");
              return;
            }

            // Add incrementing key to each record
            data = data.map((d, i) => ({ ...d, key: i }));
            setPreviewData(data);
          }
        });
      });
    }
  };

  return (
    <div>
      <FileUploader {...fileUploaderProps} />
      {previewData.length ? (
        <Table
          dataSource={previewData}
          columns={columnsConfig}
          rowKey={record => record.key}
        ></Table>
      ) : null}
    </div>
  );
};

export default AnonPreviewer;
