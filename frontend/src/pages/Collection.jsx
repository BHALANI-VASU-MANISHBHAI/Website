import React, { useContext, useEffect, useState } from "react";
import { assetss } from "../assets/frontend_assets/assetss";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import PriceRangeSlider from "../components/PriceRangeSlider";
import "nouislider/dist/nouislider.css";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { ProductContext } from "../context/ProductContext.jsx";

const Collection = () => {
  const { products } = useContext(ProductContext);
  const { search, showSearch } = useContext(GlobalContext);
  const [showFilter, setShowFilter] = useState(true);
  const [FilterProduct, setFilterProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortValue, setSortValue] = useState("relevent");
  const [priceRange, setPriceRange] = useState([100, 2000]);
  const [loading, setLoading] = useState(false);

  const SortProduct = (e) => {
    setSortValue(e.target.value);
  };

  const handleCategory = (e) => {
    const { value, checked } = e.target;
    setCategory((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleSubCategory = (e) => {
    const { value, checked } = e.target;
    setSubCategory((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  useEffect(() => {
    setLoading(true);
    let filteredProducts = products.map((product) => ({ ...product }));

    if (search && showSearch) {
      filteredProducts = filteredProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    filteredProducts = filteredProducts.filter((product) => {
      const isCategoryMatch = category.length
        ? category.includes(product.category)
        : true;
      const isSubCategoryMatch = subCategory.length
        ? subCategory.includes(product.subCategory)
        : true;
      const isPriceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return isCategoryMatch && isSubCategoryMatch && isPriceMatch;
    });

    if (sortValue === "low") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "high") {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else {
      filteredProducts.sort((a, b) => a._id - b._id);
    }

    const timeout = setTimeout(() => {
      setFilterProduct(filteredProducts);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    category,
    subCategory,
    products,
    search,
    showSearch,
    sortValue,
    priceRange,
  ]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Panel */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:none transform transition-transform duration-300 ${
              showFilter ? "rotate-90" : ""
            }`}
            src={assetss.dropdown_icon}
            alt="Toggle"
          />
        </p>

        {/* Categories */}
        <div
          className={`border border-gray-300 pb-4 pl-4 mt-6 ${
            showFilter ? "" : "hidden"
          }`}
        >
          <p className="mb-3 text-sm font-medium mt-3">CATEGORIES</p>
          <div className="flex flex-col text-sm font-light text-gray-700">
            {["Men", "Women", "Kids"].map((cat) => (
              <label key={cat} className="flex gap-2">
                <input type="checkbox" value={cat} onChange={handleCategory} />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* SubCategories */}
        <div
          className={`border border-gray-300 pb-4 pl-4 mt-6 ${
            showFilter ? "" : "hidden"
          }`}
        >
          <p className="mb-3 mt-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {["Topwear", "Bottomwear", "Winterwear"].map((subCat) => (
              <label key={subCat} className="flex gap-2">
                <input
                  type="checkbox"
                  value={subCat}
                  onChange={handleSubCategory}
                />
                {subCat}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <PriceRangeSlider
          min={0}
          max={2000}
          onRangeChange={(range) => {
            setPriceRange(range);
          }}
        />
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex flex-row gap-2 items-center justify-between">
          <Title
            className="text-2xl font-medium"
            text1={"ALL"}
            text2={"COLLECTION"}
          />
          <select
            className="border border-gray-300 rounded-md p-2 text-sm font-light mb-3"
            onChange={SortProduct}
          >
            <option value="relevent">Sort by: Relevant</option>
            <option value="low">Sort by: Price Low to High</option>
            <option value="high">Sort by: Price High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(Math.min(FilterProduct.length || 8, 8))].map(
                (_, index) => <ProductItem key={index} loading={true} />
              )
            : FilterProduct.map((product, index) => (
                <ProductItem
                  key={index}
                  id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
