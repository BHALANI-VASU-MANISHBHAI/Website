
const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex items-center mb-3 gap-2'>
      <p className='text-gray-500 font-medium'>
        {text1} <span className='text-gray-700 font-medium'>{text2}</span>
      </p>
      <p className='w-8 sm:w-12 h-[1px]  sm:h-[2px] bg-gray-700 '></p>
    </div>
  );
};

export default Title