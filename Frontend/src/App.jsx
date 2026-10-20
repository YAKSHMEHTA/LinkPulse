import {Routes, Route} from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import Home from "./Components/Home";
import Apitest from "./Components/Apitest";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/test" element={<Apitest/>} />
    </Routes>
  );
}

export default App;