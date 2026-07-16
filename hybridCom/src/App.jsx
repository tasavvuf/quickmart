import Nav from "./components/Nav";
import { Route, Routes } from "react-router-dom";
import Vendor from "./pages/Vendor";
import HomeUI from "./pages/HomeUI"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FloatingCart from "./components/FloatingCart";
import Cart from "./pages/Cart";
import UserPage from "./pages/UserPage";
import AddressBook from "./pages/AddressBook";
import OrderHistory from "./pages/OrderHistory";
function App() {


  return (
    
    <div className="app-shell">
      <Nav/>
      <div className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<HomeUI />} />
          <Route path="/vendor/:vendorId" element={<Vendor />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/user" element={<UserPage/>}/>
          <Route path="/address-book" element={<AddressBook/>}/>
          <Route path="/orders" element={<OrderHistory/>}/>
        </Routes>
      </div>
      <ToastContainer />
      <FloatingCart/>
       </div>
  );
}

export default App;
