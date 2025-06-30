import React from 'react'
import { useContext } from 'react'
import Title from '../components/Title'
import { assetss } from'../assets/frontend_assets/assetss'
const About = () => {
  return (
    <div>
        <div className='text-2xl text-center pt-8 border-t'>
           <Title text1={'ABOUT'} text2={'US'} />
        </div>
        <div className='my-10 flex flex-col md:flex-row gap-16'>
            <img  className='w-full md:max-w-[450px]'  src={assetss.about_img} alt="" />
            <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p> Forever was born out of a passion for innovation and a desire to create a platform that empowers individuals to take control of their financial future. Our team is made up of experienced professionals from diverse backgrounds, including finance, technology, and entrepreneurship. We are united by a common goal: to provide our users with the tools and resources they need to succeed in the world of cryptocurrency.</p>
              <p> At Forever, we believe that everyone should have access to the benefits of cryptocurrency. We are committed to making our platform user-friendly and accessible to all, regardless of their level of experience. Our mission is to demystify cryptocurrency and provide our users with the knowledge and support they need to make informed decisions.</p>
              <b>Our Mission</b>
              <p>Our Mission at Forever is to empower individuals to take control of their financial future through the use of cryptocurrency. We strive to provide our users with the tools, resources, and support they need to succeed in the ever-evolving world of digital assets.</p> 
            </div>
        </div>

        <div className='text-3xl py-4'>
            <Title text1={'WHY'} text2={'CHOOSE US'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mb-20">
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-10 md:px-12 py-8 flex flex-col gap-4 transition-transform hover:scale-[1.02]">
    <h3 className="text-lg font-semibold text-gray-800">Quality Assurance</h3>
    <p className="text-gray-600">
      We meticulously select and vet each product to ensure that it meets our high standards of quality and performance.
      Our team of experts conducts thorough research and testing to guarantee that you receive only the best.
    </p>
  </div>

  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-10 md:px-12 py-8 flex flex-col gap-4 transition-transform hover:scale-[1.02]">
    <h3 className="text-lg font-semibold text-gray-800">Convenience</h3>
    <p className="text-gray-600">
      With our user-friendly interface and hassle-free ordering process, you can easily find and purchase the products you need without any complications.
      We strive to make your shopping experience as smooth and enjoyable as possible.
    </p>
  </div>

  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-10 md:px-12 py-8 flex flex-col gap-4 transition-transform hover:scale-[1.02]">
    <h3 className="text-lg font-semibold text-gray-800">Exceptional Customer Service</h3>
    <p className="text-gray-600">
      Our dedicated customer service team is here to assist you every step of the way.
      Whether you have questions about a product or need help with your order, we are just a message away and ready to provide you with the support you need.
    </p>
  </div>
</div>

    </div>
  )
}

export default About