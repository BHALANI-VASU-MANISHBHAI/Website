import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { assetss } from "../assets/frontend_assets/assetss.js";

const ProductItem = ({
  id,
  image,
  name,
  price,
  rating = 0,
  loading = false,
}) => {
  const { currency } = useContext(GlobalContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (loading) {
    return (
      <div className="block text-gray-700 animate-pulse">
        <div className="w-full aspect-[3/4] bg-gray-200 mb-2"></div>
        <div className="h-4 bg-gray-300 w-3/4 mb-1"></div>
        <div className="h-4 bg-gray-200 w-1/2"></div>
      </div>
    );
  }

  return (
    <Link to={`/product/${id}`} className="text-gray-700 cursor-pointer block">
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <div className="absolute top-2 right-2  text-xs font-semibold px-2 py-1 rounded shadow- flex items-center gap-1 bg-white text-gray-800">
          <img className="w-4 h-4" src={assetss.star_icon} alt="" />
          <span>{rating}</span>
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={image?.[0]}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <p className="pt-3 pb-1 text-sm line-clamp-1">{name}</p>
      <p className="text-sm font-medium">
        {currency} {price}
      </p>
    </Link>
  );
};

export default ProductItem;
