import { Card, Checkbox, Form, Icon, Input, Upload, Progress } from "antd";
import React from "react";

const { Dragger } = Upload;

const FileUploader = (props) => (
  <Card bodyStyle={{ padding: 5 }}>
    {props.progress > 0 ? (
      <Progress
        strokeColor={{
          from: "#108ee9",
          to: "#87d068",
        }}
        percent={props.progress}
      />
    ) : null}

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
          onChange={(e) => props.setPreviewCount(e.target.value)}
        ></Input>
      </Form.Item>
      <Form.Item label="Has header?">
        <Checkbox
          checked={props.hasHeader}
          onChange={(e) => props.setHasHeader(e.target.checked)}
        ></Checkbox>
      </Form.Item>
    </Form>
  </Card>
);

export default FileUploader;
