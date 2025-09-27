import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "@redux/store";
import { MoodProvider } from "./components/MoodContext";
import { BrowserRouter as Router } from 'react-router-dom';

import "./App.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
          <MoodProvider>
            <App />
          </MoodProvider>
      </Router>
    </Provider>
  </StrictMode>
);
