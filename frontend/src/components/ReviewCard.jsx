import React, { use } from 'react'
import Rating from "@mui/material/Rating";
import { assetss } from '../assets/frontend_assets/assetss';
import { useContext } from 'react';
import { UserContext } from "../context/UserContext.jsx";



const ReviewCard = ({review,EditReviewFun}) => {
  const {userData} = useContext(UserContext);
  const [Edit, setEdit] = React.useState(false);
  const [editedComment, setEditedComment] = React.useState("");
  const [rating, setRating] = React.useState(review.rating || 0);
  const isOwner = userData?._id === review.userId?._id;
    console.log("isowner ",isOwner);

  React.useEffect(() => {
    if (Edit) {
      setEditedComment(review.comment || "No comment provided.");
      setRating(review.rating || 0);
    } else {
      setEditedComment("");
      setRating(0);
    }
  }
  , [Edit, review]);

  return (
    <div className="flex items-center gap-4 mb-4 mt-2 sm:flex-row flex-col sm:items-start border-gray-600 p-4 rounded-lg shadow-md bg-gray-200">
      <div className={`flex items-center gap-4 self-center w-full sm:w-auto relative  ${Edit? 'self-start' : 'self-center'} `}>
        
        <img
          className="h-10 w-10 rounded-3xl self-start mt-2"
          src={review.userId?.profilePhoto || assetss.profile_icon}
          alt=""
        />
        <div className="text-sm flex flex-col gap-1">
          <p className="ml-1">{review.userId?.name}</p>
          <p className="ml-1"> {new Date(review.createdAt).toLocaleDateString()}</p>
         {!Edit&& <Rating
            name="half-rating-read"
            value={review.rating || 0} 
            precision={1}
            readOnly
          />
         }
         {
          Edit && (
            <Rating
              name="half-rating"
              value={rating}
              precision={1}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          )
         }
        </div>
        {/* Edit icon on small screens only */}
        <div className="ml-auto sm:hidden">
          {isOwner &&
          <img
            className="w-5 sm:w-8 md:w-7 lg:w-6 "
            onClick={() => {
              if(!isOwner) return; // Prevent non-owners from editing
              setEdit(!Edit); 
              if (!Edit) {
                setEditedComment(review.comment || "No comment provided.");
                setRating(review.rating || 0);
              } else {
                setEditedComment("");
                setRating(0);
              }
            }}
            src={assetss.edit_icon}
            alt=""
          />}
        </div>
      </div>
      <div className="sm:text-left sm:px-10 w-full">
        {!Edit && (
          <p className="text-gray-600">
            {review.comment || "No comment provided."}
          </p>
        )}

     {Edit && (
  <div className="flex flex-col gap-2 w-full sm:w-auto">
    <textarea
      className="w-full h-[70px] min-w-[300px] border border-gray-300 rounded-lg p-2 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      rows={4}
      placeholder="Edit your review here..."
      value={editedComment}
      onChange={(e) => setEditedComment(e.target.value)}
    />
      
    <button
      className="self-end bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm cursor-pointer"
      onClick={() => {
        console.log("Saved comment:", editedComment);
        setEdit(false); 
        EditReviewFun(review._id, rating , editedComment);
      }}
    >
      Save
    </button>
  </div>
)}

      </div>

      <div>
        {isOwner && !Edit &&
        <img
          className="w-5 mt-2 sm:block hidden"
          src={assetss.edit_icon}
          alt=""
          onClick={() =>{
          if(isOwner) {
            setEdit(!Edit);
            if (!Edit) {
              setEditedComment(review.comment || "No comment provided.");
              setRating(review.rating || 0);
            } else {
              setEditedComment("");
              setRating(0);
            }
          }
        }

          }
        />
        }
      </div>
    </div>
  );
}

export default ReviewCard