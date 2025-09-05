import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { checkDataSource, testStockAPI } from "./services/hybridStockService";

// Expose testing functions globally for console debugging
if (typeof window !== "undefined") {
  (window as any).checkDataSource = checkDataSource;
  (window as any).testStockAPI = testStockAPI;
  console.log("🔧 Debug functions available:");
  console.log('   - checkDataSource("TCS") - Check current data source');
  console.log('   - testStockAPI("TCS") - Test all APIs');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
