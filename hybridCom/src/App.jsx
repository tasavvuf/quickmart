import Nav from "./components/Nav";
import { Route, Routes } from "react-router-dom";
import Vendor from "./pages/Vendor";
import HomeUI from "./pages/HomeUI"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {


  return (
    
    <div className="h-screen bg-black text-white flex flex-col">
      <Nav/>
      <Routes>
        <Route path="/" element={<HomeUI />} />
        <Route path="/vendor/:vendorId" element={<Vendor />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
      <ToastContainer />
       </div>
  );
}

export default App;
