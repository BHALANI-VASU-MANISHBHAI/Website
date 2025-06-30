import React from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext.jsx";
import { GlobalContext } from "../contexts/GlobalContext.jsx";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Profile = () => {
  const [notValidFilled, setNotValidFilled] = React.useState({});
  const [profilePhoto, setProfilePhoto] = React.useState(
    "https://res.cloudinary.com/drezv2fgf/image/upload/v1748439973/Profile_avatar_placeholder_large_px5gio.png"
  );
  const [profileFile, setProfileFile] = React.useState(null);
  const [updating , setUpdating] = React.useState(false);

  const { userData, setUserData } = React.useContext(UserContext);
  const { token, backendUrl } = React.useContext(GlobalContext);

  const [formData, setFormData] = React.useState(null);
  const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const iso = date.toISOString();
  return iso.split("T")[0]; // YYYY-MM-DD
};
useEffect(() => {
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log("Current Location:", { lat, lng });
  },
  (error) => {
    console.error("Error getting location:", error);
  }
);
}, []);

  React.useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || userData.name?.split(" ")[0] || "",
        lastName: userData.lastName || userData.name?.split(" ")[1] || "",
        dateOfBirth: formatDate(userData.dateOfBirth),  // ✅ formatted here
        phone: userData.phone || "",
        vehicleNumber: userData.vehicleNumber || "",
        gender: userData.gender || "",
        profilePhoto: userData.profilePhoto || profilePhoto,
        available: userData.available || false,
      });
      setProfilePhoto(userData.profilePhoto || profilePhoto);
    }
  }, [userData]);

  const ValidationInput = (name, value) => {
   
    let errors = {};

    if (name === "phone" && !/^[0-9]{10}$/.test(value)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    if (name === "vehicleNumber" && !/^[A-Z0-9-]*$/.test(value)) {
      errors.vehicleNumber =
        "Vehicle number must be uppercase letters, numbers or dashes";
    }

    setNotValidFilled((prev) => ({ ...prev, ...errors }));

    if (!errors[name]) {
      setNotValidFilled((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
     console.log("Validating input:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    ValidationInput(name, value);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (updating) return;
    setUpdating(true);

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("dateOfBirth", formData.dateOfBirth);
    data.append("phone", formData.phone);
    data.append("vehicleNumber", formData.vehicleNumber);
    data.append("gender", formData.gender);
    data.append("available", formData.available);

    // ✅ Append the real file only if selected
    if (profileFile) {
      data.append("profileImage", profileFile);
    }

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

    if (response.data.success) {
      setUserData(response.data.user);
      console.log("Profile updated successfully:", response.data.user);
      toast.success("Profile updated successfully");
    } else {
      toast.error("Profile update failed: " + response.data.message);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile. Please try again.");
  } finally {
    setUpdating(false);
  }
};


  if (!formData) {
    return <p className="text-center py-10">Loading profile...</p>;
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    /^[0-9]{10}$/.test(formData.phone) &&
    /^[A-Z0-9-]+$/.test(formData.vehicleNumber);

  return (
    <div className="min-h-screen w-[80%] mx-auto flex flex-col mt-10">
      <div className="bg-gray-200 p-4">
        <h1 className="text-2xl font-bold text-center my-6">My Profile</h1>
      </div>

      <div className="flex-1 flex items-center justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full p-6 bg-white shadow rounded-lg"
        >
          <div className="flex gap-6 items-center mb-6">
            <div className="flex items-center gap-4">
              <label htmlFor="profileImageInput">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover cursor-pointer"
                />
              </label>
              <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeMB = 1; // 1MB limit
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      toast.error("Please select an image under 1MB.");
      return;
    }

    setProfilePhoto(URL.createObjectURL(file));
    setProfileFile(file);
  }}
    id="profileImageInput"
    className="hidden"
/>

            </div>
            <div>
              <p className="text-lg font-semibold">
                {userData.firstName} {userData.lastName}
              </p>
              <p className="text-gray-600">{userData?.email}</p>
              <p className="text-sm text-gray-500">Rider</p>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) =>{
                    console.log("Checkbox changed:", e.target.checked) 
                    setFormData((prev) => ({
                      ...prev,
                      available: e.target.checked,
                    }))
                  }
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Available for delivery
                </span>
              </label>
              </div>  
          </div>

          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 border py-1.5 px-3.5 rounded-md w-full"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                pattern="[0-9]{10}"
                inputMode="numeric"
                className="mt-1 w-full border rounded px-3 py-2"
              />
              {notValidFilled.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {notValidFilled.phone}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
              {notValidFilled.vehicleNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {notValidFilled.vehicleNumber}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={
                  !isFormValid || Object.keys(notValidFilled).length > 0
                }
                className={`px-4 py-2 mt-4 rounded text-white ${
                  isFormValid && Object.keys(notValidFilled).length === 0
                    ? "bg-gray-500 hover:bg-gray-600 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
