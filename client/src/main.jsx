import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import store from "./redux/store";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "rgba(47, 70, 94, 0.9)",
                color: "#10b981",
                border: "1px solid #10b981",
              },
              iconTheme: {
                primary: "#10b981",
                secondary: "#FFFAEE",
              },
            },
            error: {
              style: {
                background: "rgba(47, 70, 94, 0.9)",
                color: "#ef4444",
                border: "1px solid #ef4444",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "#FFFAEE",
              },
            },
            loading: {
              style: {
                background: "rgba(47, 70, 94, 0.9)",
                color: "#60a5fa",
                border: "1px solid #60a5fa",
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
