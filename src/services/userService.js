import axios from "axios";

const API_URL = "http://localhost:5120/api/user";

// Create an Axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT token (except for createUser)
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.url.endsWith("/user")) {
      // Exclude createUser API call
      const token = localStorage.getItem("jwttoken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const userService = {
  fetchUsers: async () => {
    try {
      const response = await axiosInstance.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },

  // ⛔ Excluded from Authorization header
  createUser: async (userData) => {
    try {
      const response = await axios.post(API_URL, userData); // Direct axios call (No token)
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/${userId}`);
      return userId;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  getUsersByGroupId: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users by group ID:", error);
      return [];
    }
  },
};

// ✅ Default export
export default userService;
