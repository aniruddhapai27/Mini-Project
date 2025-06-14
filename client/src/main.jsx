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
                background: "#111",
                color: "#fafafa",
                border: "1px solid #fafafa",
              },
              iconTheme: {
                primary: "#fafafa",
                secondary: "#111",
              },
            },
            error: {
              style: {
                background: "#111",
                color: "#ef4444",
                border: "1px solid #ef4444",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "#111",
              },
            },
            loading: {
              style: {
                background: "#111",
                color: "#fafafa",
                border: "1px solid #fafafa",
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
