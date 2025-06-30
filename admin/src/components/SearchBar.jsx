import React from 'react';
import assets from '../assets/assets';

const SearchBar = () => {


  return (
    
    <div className='p-4'>
        <div className='w-[80%]'>
            {/* Search bar Category List */}
            <div className='flex items-center  mb-4'>
            <select name="" id="" className='h-10'>
                <option value="All">All</option>
                <option value="Name">Name</option>
                <option value="Bottomwear">Category</option>
                <option value="Winterwear">subCategory</option>
            </select>
            <div className='flex items-center gap-2 ml-2 w-full'>
            <input
                type="text"
                placeholder="Search by category"
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
                "
            />
                <button className='bg-gray-700 text-white px-5 py-2 rounded-full text-xs sm:text-sm'>
                    Search
                </button>
            </div>
            </div>

        </div>
    </div>
  );
};

export default SearchBar;
