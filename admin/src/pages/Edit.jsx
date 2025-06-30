import React, { useEffect } from "react";
import assets from "../assets/assets.js";
import axios from "axios";
import { backendUrl } from "../App.jsx";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image1, setImage1] = React.useState(null);
  const [image2, setImage2] = React.useState(null);
  const [image3, setImage3] = React.useState(null);
  const [image4, setImage4] = React.useState(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [originalPrice, setOriginalPrice] = React.useState("");
  const [discount, setDiscount] = React.useState("");
  const [category, setCategory] = React.useState("Men");
  const [subcategory, setSubcategory] = React.useState("Topwear");
  const [bestseller, setBestseller] = React.useState(false);
  const [sizes, setSizes] = React.useState([]);
  const [updating, setUpdating] = React.useState(false);
  const [stocks,setStocks] = React.useState({});
  const AvailableSizes = ['S', 'M', 'L', 'XL', 'XXL'];


  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/single/${id}`);
     
      if (response.data.success) {
        const product = response.data.product;
         
         console.log("Responce ",product);
        setImage1(product.image[0] || null);
        setImage2(product.image[1] || null);
        setImage3(product.image[2] || null);
        setImage4(product.image[3] || null);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setOriginalPrice(product.originalPrice);
        setDiscount(product.discount);
        setCategory(product.category);
        setSubcategory(product.subCategory);
        setBestseller(product.bestseller);
        setSizes(product.sizes);
        console.log("stokes ",product.stock);
        setStocks(product.stock);

      } else if (response.data.message === "Product not found") {
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Something went wrong while fetching product data");
    }
  };

  useEffect(() => {
    fetchProduct();
    //only kept that is in sizes array otherwise stoke =0 
  }, [id]);

 const onSubmitHandler = async (e) => {
  e.preventDefault();
  if (updating) return;
  setUpdating(true);

  try {
    const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const stockArray = allSizes.map(size => ({
      size,
      quantity: sizes.includes(size) ? (stocks[size] || 0) : 0
    }));


    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("originalPrice", originalPrice);
    formData.append("discount", discount);
    formData.append("category", category);
    formData.append("subCategory", subcategory);
    formData.append("bestseller", bestseller ? 'true' : 'false');
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("stock", JSON.stringify(stocks)); // ✅ Updated here

    if (image1 && typeof image1 !== "string") formData.append("image1", image1);
    if (image2 && typeof image2 !== "string") formData.append("image2", image2);
    if (image3 && typeof image3 !== "string") formData.append("image3", image3);
    if (image4 && typeof image4 !== "string") formData.append("image4", image4);

    if (typeof image1 === "string") formData.append("imageUrl1", image1);
    if (typeof image2 === "string") formData.append("imageUrl2", image2);
    if (typeof image3 === "string") formData.append("imageUrl3", image3);
    if (typeof image4 === "string") formData.append("imageUrl4", image4);

    const response = await axios.post(`${backendUrl}/api/product/update/${id}`, formData, {
      headers: { token },
    });

    if (response.data.success) {
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/list");
      }, 1000);
    } else {
      toast.error(response.data.message);
    }
  } catch (err) {
    toast.error("Something went wrong while updating");
  }
  setUpdating(false);
};


  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>
              <img
                className="w-20"
                src={!img ? assets.upload_area : typeof img === "string" ? img : URL.createObjectURL(img)}
                alt=""
              />
              <input
                onChange={(e) => {
                  const files = [setImage1, setImage2, setImage3, setImage4];
                  files[index](e.target.files[0]);
                }}
                type="file"
                id={`image${index + 1}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <input
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Write Content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
            value={category}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-3 py-2"
            value={subcategory}
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 mt-2">
        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="25"
            min={0}
            required
          />
        </div>

        <div>
          <p className="mb-2">Original Price</p>
          <input
            onChange={(e) => setOriginalPrice(e.target.value)}
            value={originalPrice}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="30"
            min={0} 
              required  
          />
        </div>

        <div>
          <p className="mb-2">Discount (%)</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="10"
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="flex  gap-3 mt-4">
        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
          <div
            key={size}
            onClick={() =>
              setSizes((prev) =>
                prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
              )
            }
          >
            <p
              className={`px-3 py-1 cursor-pointer rounded ${
                sizes.includes(size) ? 'bg-pink-500 text-white' : 'bg-slate-200 text-black'
              }`}
            >
              {size}
            </p>
          </div>
        ))}
        </div>

 {sizes.length > 0 && (
  <div>
    <p className="mb-2">Stocks per Size</p>
    <div className="flex flex-col gap-3">
      {sizes.map((size) => {
        const stockItem = stocks.find((item) => item.size === size) || { size, quantity: 0 };

        return (
          <div key={size} className="flex items-center gap-3">
            <label className="w-10">{size}:</label>
            <input
              onChange={(e) =>
                setStocks((prev) =>
                  prev.map((item) =>
                    item.size === size ? { ...item, quantity: parseInt(e.target.value) || 0 } : item
                  )
                )
              }
              value={stockItem.quantity}
              className="px-3 py-1 border border-gray-300 rounded"
              type="number"
              placeholder="Enter stock"
            />
          </div>
        );
      })}
    </div>
  </div>
)}



      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          type="checkbox"
          id="bestseller"
          checked={bestseller}
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to Bestseller
        </label>
      </div>

      <button
        type="submit"
        className={`w-28 py-3 mt-4 ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'} text-white`}
        disabled={updating}
      >
        {updating ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
};

export default Edit;