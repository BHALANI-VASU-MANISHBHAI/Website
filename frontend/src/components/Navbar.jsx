 import { useState, useContext, useEffect } from 'react';
import { assetss } from "../assets/frontend_assets/assetss";
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GlobalContext } from "../context/GlobalContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

const Navbar = () => {
  const location = useLocation();

  const { setShowSearch, setToken, token, navigate } = useContext(GlobalContext);
  const { getCartCount, setCartItems } = useContext(CartContext);
  const { userData, setUserData } = useContext(UserContext);

  const [visible, setVisible] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(
    "https://res.cloudinary.com/drezv2fgf/image/upload/v1748439973/Profile_avatar_placeholder_large_px5gio.png"
  );

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setCartItems({});
    setUserData({});
    setProfileOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    setProfilePhoto(userData.profilePhoto || profilePhoto);
  }, [userData]);

  return (
    <div className='flex justify-between items-center py-4'>

      {/* Logo */}
      <Link to='/'>
        <div className="w-32 aspect-[16/5] relative">
          <img src={assetss.logo} alt="logo" className="absolute inset-0 w-full h-full object-contain" />
        </div>
      </Link>

      {/* Desktop Nav Links */}
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        {['/', '/collection', '/about', '/contact'].map((path, i) => (
          <NavLink key={i} to={path} className="flex flex-col items-center gap-1">
            <p>{path === '/' ? 'HOME' : path.replace('/', '').toUpperCase()}</p>
            <hr className="w-2/4 border-none hidden h-[1.5px] bg-gray-700" />
          </NavLink>
        ))}
      </ul>

      {/* Right Side Icons */}
      <div className='flex gap-5 items-center'>

        {/* Search Icon */}
        <img
          onClick={() => setShowSearch(location.pathname === '/collection')}
          src={assetss.search_icon}
          alt="search"
          className='w-5 h-5 cursor-pointer'
        />

        {/* Profile Icon & Dropdown */}
        <div className='relative'>
          <img
            onClick={() => token ? setProfileOpen(prev => !prev) : navigate('/login')}
            src={profilePhoto}
            alt="profile"
            className={`cursor-pointer rounded-full ${userData.profilePhoto ? 'w-7 h-7' : 'w-5 h-5'}`}
          />

          {/* Dropdown shown only if token and open */}
          {token && profileOpen && (
            <div className='absolute right-0 pt-4 z-50'>
              <div className='flex flex-col bg-white shadow-lg rounded-lg p-4 gap-2 w-40'>
                <p onClick={() => { navigate('/profile-view'); setProfileOpen(false); }} className='text-sm text-gray-700 hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={() => { navigate('/orders'); setProfileOpen(false); }} className='text-sm text-gray-700 hover:text-black cursor-pointer'>Orders</p>
                <p onClick={logout} className='text-sm text-gray-700 hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <img src={assetss.cart_icon} alt="cart" className='w-5 h-5 cursor-pointer' />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black aspect-square rounded-full text-[8px] text-white">
            {getCartCount()}
          </p>
        </Link>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setVisible(true)}
          src={assetss.menu_icon}
          alt="menu"
          className='w-5 cursor-pointer sm:hidden'
        />
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-white transition-all duration-300 ease-in-out z-50 ${
          visible ? 'w-full' : 'w-0'
        }`}
      >
        <div className="flex flex-col gap-5 p-4">
          <div className="flex items-center gap-4 p-3 cursor-pointer" onClick={() => setVisible(false)}>
            <img src={assetss.dropdown_icon} alt="back" className="h-4 rotate-180" />
            <p>Back</p>
          </div>

          {/* Basic Routes */}
          <NavLink className="py-2 pl-6 border" to="/" onClick={() => setVisible(false)}>HOME</NavLink>
          <NavLink className="py-2 pl-6 border" to="/collection" onClick={() => setVisible(false)}>COLLECTION</NavLink>
          <NavLink className="py-2 pl-6 border" to="/about" onClick={() => setVisible(false)}>ABOUT</NavLink>
          <NavLink className="py-2 pl-6 border" to="/contact" onClick={() => setVisible(false)}>CONTACT</NavLink>

          {/* Auth Options for mobile */}
          {token && (
            <>
              <NavLink className="py-2 pl-6 border" to="/profile-view" onClick={() => setVisible(false)}>My Profile</NavLink>
              <NavLink className="py-2 pl-6 border" to="/orders" onClick={() => setVisible(false)}>Orders</NavLink>
              <p className="py-2 pl-6 border text-red-500 cursor-pointer" onClick={() => { logout(); setVisible(false); }}>Logout</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
