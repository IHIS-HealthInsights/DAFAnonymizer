import React from "react";
import { ResponsiveLine } from "@nivo/line";

const RiskAnalysisChart = ({ data }) => (
  <ResponsiveLine
    data={data}
    xScale={{
      type: "point"
    }}
    yScale={{
      type: "linear",
      stacked: true,
      min: 0,
      max: 100
    }}
    margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
    enableCrosshair={true}
    axisBottom={{
      orient: "bottom",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "k-Anonymity Values",
      legendPosition: "middle",
      legendOffset: 35
    }}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Percentage Loss",
      legendPosition: "middle",
      legendOffset: -35
    }}
    colors={{ scheme: "nivo" }}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="y"
    pointLabelYOffset={-12}
    useMesh={true}
    enableSlices="x"
    sliceTooltip={ctx => {
      const slice = (ctx as any).slice;
      const k = slice.points[0].data.x;
      let recordLossPoint;
      let eqClassLossPoint;
      slice.points.forEach(point => {
        if (point.serieId === "RecordLoss") {
          recordLossPoint = point;
        }
        if (point.serieId === "EqClassLoss") {
          eqClassLossPoint = point;
        }
      });
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
          )}% (k=${k})`}</strong>
          <br />
          <span>{` will result in `}</span>
          <br />
          <strong style={{ color: recordLossPoint.serieColor }}>
            {`${recordLossPoint.data.y.toFixed(1)}%`}
          </strong>
          <span>{` loss in number of records and `}</span>
          <br />
          <strong style={{ color: eqClassLossPoint.serieColor }}>
            {`${eqClassLossPoint.data.y.toFixed(1)}%`}
          </strong>
          <span>{` loss in unique combinations of QIs`}</span>
        </div>
      );
    }}
  />
);

export default RiskAnalysisChart;
