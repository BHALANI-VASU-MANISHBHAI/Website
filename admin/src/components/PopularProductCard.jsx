import React from 'react'

const PopularProductCard = ({item}) => {
  return (
    <div>
      <div className="flex items-center gap-4 border-b pb-3 mb-3">
        <img
          src={item.image[0] || assets.add_icon}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-sm text-gray-500">Sold: {item.quantity}</p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PopularProductCard);