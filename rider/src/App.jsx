import { Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import Dashboard from './pages/DashBoard';
import Earning from './pages/Earning';
import ForgotPassword from './pages/ForgotPassword';
import History from './pages/History';
import Home from './pages/Home';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LocationTracker from './components/LocationTracker';
import Navbar from './components/Navbar';

function App() {
  const location = useLocation(); // ✅ get current path
  const hideNavbarRoutes = ["/login", "/signup"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div> 
      {shouldShowNavbar && <Navbar />}
      <LocationTracker /> {/* Track location in the background */}
    
      {/* Define your routes here */}
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Protected Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/earnings" element={<Earning />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Add more routes as needed */}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

export default App;
