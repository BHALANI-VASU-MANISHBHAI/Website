import { NavLink } from 'react-router-dom'
import assets from '../assets/assets.js';


const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2  md:block hidden'>
       <div className='flex flex-col gap-4 pt-6 pl-[10%] text-[15px] '>
          <NavLink className='flex flex-col gap-3 border border-gray-300 brder-r-0 px-3 py-2 rounded-1 sm:flex-row' to='/add'>
            <img className='w-5 h-5' src={assets.add_icon} alt="" />
            <p className='hidden md:block' >Add Items</p>
          </NavLink>
          <NavLink className='flex flex-col gap-3 border border-gray-300 brder-r-0 px-3 py-2 rounded-1 sm:flex-row' to='/list'>
            <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block' >List Items</p>
          </NavLink>
          <NavLink className='flex flex-col gap-3 border border-gray-300 brder-r-0 px-3 py-2 rounded-1 sm:flex-row' to='/orders'>
            <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block' >Orders</p>
          </NavLink>

          <NavLink className='flex flex-col gap-3 border border-gray-300 brder-r-0 px-3 py-2 rounded-1 sm:flex-row' to='/dashboard'>
            <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block' >Dashboard</p>
          </NavLink>
       </div>
    </div>
  )
}

export default Sidebar