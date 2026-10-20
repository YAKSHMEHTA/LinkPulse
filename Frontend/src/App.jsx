import {Routes, Route} from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import Home from "./Components/Home";
import AdminDashboard from "./Components/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/admin" element={<AdminDashboard/>} />
      <Route path="/register" element={<Register/>} />
    </Routes>
  );
}

export default App;