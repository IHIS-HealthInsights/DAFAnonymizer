import { Card, Checkbox, Form, Icon, Input, Upload } from "antd";
import React from "react";

const { Dragger } = Upload;

const FileUploader = props => (
  <Card bodyStyle={{ padding: 5 }}>
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <Icon type="inbox" />
      </p>
      <p className="ant-upload-text">
        Click or drag CSV file to this area to upload
      </p>
      <p className="ant-upload-hint"></p>
    </Dragger>
    <Form layout="inline">
      <Form.Item label="Rows to preview">
        <Input
          type="number"
          value={props.previewCount}
          onChange={e => props.setPreviewCount(e.target.value)}
        ></Input>
      </Form.Item>
      <Form.Item label="Has header?">
        <Checkbox
          checked={props.hasHeader}
          onChange={e => props.setHasHeader(e.target.value)}
        ></Checkbox>
      </Form.Item>
    </Form>
  </Card>
);

export default FileUploader;
