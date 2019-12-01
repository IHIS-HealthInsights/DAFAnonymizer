import React from "react";
import { Upload, Icon } from "antd";

const { Dragger } = Upload;

const FileUploader = props => (
  <Dragger {...props}>
    <p className="ant-upload-drag-icon">
      <Icon type="inbox" />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload</p>
    <p className="ant-upload-hint">Only accepts CSV files</p>
  </Dragger>
);

export default FileUploader;
