import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import {Garuda} from 'garudaa'


// Garuda.init({host:'http://localhost:3001',projectId:"63d7db6714f5f0dea22c8100"}); // local setup
Garuda.init({host:'https://apifms-garuda.ddns.net', projectId:'64a4069f0da6174b8a1b8e08'}) // qa setup

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
