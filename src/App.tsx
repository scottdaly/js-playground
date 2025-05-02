import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Playground from "./components/Playground";
import WebDevPlayground from "./components/WebDevPlayground";

function App() {
  return (
    <div className="h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/js" replace />} />
        <Route path="/js" element={<Playground />} />
        <Route path="/web-dev" element={<WebDevPlayground />} />
      </Routes>
    </div>
  );
}

export default App;
