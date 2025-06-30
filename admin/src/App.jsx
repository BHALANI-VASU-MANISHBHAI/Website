import React, { useEffect } from 'react'
import { useState } from 'react'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Edit from './pages/Edit'
import { ToastContainer } from 'react-toastify';
import DashBoard from './pages/DashBoard'
import OrderContextProvider from './contexts/OrderContext' // ✅ Import context provider
export const backendUrl = import.meta.env.VITE_BACKEND_URL
import ProductContextProvider from './contexts/ProductContext'

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
              
           <div className='w-full md:w-[70%] mx-auto my-8 text-gray-600 text-base'>
                <Routes>
                  <Route path='/add' element={<Add token={token} />} />
                  <Route path='/list' element={<List token={token} />} />
                  <Route path='/orders' element={<Orders token={token} />} />
                  <Route path='/edit/:id' element={<Edit token={token} />} />
                  <Route path='/dashboard' element={<DashBoard token={token} />} />
                </Routes>
              </div>
            </OrderContextProvider>
          </div>
        </>
      )}
    </div>
    </ProductContextProvider>
  )
}

export default App
