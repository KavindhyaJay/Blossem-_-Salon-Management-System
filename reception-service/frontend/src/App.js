import React from "react";
import { Routes, Route } from "react-router-dom";
import ReceptionDashboard from "./pages/ReceptionDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReceptionDashboard />} />
      <Route path="/reception" element={<ReceptionDashboard />} />
    </Routes>
  );
}

export default App;

