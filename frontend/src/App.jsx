import { Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw]  lg:px-[10vw]">
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
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
