import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Authentication from "./pages/auth";
import Profile from './pages/profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/register" element={<Authentication />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>
  );
}

export default App;
