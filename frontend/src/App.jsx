import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Collection from "./pages/Collection"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Product from "./pages/Product"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import PlaceOrder from "./pages/PlaceOrder"
import Orders from "./pages/Orders"
import Footer from "./components/Footer"
import SearchBar from "./components/SearchBar"
import PrivacyPolicy from "./pages/PrivatePolicy"
import ProfileView from "./pages/ProfileView"
import { ToastContainer } from 'react-toastify';



function App() {
  return (
   <div className="px-4 sm:px-[5vw] md:px-[7vw]  lg:px-[10vw]">
    <ToastContainer/>
    <Navbar/>
    <SearchBar />
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/profile-view" element={<ProfileView />} />
     </Routes>
     <Footer/>
   </div>
  )
}

export default App
