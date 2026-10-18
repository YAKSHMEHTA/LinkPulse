import {Routes, Route} from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
    </Routes>
  );
}

export default App;