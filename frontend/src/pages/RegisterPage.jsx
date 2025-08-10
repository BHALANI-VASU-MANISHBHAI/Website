import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUserData } = useContext(UserContext);
  const { setToken, backendUrl } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password,
        role: "user",
        cartData: JSON.parse(localStorage.getItem("cartData")) || [],
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);

        const profileRes = await axios.post(
          `${backendUrl}/api/user/getdataofuser`,
          {},
          { headers: { token: response.data.token } }
        );

        if (profileRes.data.success) {
          setUserData(profileRes.data.user);
          toast.success("Successfully signed up");
          navigate("/");
        }
      } else {
        toast.error(response.data.message || "Signup failed");
      }
    } catch (err) {
      toast.error(err.message || "Signup error");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-700 bg-white p-6 rounded-lg shadow-md border"
    >
      <h2 className="text-2xl mb-2">Sign Up</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />
      <Link to="/login" className="text-sm w-full text-right">
        Already have an account?
      </Link>
      <button className="bg-black text-white font-light px-8 py-2 mt-2">
        Sign Up
      </button>
    </form>
  );
};

export default RegisterPage;
