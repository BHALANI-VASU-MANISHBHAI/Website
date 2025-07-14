import Rating from "@mui/material/Rating";
import React, { useContext } from "react";
import { assetss } from "../assets/frontend_assets/assetss";
import { UserContext } from "../context/UserContext.jsx";

const ReviewCard = ({ review, EditReviewFun, deleteReviewFun }) => {
  const { userData } = useContext(UserContext);
  const [Edit, setEdit] = React.useState(false);
  const [editedComment, setEditedComment] = React.useState("");
  const [rating, setRating] = React.useState(review.rating || 0);
  const isOwner = userData?._id === review.userId?._id;

  React.useEffect(() => {
    if (Edit) {
      setEditedComment(review.comment || "No comment provided.");
      setRating(review.rating || 0);
    } else {
      setEditedComment("");
      setRating(0);
    }
  }, [Edit, review]);

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden mb-6">
      {/* Gradient accent line */}

      <div className="p-3">
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Section */}
          <div className="flex-shrink-0 relative">
            <div className="relative">
              <img
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 shadow-md"
                src={review.userId?.profilePhoto || assetss.profile_icon}
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>

          {/* User Info and Rating */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {review.userId?.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  <div className="flex items-center  gap-1">
                    <span className="font-medium text-gray-700">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      (
                      {new Date(review.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })})
                    </span>
                  </div>
                </span>
                {/* Edit/Delete buttons for large screens */}
                {isOwner && !Edit && (
                  <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => {
                        if (!isOwner) return;
                        setEdit(!Edit);
                        if (!Edit) {
                          setEditedComment(
                            review.comment || "No comment provided."
                          );
                          setRating(review.rating || 0);
                        } else {
                          setEditedComment("");
                          setRating(0);
                        }
                      }}
                      className="p-2 rounded-full hover:bg-blue-50 transition-colors duration-200 group"
                    >
                      <img
                        className="w-4 h-4 opacity-60 group-hover:opacity-100"
                        src={assetss.edit_icon}
                        alt="Edit"
                      />
                    </button>
                    <button
                      onClick={() => {
                        if (!isOwner) return;
                        deleteReviewFun(review._id);
                      }}
                      className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
                    >
                      <img
                        className="w-4 h-4 opacity-60 group-hover:opacity-100"
                        src={assetss.bin_icon}
                        alt="Delete"
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-3">
              {!Edit && (
                <div className="flex items-center gap-2">
                  <Rating
                    name="half-rating-read"
                    value={review.rating || 0}
                    precision={1}
                    readOnly
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#fbbf24",
                      },
                      "& .MuiRating-iconEmpty": {
                        color: "#e5e7eb",
                      },
                    }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    ({review.rating || 0}/5)
                  </span>
                </div>
              )}
              {Edit && (
                <div className="flex items-center gap-2">
                  <Rating
                    name="half-rating"
                    value={rating}
                    precision={1}
                    onChange={(event, newValue) => {
                      setRating(newValue);
                    }}
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#fbbf24",
                      },
                      "& .MuiRating-iconEmpty": {
                        color: "#e5e7eb",
                      },
                    }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    ({rating}/5)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="relative">
          {!Edit && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                {review.comment || "No comment provided."}
              </p>
            </div>
          )}

          {Edit && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
                  rows={4}
                  placeholder="Share your thoughts about this experience..."
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {editedComment.length}/500
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEdit(false)}
                  className="px-6 py-2  text-white bg-red-500 hover:bg-red-600  rounded-lg transition-all  duration-200 font-medium hover:scale-105 shadow-md"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2  bg-blue-400 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={() => {
                  
                    setEdit(false);
                    EditReviewFun(review._id, rating, editedComment);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Edit/Delete buttons */}
        {isOwner && !Edit && (
          <div className="flex sm:hidden justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (!isOwner) return;
                setEdit(!Edit);
                if (!Edit) {
                  setEditedComment(review.comment || "No comment provided.");
                  setRating(review.rating || 0);
                } else {
                  setEditedComment("");
                  setRating(0);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <img className="w-4 h-4" src={assetss.edit_icon} alt="Edit" />
              <span className="text-sm font-medium">Edit</span>
            </button>
            <button
              onClick={() => {
                if (!isOwner) return;
                deleteReviewFun(review._id);
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <img className="w-4 h-4" src={assetss.bin_icon} alt="Delete" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
