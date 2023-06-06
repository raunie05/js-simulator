import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import {Garuda} from './dist'

Garuda.init("63d7db6714f5f0dea22c8100");
Garuda.identify({
  name: "Raunak Thakkar",
  email:'raunak.thakkar@eminds.ai',
  subscriptionType: "free"
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
