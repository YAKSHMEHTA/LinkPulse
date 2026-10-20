
import { Routes, Route } from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import Home from "./Components/Home";
import Apitest from "./Components/Apitest";
import AdminDashboard from "./Components/AdminDashboard";
import Dashboard from "./Components/dashboard";
import Campaigns from "./Components/campaigns";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/test" element={<Apitest />} />
      <Route path="/campaigns" element={<Campaigns />} />
    </Routes>
  );
}

export default App;
