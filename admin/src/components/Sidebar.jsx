import { NavLink } from 'react-router-dom'
import assets from '../assets/assets.js';


const Sidebar = () => {

  const sideBarItems = [
    {
      label: 'Add Items',
      icon: assets.add_icon,
      to: '/add'
    },
    {
      label: 'List Items',
      icon: assets.order_icon,
      to: '/list'
    },
    {
      label: 'Orders',
      icon: assets.order_icon,
      to: '/orders'
    },
    {
      label: 'Dashboard',
      icon: assets.order_icon,
      to: '/dashboard'
    },
    {
      label: 'Rider Dashboard',
      icon: assets.order_icon,
      to: '/rider-dashboard'
    },{
      label: 'Rider COD Info',
      icon: assets.order_icon,
      to: '/rider-cod-info'
    }
  ];

  return (
    <div className='w-[18%] min-h-screen border-r-2  md:block hidden'>
       <div className='flex flex-col gap-4 pt-6 pl-[10%] text-[15px] '>
        {
          sideBarItems.map((item, index) => (
            <NavLink
              key={index}
              className='flex flex-col gap-3 border border-gray-300 brder-r-0 px-3 py-2 rounded-1 sm:flex-row'
              to={item.to}
            >
              <img className='w-5 h-5' src={item.icon} alt="" />
              <p className='hidden md:block'>{item.label}</p>
            </NavLink>
          ))
        }
       </div>
    
    </div>
  )
}

export default Sidebar