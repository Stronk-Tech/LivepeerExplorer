import React from 'react';
import { createRoot } from "react-dom/client";
import App from './App';
import configureStore from "./store/store";
import { Provider } from "react-redux";

const renderApp = preloadedState => {
  const store = configureStore(preloadedState);
  window.state = store.getState;

  const container = document.getElementById("root");
  const root = createRoot(container);

  root.render(<Provider store={store}><App /></Provider>);
};

(async () => renderApp())();
