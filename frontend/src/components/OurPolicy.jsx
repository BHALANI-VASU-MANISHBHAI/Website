import { assetss } from "../assets/frontend_assets/assetss";

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-2'>
        <div>
            <img src={assetss.exchange_icon} alt="exchange" className='w-10 h-10 mb-5 m-auto'/>
            <p>Easy Exchange Policy</p>
            <p className='text-gray-400'>We Offer hassle free exchange policy</p>
        </div>
        <div>
            <img src={assetss.quality_icon} alt="quality" className='w-10 h-10 mb-5 m-auto'/>
            <p>7-Days Return Policy</p>
            <p className='text-gray-400'>We Provide 7 days free return policy</p>
        </div>
        <div>
            <img src={assetss.support_img} alt="support" className='w-10 h-10 mb-5 m-auto'/>
            <p>Best Customer Support</p>
            <p className='text-gray-400'>We Provide 24/7 Customer Support</p>
        </div>
    </div>
  )
}

export default OurPolicy;
