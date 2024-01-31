import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Garuda } from "garudaa";

Garuda.init({
  host: "http://localhost:3001",
  projectId: "63d7db6714f5f0dea22c8100",
  globalConfigFlags:{disableNetworkPayload:true,disableSessionReplay:false}
}); // local setup
// Garuda.init({
//   host: "https://apifms-garuda.ddns.net",
//   projectId: "658405b81bbd296d4594dc44",
// }); // qa setup

Garuda.identify({
  name: "Aditya Thakkar",
  email: "raunak.thakkar@eminds.ai",
  subscriptionType: "free",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
