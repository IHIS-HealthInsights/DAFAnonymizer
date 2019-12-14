import { ResponsiveLine } from "@nivo/line";
import React from "react";

const RiskAnalysisChart = ({ data, setPreviewRiskRecordsK }) => (
  <ResponsiveLine
    data={data}
    xScale={{
      type: "point"
    }}
    yScale={{
      type: "linear",
      stacked: false,
      min: 0,
      max: 100
    }}
    margin={{ top: 10, right: 50, bottom: 50, left: 50 }}
    axisBottom={{
      orient: "bottom",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "k-Anonymity value (Risk increases to the right →)",
      legendPosition: "middle",
      legendOffset: 35
    }}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Utility Loss",
      legendPosition: "middle",
      legendOffset: -35
    }}
    colors={["red", "orange"]}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="y"
    pointLabelYOffset={-12}
    useMesh={true}
    enableCrosshair={true}
    crosshairType={"x"}
    tooltip={({ point }) => {
      // based on k value, search for associated points
      const k = parseInt(point.data.x.toString());
      const recordLoss = data[0].data.find(o => o.x === k).y;
      const eqClassLoss = data[1].data.find(o => o.x === k).y;
      return (
        <div
          style={{
            background: "white",
            padding: "9px 12px",
            border: "1px solid #ccc",
            textAlign: "left"
          }}
        >
          <span>{`Removing records with `}</span>
          <br />
          <strong>{`re-idenfication risk > ${((1 / k) * 100).toFixed(
            1
          )}% (k≤${k})`}</strong>
          <br />
          <span>{` will result in `}</span>
          <br />
          <strong style={{ color: "red" }}>
            {`${recordLoss.toFixed(1)}%`}
          </strong>
          <span>{` loss in number of records and `}</span>
          <br />
          <strong style={{ color: "orange" }}>
            {`${eqClassLoss.toFixed(1)}%`}
          </strong>
          <span>{` loss in unique combinations of QIs`}</span>
          <br />
          <span style={{ fontStyle: "italic", color: "grey" }}>
            Click to preview at-risk records
          </span>
        </div>
      );
    }}
    onClick={point => {
      if (point) setPreviewRiskRecordsK(parseInt(point.data.x.toString()));
    }}
  />
);

export default RiskAnalysisChart;
