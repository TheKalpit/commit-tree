import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FluentProvider style={{ height: "100%" }} theme={webLightTheme}>
      <App />
    </FluentProvider>
  </StrictMode>,
);
