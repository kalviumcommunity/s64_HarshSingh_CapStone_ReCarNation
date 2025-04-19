import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Authentication from "./pages/auth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/register" element={<Authentication />} />

      </Routes>
    </Router>
  );
}

export default App;
