import axios from "axios";

const API_URL = "http://localhost:5120/api/debts";

// Create an Axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwttoken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const debtService = {
  // Get user debts
  getUserDebts: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);

      // Ensure response data is an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(
        "Error fetching user debts:",
        error.response?.data || error.message
      );
      return []; // Return an empty array instead of throwing an error
    }
  },
};

// ✅ Default export (best for services)
export default debtService;
