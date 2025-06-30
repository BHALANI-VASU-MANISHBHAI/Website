
const StarLine = ({LineNo,totalReviews,RatingCount}) => {
    // Calculate the percentage of reviews for the given rating
  if (totalReviews === 0) {
    return (
      <div className="flex items-center gap-2">
        <p>{LineNo}</p>
        <img
          className="w-4 h-4"
          src="https://upload.wikimedia.org/wikipedia/donate/thumb/4/44/YellowStar.svg/636px-YellowStar.svg.png?20160715211119"
          alt=""
        />
        <div className="h-1.5 w-80 rounded-full bg-gray-200 dark:bg-gray-600"></div>
        <p className="text-[#3B82F6]"> No Reviews</p>
      </div>
    );
  }
    const percentage = (RatingCount / totalReviews) * 100;
    console.log(percentage, "percentage");
  return (
    <div className="flex items-center gap-2">
      <p>{LineNo}</p>
      <img
        className="w-4 h-4"
        src="https://upload.wikimedia.org/wikipedia/donate/thumb/4/44/YellowStar.svg/636px-YellowStar.svg.png?20160715211119"
        alt=""
      />
      <div className="h-1.5 md:w-80  rounded-full bg-gray-200 dark:bg-gray-600  w-[45%]  ">
        <div
          className="h-1.5 rounded-full bg-yellow-300 "
            style={{ width: `${percentage}%` }}
        ></div>
      </div>
        <p className="text-[#3B82F6]"> {RatingCount}  Reviews</p>
    </div>
  );
}

export default StarLine