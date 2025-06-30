import  { useContext, useState, useEffect } from 'react';
import { assetss } from '../assets/frontend_assets/assetss';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";


const ProfileView = () => {
  const {userData ,setUserData} = useContext(UserContext);
  const { token, backendUrl } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImagePhoto, setProfileImagePhoto] = useState('');
  const [loading, setLoading] = useState(false);

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
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('gender', formData.gender);

      if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      const response = await axios.put(
        `${backendUrl}/api/user/updateprofile`,
        data,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000, 
        }
      );

      setUserData(response.data.user);
      alert(' Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(' Error updating profile. Please try again.');
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
      console.error('Image compression error:', error);
      alert(' Failed to process image.');
    }
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
      });

      setProfileImagePhoto(userData.profilePhoto || assetss.default_profile);
    }
  }, [userData]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-center items-center py-4 bg-gray-300">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-black md:text-4xl text-2xl">My&nbsp;Profile</h1>
          <p className="self-center">Home / My Profile</p>
        </div>
      </div>

      {/* Profile Image + Form */}
      <div className="p-6 md:px-20">
        <div className="flex flex-col items-center gap-4 py-6">
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
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block mb-1 font-bold text-black">
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
                className="border border-gray-300 py-1.5 px-3.5 rounded-md w-full"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block mb-1 font-bold text-black">
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
                className="border border-gray-300 py-1.5 px-3.5 rounded-md w-full"
              />
            </div>

            {/* Email */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="email" className="block mb-1 font-bold text-black">
                Email:
              </label>
              <input
                required
                id="email"
                name="email"
                type="email"
                
                value={userData.email || formData.email}
                disabled
                placeholder="Email address"
                className="border border-gray-300 py-1.5 px-3.5 rounded-md w-full"
              
              />
            </div>

            {/* Phone */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="phone" className="block mb-1 font-bold text-black">
                Phone:
              </label>
              <input
                required
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={onChangeHandler}
                placeholder="Phone number"
                className="border border-gray-300 py-1.5 px-3.5 rounded-md w-full"
              />
            </div>

            {/* Gender */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="gender" className="block mb-1 font-bold text-black">
                Gender:
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={onChangeHandler}
                required
                className="border border-gray-300 py-1.5 px-3.5 rounded-md w-full"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="col-span-1">
              <button
                type="submit"
                className={`${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-800'
                } text-white py-2 px-4 rounded-md transition-colors`}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
