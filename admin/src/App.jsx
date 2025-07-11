import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import OrderContextProvider from './contexts/OrderContext'; // ✅ Import context provider
import ProductContextProvider from './contexts/ProductContext'
import Add from './pages/Add'
import DashBoard from './pages/DashBoard'
import Edit from './pages/Edit'
import List from './pages/List'
import Orders from './pages/Orders'
export const backendUrl = import.meta.env.VITE_BACKEND_URL

import RiderContextProvider from './contexts/RiderContext'; // ✅ Import RiderContextProvider
import RiderCodInfo from './pages/RiderCodInfo'
import RiderDashBorad from './pages/RiderDashBorad'
const App = () => {
  const [token , settoken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "")

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <ProductContextProvider token={token}> {/* ✅ Wrap your app with ProductContextProvider */}
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === "" ? (
        <Login setToken={settoken} />
      ) : (
        <>
          <Navbar setToken={settoken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <OrderContextProvider token={token}> {/* ✅ Wrap your routes here */}
            <RiderContextProvider> {/* ✅ Wrap your routes with RiderContextProvider */}  
           <div className='w-[90%] md:w-[70%] mx-auto my-8 text-gray-600 text-base'>
                <Routes>
                  <Route path='/add' element={<Add token={token} />} />
                  <Route path='/list' element={<List token={token} />} />
                  <Route path='/orders' element={<Orders token={token} />} />
                  <Route path='/edit/:id' element={<Edit token={token} />} />
                  <Route path='/dashboard' element={<DashBoard token={token} />} />
                  <Route path='/rider-dashboard' element={<RiderDashBorad token={token} />} />
                  <Route path='/rider-cod-info' element={<RiderCodInfo token={token} />} />
                  {/* Add more routes as needed */}
                </Routes>
              </div>
            </RiderContextProvider> {/* ✅ Close RiderContextProvider */}
            </OrderContextProvider>
          </div>
        </>
      )}
    </div>
    </ProductContextProvider>
  )
}

export default App
