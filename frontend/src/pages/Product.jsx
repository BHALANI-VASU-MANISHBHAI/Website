  import  { useEffect, useContext, useState } from "react";
  import { useParams } from "react-router-dom";

  import ReletedProducts from "../components/ReletedProducts";
  import Title from "../components/Title";
  import axios from "axios";
  import { toast } from "react-toastify";
  import Rating from "@mui/material/Rating";
  import ReviewCard from "../components/ReviewCard";
  import StarLine from "../components/StarLine";
  import { assetss } from "../assets/frontend_assets/assetss";
  import { GlobalContext } from "../context/GlobalContext.jsx";
  import { CartContext } from "../context/CartContext.jsx";
  import { UserContext } from "../context/UserContext.jsx";
  import { ProductContext } from "../context/ProductContext.jsx";
  import socket from "../services/sockets.jsx";


  const Product = () => {
    //  products, currency, addToCart, backendUrl, token, userData 
    const { id } = useParams();
    const {products } = useContext(ProductContext);
    const {addToCart} = useContext(CartContext);
    const{userData} = useContext(UserContext);
    const { backendUrl, token, currency ,navigate} = useContext(GlobalContext);
    const [productData, setProductData] = useState(null);
    const [image, setImage] = useState("");
    const [Size, setSizes] = useState("");
    const [Reviews, setReviews] = useState([]);
    const [Ratings, setRatings] = useState();
    const [avgRating, setAvgRating] = useState(0);
    const [addComment ,setaddComment] = useState("");
    const[showAddReview, setShowAddReview] = useState(false);
    const [addRating , setAddRating] = useState(0);
    const [activeTab, setActiveTab] = useState("description");
    const [OriginalPrice , setOriginalPrice] = useState(0);

    console.log("productData", productData);

  const  owner = userData?._id === productData?.userId?._id;
    console.log("owner", owner);
    // Fetch product details from local products state
  const fetchProductData = async () => {  // ✅ Make it async
    try {
      const response = await axios.get(`${backendUrl}/api/product/single/${id}`);  // ✅ await the request
      console.log("response", response);
      if (response.data.success) {
        const product = response.data.product;
          
        if (product) {
          setProductData(product);
          setOriginalPrice(product.price * (1 - (product.discount || 0) / 100));
          setAvgRating(product.avgRating || 5);
          setRatings(product.totalReviews || 0);
          setImage(product.image[0]);
        } else {
          setProductData(null);
        }
      } else {
        toast.error("Failed to fetch product data.");
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      toast.error("Error fetching product data.");
    }
  };



    // Fetch reviews from backend API
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/review/get/${id}`);
        if (response.data.success) {
          setReviews(response.data.reviews);
        } else {
          setReviews([]);
          setAvgRating(0);
        }
      } catch (error) {
        console.log("Error fetching reviews:", error);
      }
    };

    const EditReview = async (reviewId, rating, comment) => {
      try {
        const response = await axios.put(
          `${backendUrl}/api/review/update`,
          {
            reviewId,
            rating,
            comment,
          },
          {
            headers: { token },
          }
        );

        if (response.data.success) {
          fetchReviews();
        } else {
          toast.error("Failed to edit review.");
        }
      } catch (e) {
        console.log("Error editing review:", e);
        toast.error("Failed to edit review. Please try again later.");
      }
    };

    const CountRating = (rating) => {
      let count = 0;
      for (let i = 0; i < Reviews.length; i++) {
        if (Reviews[i].rating === rating) {
          count++;
        }
      }
      return count;
    };

    const AddReview = async () => {
      try{

        const response = await axios.post(
          `${backendUrl}/api/review/add`,
          {
            productId: id,
            rating: addRating,
            comment: addComment,
          },
          {
            headers: { token },
          }
        );
  

      if (response.data.success) {
        setShowAddReview(false);
        setAddRating(0);
        setaddComment("");
        fetchReviews();
      } else {
        toast.error(response.data.message || "Failed to add review.");
        
      }
      }catch (error) {
      console.log("Error adding review:", error);
        toast.error("Failed to add review. Please try again later.");
      }

    }

    useEffect(() => {
      fetchProductData();
    }, [id, products]);

    useEffect(() => {
      fetchReviews();
    }, [id]);
  useEffect(() => {
    // Join product room on mount
    socket.emit('joinProductRoom', { productId: id });

    socket.on('reviewAdded', (data) => {
      if (data.productId === id) {
        toast.success("New review added!");
        setShowAddReview(false);
        fetchReviews();
      }
    });

    socket.on('reviewUpdated', (data) => {
      console.log("data", data);
      console.log("id", id);
      if (data.productId === id) {
        toast.success("Review updated successfully!");
        setShowAddReview(false);
        fetchReviews();
      }
    });

    
    // Leave product room on unmount
    return () => {
      socket.emit('leaveProductRoom', { productId: id });
      socket.off('reviewAdded');
      socket.off('reviewUpdated');
    };
  }, [id]);

    



  if (!productData) return <div className="opacity-0">Loading...</div>;

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100  sm:block">
      <div className=" transition-opacity ease-in duration-500 opacity-100 block sm:hidden">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm"
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex thumbnails sm:flex-col overflow-x-auto sm:overflow-y-scroll   sm:w-[18.7%] w-full flex-shrink-0 cursor-pointer">
            {productData.image.map((item, index) => (
              <img
                key={index}
                onClick={() => setImage(item)}
                className="flex w-[24%] sm:w-full flex-shrink-0 sm:mb-3 cursor-pointer"
                src={item}
                alt={`${productData.name} thumbnail ${index + 1}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt={productData.name} />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <Rating
              name="read-only"
              value={avgRating}
              precision={0.5}
              readOnly
            />
            <p className="pl-2">({avgRating.toFixed(1)})</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}

            <span className={` ${productData.discount ? "line-through" : ""} `}>
              {" "}
              {productData.price}
            </span>
            <span>{productData.discount ? ` ${OriginalPrice}` : ""}</span>
            <span className="text-md font-semibold text-center text-md">
              {productData.discount ? ` (${productData.discount}% OFF)` : ""}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-5 md:w-4/5">
            {productData.description}
          </p>

          <div className="flex items-center gap-2 mt-5 flex-col ">
            <p className="text-sm text-gray-500 self-start">Available Stock:</p>
            <div className="flex gap-2 self-start flex-wrap">
              {productData.sizes.map(
                (size, index) =>
                  productData.stock[index].quantity > 0 && ( // ✅ Only show in-stock sizes
                    <span
                      key={index}
                      className="px-3 py-1 border rounded-full text-sm bg-green-100 text-green-700"
                    >
                      {size} ({productData.stock[index].quantity} in stock)
                    </span>
                  )
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {productData.sizes.map((item, index) => {
                const isOutOfStock = productData.stock[index].quantity <= 0;

                return (
                  <button
                    onClick={() => !isOutOfStock && setSizes(item)} // Prevent setting size if out of stock
                    className={`border pt-2 pb-2 px-4 bg-gray-100 text-center ${
                      item === Size ? "border-orange-500" : ""
                    } ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    key={index}
                    disabled={isOutOfStock} // Disables the button (backend safety)
                  >
                    {item} {isOutOfStock && "(Out of Stock)"}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                addToCart(productData._id, Size);
              }}
              className="bg-black text-white py-2 px-4 w-[33%] active:bg-gray-700 text-sm cursor-pointer"
            >
              ADD TO CART
            </button>
            <hr className="mt-8 sm:w-4/5" />
            <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
              <p>100% Original Product</p>
              <p>Cash On Delivery available</p>
              <p>Easy return and exchange within 7 days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs */}
      <div className="mt-20 max-w-4xl px-4">
        <div className="flex border border-gray-300 rounded-t-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3 text-sm font-semibold border-r border-gray-300 ${
              activeTab === "description"
                ? "bg-gray-100"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 text-sm font-semibold ${
              activeTab === "reviews"
                ? "bg-gray-100"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            Reviews ({productData.totalReviews || 0})
          </button>
        </div>

        {/* Description Panel */}
        {activeTab === "description" && (
          <div className="border border-t-0 border-gray-300 rounded-b-lg shadow-md p-6 bg-white space-y-4 text-gray-700 text-sm leading-relaxed">
            <p>{productData.description}</p>
          </div>
        )}

        {/* Reviews Panel */}
        {activeTab === "reviews" && (
          <div className="mt-10">
            <div className="text-2xl text-center mb-6">
              <Title className="text-lg" text1={"Customer"} text2={"Reviews"} />
            </div>

            {/* Review Form */}
            {token ? (
              <div className="max-w-2xl  mb-10 ">
                <div className=" ml-0 flex gap-4 md:mb-10 md:ml-8  sm:mb-7 flex-row ">
                  <h2>Reviews</h2>
                  <Rating
                    name="half-rating-read"
                    value={avgRating}
                    precision={1}
                    readOnly
                  />
                  <p>({avgRating.toFixed(1)})</p>
                  <p className="">
                    {" "}
                    <span className="font-bold "> {Reviews.length}</span>{" "}
                    <span className="text-gray-800"> Reviews</span>
                  </p>
                </div>
                {/* Average Rating and Add Review Button */}
                <div className="flex  gap-4  flex-col md:flex-row mb-6 mt-4">
                  <div className="md:flex flex-col gap-4 w-1/4 items-center justify-center  hidden ">
                    <p className="text-xl "> {avgRating.toFixed(1)} OUT of 5</p>
                    <button
                      onClick={() => setShowAddReview(true)}
                      className="bg-blue-600 py-2 rounded-xl w-[65%] cursor-pointer"
                    >
                      Add Review
                    </button>
                  </div>
                  <div>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <StarLine
                        key={rating}
                        LineNo={rating}
                        totalReviews={Reviews.length}
                        RatingCount={CountRating(rating)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddReview(true)}
                    className="bg-blue-600 py-2 rounded-xl md:w-[35%] sm:w-[30%] w-[50%]  md:hidden  text-white text-sm hover:bg-blue-700 cursor-pointer "
                  >
                    Add Review
                  </button>
                </div>
                {/*Show Reviews */}
                {Reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    userData={userData}
                    EditReviewFun={EditReview}
                  />
                ))}

                <div>
                  <div className="h-[1px] w-full bg-gray-200 rounded-full"></div>
                </div>
                {/* Add Review Form */}
                {showAddReview && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="flex flex-col gap-4 mt-6 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 w-[90%] sm:w-[450px]">
                      <div className="flex flex-col gap-2 mb-2 border-b-2 border-gray-200 pb-4">
                        <div className="flex items-center justify-between gap-2">
                          <p>Add a review for:</p>
                          <img
                            onClick={() => setShowAddReview(false)}
                            className="w-4 h-4 cursor-pointer"
                            src={assetss.cross_icon}
                            alt="Close"
                          />
                        </div>
                        <h2 className="text-lg font-semibold">
                          {productData.name}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Rating
                          name="user-rating"
                          value={addRating}
                          precision={1}
                          onChange={(event, newValue) => {
                            setAddRating(newValue);
                          }}
                        />
                        <p className="text-gray-500">({addRating} Out of 5)</p>
                      </div>

                      <textarea
                        className="w-full h-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your review here..."
                        onChange={(e) => setaddComment(e.target.value)}
                      ></textarea>

                      <div className="flex gap-4 mt-4 justify-between">
                        <button
                          onClick={() => AddReview()}
                          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 w-[48%] cursor-pointer"
                        >
                          Submit Review
                        </button>
                        <button
                          onClick={() => setShowAddReview(false)}
                          className="bg-gray-300 hover:bg-gray-600 hover:text-white px-4 py-2 rounded-md w-[48%] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                Please log in to leave a review.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      <ReletedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
