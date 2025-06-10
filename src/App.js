import * as React from "react";
import Startup from './pages/loadingScreen.js';
import Livepeer from './pages/livepeer.js';
import "./shared.css";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

export default function App() {
  return (
    <Startup>
      <Router>
        <Routes>
          <Route path='/' element={<Livepeer />} />
          <Route path='/livepeer' element={<Livepeer />} />
        </Routes>
      </Router>
    </Startup>
  );
}