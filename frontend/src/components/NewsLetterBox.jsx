import React, { use, useContext } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { GlobalContext } from "../context/GlobalContext.jsx";


const NewsLetterBox = () => {

  const {backendUrl} = useContext(GlobalContext);
 
  const [email, setEmail] = React.useState('');
  
    const handleSubscribe = async (email) => {
      try{
        const response = await axios.post(`${backendUrl}/api/subscriber/addsubscribe`, { email });
        console.log('Subscription response:', response.data);
        if (response.data.success) {
         toast.success('Subscription successful!');
        } else {
          toast.error('Subscription failed: ' + response.data.message);
        }
      }
      catch (error) {
        console.error('Error subscribing:', error);
        alert('An error occurred while subscribing.');
      }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
    }
  return (
    <div className='text-center py-8'>
        <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
        <p className='text-gray-400 mt-3'>
           Join our newsletter to receive exclusive offers, the latest trends, and updates right in your inbox.
        </p>
        
        <form  className='mt-5 flex items-center  sm:w-1/2 mx-auto my-6 border pl-3'  onSubmit={handleSubmit}>
            <input onChange={(e)=>setEmail(e.target.value)}    className="w-full sm:flex-1 outline-none border-black"  type="email"   placeholder='Enter Your Email' />
            <button onClick={()=>handleSubscribe(email)}  className='   bg-black text-white px-4 py-2 sm:ml-2 sm:mt-0' type='submit' >Subscribe</button>
        </form>
    </div>
  )
}

export default NewsLetterBox