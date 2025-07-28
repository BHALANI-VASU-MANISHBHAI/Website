import axios from "axios";
import imageCompression from "browser-image-compression";
import { useContext, useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { assetss } from "../assets/frontend_assets/assetss";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
const ProfileView = () => {
  const { userData, setUserData } = useContext(UserContext);
  const { token, backendUrl } = useContext(GlobalContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    isChangePassword: false,
    oldPassword: "",
    newPassword: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImagePhoto, setProfileImagePhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [isChangePassword, setIsChangePassword] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("gender", formData.gender);
      if (isChangePassword) {
        data.append("isChangePassword", "true");
        data.append("oldPassword", changePassword.oldPassword);
        data.append("newPassword", changePassword.newPassword);
      } else {
        data.append("isChangePassword", "false");
      }

      if (selectedFile) {
        data.append("profileImage", selectedFile);
      }
      // isChangePassword;
      const response = await axios.put(
        `${backendUrl}/api/user/updateprofile`,
        data,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserData(response.data.user);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setSelectedFile(compressedFile);
      setProfileImagePhoto(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Image compression error:", error);
      alert("Failed to process image.");
    }
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "",
      });
      setProfileImagePhoto(userData.profilePhoto || assetss.default_profile);
    }
  }, [userData]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-center items-center py-4 bg-gray-300">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-black md:text-4xl text-2xl">My Profile</h1>
          <p className="text-sm text-gray-700">Home / My Profile</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-4 md:px-20">
        <div className="flex flex-col items-center py-6">
          <div className="relative w-20 h-20">
            <img
              className="w-full h-full rounded-full object-cover"
              src={profileImagePhoto}
              alt="Profile"
            />
            <label htmlFor="profileImageUpload">
              <img
                className="h-5 w-5 absolute bottom-0 right-0 bg-white p-[2px] rounded-full shadow border cursor-pointer"
                src={assetss.pencile_icon}
                alt="Edit"
              />
            </label>
            <input
              id="profileImageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block mb-1 font-semibold text-black"
              >
                First Name:
              </label>
              <input
                required
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={onChangeHandler}
                placeholder="First name"
                className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block mb-1 font-semibold text-black"
              >
                Last Name:
              </label>
              <input
                required
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={onChangeHandler}
                placeholder="Last name"
                className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-semibold text-black"
              >
                Email:
              </label>
              <input
                required
                id="email"
                name="email"
                type="email"
                value={userData.email || formData.email}
                disabled
                className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md bg-gray-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block mb-1 font-semibold text-black"
              >
                Phone:
              </label>
              <input
                required
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                pattern="[0-9]{10}"
                maxLength="10"
                onChange={onChangeHandler}
                placeholder="Phone number"
                className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block mb-1 font-semibold text-black"
              >
                Gender:
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={onChangeHandler}
                required
                className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md"
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password Fields */}
            {isChangePassword && (
              <>
                <div className="relative">
                  <label
                    htmlFor="oldPassword"
                    className="block mb-1 font-semibold text-black"
                  >
                    Old Password:
                  </label>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Old password"
                    className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md pr-10"
                    value={changePassword.oldPassword}
                    onChange={(e) =>
                      setChangePassword({
                        ...changePassword,
                        oldPassword: e.target.value,
                      })
                    }
                  />
                  <span
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute top-9 right-3 cursor-pointer text-gray-500"
                  >
                    {showOldPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>

                <div className="relative mt-4">
                  <label
                    htmlFor="newPassword"
                    className="block mb-1 font-semibold text-black"
                  >
                    New Password:
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    className="w-full border border-gray-300 py-1.5 px-3.5 rounded-md pr-10"
                    value={changePassword.newPassword}
                    onChange={(e) =>
                      setChangePassword({
                        ...changePassword,
                        newPassword: e.target.value,
                      })
                    }
                  />
                  <span
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute top-9 right-3 cursor-pointer text-gray-500"
                  >
                    {showNewPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.password && (
              <button
                type="button"
                onClick={() => {
                  setIsChangePassword(!isChangePassword);
                  if (isChangePassword) {
                    setChangePassword({ oldPassword: "", newPassword: "" });
                  }
                }}
                className={`w-full bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-md
                ${loading ? "cursor-not-allowed bg-gray-400 opacity-50" : ""}
                `}
                disabled={loading}
              >
                {isChangePassword
                  ? "Cancel Password Change"
                  : "Change Password"}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-800"
              } text-white py-2 px-4 rounded-md`}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
