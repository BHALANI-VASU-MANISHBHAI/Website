import { useEffect } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";

const LocationTracker = () => {
  const { setCurrentLocation,token,backendUrl } = useContext(GlobalContext);
const {  userData} = useContext(UserContext );
    
    useEffect(() => {
    if (!token || userData?.role !== "rider") return; // only track for riders

    const updateLocation = () => {

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            console.log("📍 Updated location:", latitude, longitude);

            // Optionally send to backend
            axios.put(`${backendUrl}/api/rider/update-location`, {
              lat: latitude,
              lng: longitude
            }, {
              headers: {  token }
            });
            console.log("✅ Location sent to backend");
        
          },
          (error) => {
            console.error("❌ Location error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000000,
            timeout: 5000
          }
        );
      }
    };

    updateLocation(); // First time
    const interval = setInterval(updateLocation, 60000); // Every 1 min

    return () => clearInterval(interval); // cleanup
  }, [token, userData]);


    
  return null; // no UI
};

export default LocationTracker;
