import axios from "axios";

const API_URL = "http://localhost:5120/api/groups";

// Axios instance with Authorization header
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add Authorization header before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwttoken"); // Retrieve token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch all groups
const fetchGroups = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

// Create a new group
const createGroup = async (groupData) => {
  try {
    const response = await axiosInstance.post("/", groupData);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Delete a group by ID
const deleteGroup = async (groupId) => {
  try {
    await axiosInstance.delete(`/${groupId}`);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Update a group by ID
const updateGroup = async (groupId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/${groupId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

// Get groups for a specific user
const getUserGroups = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching user groups:",
      error.response?.data || error.message
    );
    return [];
  }
};

// Fetch group by ID
const getGroupById = async (groupId) => {
  try {
    const response = await axiosInstance.get(`/${groupId}`);
    return response.data || {};
  } catch (error) {
    console.error(
      "Error fetching group by ID:",
      error.response?.data || error.message
    );
    return {};
  }
};

// ✅ Correctly Export the Functions in an Object
const groupService = {
  fetchGroups,
  createGroup,
  deleteGroup,
  updateGroup,
  getUserGroups,
  getGroupById,
};

export default groupService;
