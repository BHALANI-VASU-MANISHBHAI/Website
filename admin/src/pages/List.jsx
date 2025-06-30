import { useContext, useEffect, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { ProductContext } from "../contexts/ProductContext";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [originalList, setOriginalList] = useState([]); // Keep original list to re-filter
  const [loading, setLoading] = useState(true);
  const [OpenCategory, setOpenCategory] = useState(false);
  const [Category, setCategory] = useState("All");
  const [SubCategory, setSubCategory] = useState("All");
  const [OpenSubCategory, setOpenSubCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
const {products} = useContext(ProductContext);

const GetList = ()=>{
  setOriginalList(products);
  setList(products);
}

useEffect(()=>{
GetList();
},[products])

  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const url = backendUrl + "/api/product/list";
      const response = await axios.get(url);

      if (response.data.success) {
        setList(response.data.products);
        setOriginalList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const url = backendUrl + "/api/product/remove/";
      const response = await axios.post(
        url,
        { id },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };


  useEffect(() => {
    setLoading(true);
    let filteredList = originalList;
    if (Category !== "All") {
      filteredList = filteredList.filter((item) => item.category === Category);
    }

    if (SubCategory !== "All") {
      filteredList = filteredList.filter(
        (item) => item.subCategory === SubCategory
      );
    }

    if (searchQuery.trim() !== "") {
      filteredList = filteredList.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setList(filteredList);
    setLoading(false);
  }, [Category, SubCategory, searchQuery, originalList]);

  const shimmerLoader = () => {
    return Array(10)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 py-1 px-2 border text-sm items-center animate-pulse"
        >
          <div className="w-20 h-16 bg-gray-300 rounded-md"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 hidden md:block"></div>
          <div className="h-6 bg-gray-300 rounded md:mx-auto sm:ml-auto md:col-start-5 sm:w-[35%] md:w-[100%] w-[50%]"></div>
          <div className="h-6 bg-gray-300 rounded  md:mx-auto sm:ml-auto md:col-start-5 sm:w-[100%] w-[100%] md:hidden"></div>
        </div>
      ));
  };

  return (
    <>
      <p className="mb-2 text-2xl">All Products List</p>
   <div className="p-4  gap-10 sm:gap-4 md:gap-10 md:flex-row flex-col md:items-center md:justify-between border border-gray-200 bg-gray-100 rounded-b-md">

        {/* Category Selector */}
        <div className="flex  items-center gap-3">
          <p>Category</p>
          <div className="flex items-center gap-2 relative">
            <b>{Category}</b>
            <img
              onClick={() => setOpenCategory(!OpenCategory)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform transition-transform duration-300 ${
                OpenCategory ? "rotate-90" : "rotate-0"
              }`}
              alt=""
            />

            {OpenCategory && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-20">
                {["All", "Men", "Women", "Kids"].map((cat) => (
                  <p
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setOpenCategory(false);
                    }}
                    className="hover:bg-gray-300 hover:text-gray-800 cursor-pointer p-1 rounded-md"
                  >
                    {cat}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SubCategory Selector */}
        <div className="flex  items-center gap-3">
          <p>SubCategory</p>
          <div className="flex items-center gap-2 relative">
            <b>{SubCategory}</b>
            <img
              onClick={() => setOpenSubCategory(!OpenSubCategory)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform transition-transform duration-300 ${
                OpenSubCategory ? "rotate-90" : "rotate-0"
              }`}
              alt=""
            />

            {OpenSubCategory && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-28">
                {["All", "Bottomwear", "Topwear", "Winterwear"].map((sub) => (
                  <p
                    key={sub}
                    onClick={() => {
                      setSubCategory(sub);
                      setOpenSubCategory(false);
                    }}
                    className="hover:bg-gray-300 hover:text-gray-800 cursor-pointer p-1 rounded-md"
                  >
                    {sub}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Search Bar */}
        <div className=" sm:p-0 md:p-4 flex gap-3 items-center relative">
          {/* Search Icon */}
          <img
            className="absolute w-4 left-6 top-1/2 transform -translate-y-1/2"
            src={assets.search_icon}
            alt="Search"
          />

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border pl-10 pr-2 py-1 rounded-md w-64" // Notice pl-10 for icon space
          />
        </div>
      </div>

        <div className="flex flex-col gap-2 mt-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] bg-gray-100 items-center py-1 px-2 border text-sm ">
            <b>Image</b>
            <b>Name</b>
            <b>Category(subCategory)</b>
            <b>Price</b>
            <b className="text-center">Action</b>
          </div>

          {/* Product List or Shimmer */}
          {loading
            ? shimmerLoader()
            : list.map((item, index) => (
                <div
                  className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 py-1 px-2 border text-sm items-center"
                  key={index}
                >
                  <img className="w-20" src={item.image[0]} alt="" />
                  <p>{item.name}</p>
                  <p>
                    {item.category} ({item.subCategory})
                  </p>
                  <p>₹{item.price}</p>

                  <p
                    className="text-right md:text-center cursor-pointer text-lg hidden md:block"
                    onClick={() => removeProduct(item._id)}
                  >
                    X
                  </p>

                  <p
                    onClick={() => navigate(`/edit/${item._id}`)}
                    className="bg-gray-500 text-white px-1 py-1 rounded-md text-center md:mx-auto sm:ml-auto md:col-start-5 sm:w-[35%] md:w-[100%] w-[50%] cursor-pointer hover:bg-gray-700"
                  >
                    Edit
                  </p>

                  {/* Remove Button for Small Screen */}
                  <p
                    onClick={() => removeProduct(item._id)}
                    className="bg-gray-500 text-white px-1 py-1 rounded-md text-center md:mx-auto sm:ml-auto md:col-start-5 sm:w-[100%] w-[100%] cursor-pointer hover:bg-gray-700 md:hidden"
                  >
                    Remove
                  </p>
                </div>
              ))}
        </div>
    </>
  );
};

export default List;
