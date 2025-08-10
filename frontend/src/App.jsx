import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";

import About from "./pages/About";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import PlaceOrder from "./pages/PlaceOrder";
import PrivacyPolicy from "./pages/PrivatePolicy";
import Product from "./pages/Product";
import ProfileView from "./pages/ProfileView";

// ✅ Auth-related separated pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OtpVerifyPage from "./pages/OtpVerifyPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  const location = useLocation();

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[10vw]">
      <ToastContainer />
      <Navbar />
      <SearchBar />

      <Routes>
        {/* 🔐 Auth routes */}
        {/* <Route path="/login-page" element={<LoginPage />} />
        <Route path="/register-page" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OtpVerifyPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> */}

        {/* 🏠 Main app routes */}
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product" element={<Product />} />
        <Route
          path="/product/:id"
          element={<Product key={location.pathname} />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/profile-view" element={<ProfileView />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
