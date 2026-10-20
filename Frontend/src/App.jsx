import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import Home from "./Components/Home";
import Campaigns from "./Components/Campaigns";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/dashboard" element={<Navigate to="/campaigns" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
