import axios from "axios";

const API_URL = "http://localhost:5120/api"; // Change as needed

// Signup API call
const signup = async (userData) => {
  const response = await axios.post(`${API_URL}/user/signup`, userData);
  return response.data;
};

// Login API call
const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);

  console.log("🔍 Full API Response:", response); // Log entire response

  if (response?.data?.token && response?.data?.user) {
    console.log("✅ Extracted Response Data:", response.data);
    return response.data;
  } else {
    throw new Error("Invalid response format - user or token missing");
  }
};

// Logout function
const logout = () => {
  localStorage.removeItem("jwttoken");
};

const authService = { signup, login, logout };
export default authService;
