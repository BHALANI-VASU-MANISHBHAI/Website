import React, { useEffect } from 'react'
import { useContext } from 'react'
import { assetss } from '../assets/frontend_assets/assetss';
import { useLocation } from 'react-router-dom';
import { GlobalContext } from "../context/GlobalContext.jsx";



const SearchBar = () => {
  const location = useLocation();
  const { search, setSearch, showSearch, setShowSearch } = useContext(GlobalContext);
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (location.pathname.includes('collection') && showSearch) {
      setVisible(true);
    } else {
      setVisible(false);
      setSearch('');
      // setShowSearch(false);
    }
  }, [location, showSearch]);

  return showSearch && visible ? (
    <div className='border-t border-b bg-gray-50 text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 md:w-1/2 lg:w-1/2'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='flex-1 outline-none bg-inherit text-sm'
          type="text"
          placeholder='Search'
        />
        <img src={assetss.search_icon} alt="" className='w-4 h-4' />
      </div>
      <img onClick={() => setShowSearch(false)} className='inline w-3 cursor-pointer' src={assetss.cross_icon} alt="" />
    </div>
  ) : null;
};

export default SearchBar;
