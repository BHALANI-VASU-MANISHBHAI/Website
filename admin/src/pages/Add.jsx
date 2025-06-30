import React, { useContext } from "react";
import assets from "../assets/assets.js";
import axios from "axios";
import { backendUrl } from "../App.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { ProductContext } from "../contexts/ProductContext.jsx";

const Add = ({ token }) => {
  const navigate = useNavigate();
  const AvailableSizes = ["S", "M", "L", "XL", "XXL"];

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
  const [adding, setAdding] = React.useState(false);

  // 👉 Now stock is an array of objects: [{ size: "S", quantity: 0 }, ...]
  const [stocks, setStocks] = React.useState([]);


const {addLastProduct}  = useContext(ProductContext);

  const compressImage = async (imageFile) => {
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(imageFile, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return imageFile;
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (adding) return;
      setAdding(true);

      const formData = new FormData();

      const compressedImages = await Promise.all([
        image1 ? compressImage(image1) : null,
        image2 ? compressImage(image2) : null,
        image3 ? compressImage(image3) : null,
        image4 ? compressImage(image4) : null,
      ]);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("originalPrice", originalPrice);
      formData.append("discount", discount);
      formData.append("category", category);
      formData.append("subCategory", subcategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("stock", JSON.stringify(stocks)); // ✅ Send array

      if (compressedImages[0]) formData.append("image1", compressedImages[0]);
      if (compressedImages[1]) formData.append("image2", compressedImages[1]);
      if (compressedImages[2]) formData.append("image3", compressedImages[2]);
      if (compressedImages[3]) formData.append("image4", compressedImages[3]);

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setName("");
        setDescription("");
        setPrice("");
        setOriginalPrice("");
        setDiscount("");
        setCategory("Men");
        setSubcategory("Topwear");
        setBestseller(false);
        setSizes([]);
        setStocks([]);
        
      } else {
        setAdding(false);
        toast.error(response.data.message);
      }
    } catch (err) {
      setAdding(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  // 👉 When sizes change, initialize stocks
  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      // Remove size
      setSizes((prev) => prev.filter((s) => s !== size));
      setStocks((prev) => prev.filter((item) => item.size !== size));
    } else {
      // Add size with quantity 0
      setSizes((prev) => [...prev, size]);
      setStocks((prev) => [...prev, { size: size, quantity: 0 }]);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      {/* Image Upload Section */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <label htmlFor={`image${num}`} key={num}>
              <img
                className="w-20"
                src={!eval(`image${num}`) ? assets.upload_area : URL.createObjectURL(eval(`image${num}`))}
                alt=""
              />
              <input
                onChange={(e) => eval(`setImage${num}`)(e.target.files[0])}
                type="file"
                id={`image${num}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product Details */}
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
          placeholder="Write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select onChange={(e) => setSubcategory(e.target.value)} className="w-full px-3 py-2">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 mt-2">
        <div>
          <p className="mb-2">Original Price</p>
          <input
            onChange={(e) => setOriginalPrice(e.target.value)}
            value={originalPrice}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="25"
          />
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="25"
          />
        </div>

        <div>
          <p className="mb-2">Discount</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full px-3 py-1 sm:w-[120px]"
            type="number"
            placeholder="10"
          />
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3 flex-wrap">
          {AvailableSizes.map((size) => (
            <div key={size} onClick={() => handleSizeToggle(size)}>
              <p
                className={`px-3 py-1 cursor-pointer rounded ${
                  sizes.includes(size) ? "bg-pink-500 text-white" : "bg-slate-200 text-black"
                }`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Inputs */}
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
        className={`w-28 py-3 mt-4 text-white ${adding ? "bg-gray-500 cursor-not-allowed" : "bg-black"}`}
        disabled={adding}
      >
        {adding ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default Add;
