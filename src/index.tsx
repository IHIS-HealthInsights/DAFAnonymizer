import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Pre-install service worker
const src = "./install_service_worker.html";
const iframe = document.createElement("iframe");
(iframe as any).loaded = false;
iframe.hidden = true;
iframe.src = src;
iframe.name = "iframe";
(iframe as any).postMessage = (...args) =>
  (iframe.contentWindow.postMessage as any)(...args);
iframe.addEventListener(
  "load",
  () => {
    (iframe as any).loaded = true;
  },
  { once: true }
);
document.body.appendChild(iframe);
