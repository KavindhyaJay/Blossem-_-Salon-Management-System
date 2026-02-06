import React from "react";
import { Routes, Route } from "react-router-dom";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import FigmaReception from "./pages/FigmaReception";
import ReceptionExperience from "./pages/Reception";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReceptionDashboard />} />
      <Route path="/reception" element={<ReceptionDashboard />} />
      <Route path="/experience" element={<ReceptionExperience />} />
      <Route path="/figma-demo" element={<FigmaReception />} />
    </Routes>
  );
}

export default App;

