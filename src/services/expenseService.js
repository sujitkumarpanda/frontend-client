import axios from "axios";

const API_URL = "http://localhost:5120/api/expenses";

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

const expenseService = {
  // Fetch expenses for a specific group
  fetchExpensesByGroup: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group/${groupId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  },

  // Create a new expense
  createExpense: async (expenseData) => {
    try {
      const response = await axiosInstance.post("/", expenseData);
      return response.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  // Fetch balance summary for a specific group
  fetchGroupBalances: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group/${groupId}/balances`);
      return response.data;
    } catch (error) {
      console.error("Error fetching group balances:", error);
      throw error;
    }
  },

  // Delete an expense by ID
  deleteExpense: async (expenseId) => {
    try {
      await axiosInstance.delete(`/${expenseId}`);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  // Fetch recent expenses for a user
  getRecentExpenses: async (userId) => {
    try {
      const response = await axiosInstance.get(`/recent/${userId}`);
      console.log("getRecentExpenses:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(
        "Error fetching recent expenses:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  // Fetch expense summary for a user
  getExpenseSummary: async (userId) => {
    try {
      const response = await axiosInstance.get(`/summary/${userId}`);
      console.log("Expense Summary Response:", response.data);
      return response.data || {};
    } catch (error) {
      console.error(
        "Error fetching expense summary:",
        error.response?.data || error.message
      );
      return {};
    }
  },
};

// ✅ Export the expenseService object
export default expenseService;
