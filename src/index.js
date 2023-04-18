import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Garuda } from 'garudaa'

(function (xhr) {
  Garuda.init("63d7db6714f5f0dea22c8100");
  Garuda.identify({
    name: "Omkar chouguale",
    email:'omkar.chougale@eminds.ai',
    subscriptionType: "free"
  });
  function banana(xhrInstance ) {
    // Example
    console.log("Monkey RS: " + xhrInstance.readyState);
  }
  // Capture request before  network activity occurs:
  var send = xhr.send;
  var open = xhr.open;
  var setRequestHeader = xhr.setRequestHeader;
  xhr.send = function () {
    var rsc = this.onreadystatechange;
    if (rsc) {
      // "onreadystatechange" exists. Monkey-patch it
      this.onreadystatechange = function (...args ) {
        banana(this);
        return rsc?.apply(xhr, args);
      };
    }
    return send.apply(this, arguments);
  };
  xhr.open = function (...args) {
    console.log("args", args);
    return open?.apply(xhr , args);
  };
  xhr.setRequestHeader = function (...args) {
    console.log("headers", args);
    return setRequestHeader?.apply(xhr  , args);
  };
})(XMLHttpRequest.prototype);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
