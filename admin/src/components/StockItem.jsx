import React from "react";

const StockItem = ({ item, selectedStockType, navigate }) => {
  return (
    <div>
      <div className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 py-1 px-2 border text-sm items-center">
        <img className="w-20" src={item.image[0]} alt="" />
        <p>{item.name}</p>
        <p>
          {item.category} ({item.subCategory})
        </p>
        <p
          className={`w-3/4 text-center ${
            selectedStockType === "out" ? "text-red-600" : "text-orange-500"
          }`}
        >
          {selectedStockType === "out" ? "Out of Stock" : "Low Stock"}
        </p>
        <p
          onClick={() => navigate(`/edit/${item._id}`)}
          className="bg-gray-500 text-white px-1 py-1 rounded-md text-center md:mx-auto cursor-pointer hover:bg-gray-700
        transition duration-200 ease-in-out hover:scale-105 md:w-24 sm:w-20 sm:text-xs text-xs flex items-center justify-center"
        >
          Edit
        </p>
      </div>
    </div>
  );
};

export default React.memo(StockItem);
