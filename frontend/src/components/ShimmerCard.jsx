const ShimmerCard = () => {
  return (
    <div className="block text-gray-700 animate-pulse">
      <div className="w-full aspect-[3/4] bg-gray-200 mb-2"></div>
      <div className="h-4 bg-gray-300 w-3/4 mb-1"></div>
      <div className="h-4 bg-gray-200 w-1/2"></div>
    </div>
  );
};

export default ShimmerCard;
