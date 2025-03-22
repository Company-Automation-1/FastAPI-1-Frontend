import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { ConfigProvider } from "antd";
// import "./index.css";
import App from "./App.tsx";
import "@/global";
import "@/i18n/index";

createRoot(document.getElementById("root")!).render(
  // <ConfigProvider direction="rtl">
  <StrictMode>
    <App />
  </StrictMode>
  // </ConfigProvider>
);
