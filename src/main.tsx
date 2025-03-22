import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { ConfigProvider } from "antd";
// import "./index.css";
import App from "./App.tsx";
import "@/global";
import "@/i18n/index";
import { StyleProvider } from "@ant-design/cssinjs";

createRoot(document.getElementById("root")!).render(
  // <ConfigProvider direction="rtl">
  <StrictMode>
    <StyleProvider>
      <App />
    </StyleProvider>
  </StrictMode>
  // </ConfigProvider>
);
