import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import App from "./App";
import store from "./redux/store";
import "./index.css";
import { AuthProvider } from "./AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              },
            }}
          >
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
