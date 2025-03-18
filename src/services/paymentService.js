import axios from "axios";

const API_URL = "http://localhost:5120/api/payments";

// ✅ Create Axios instance with Authorization header
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// ✅ Attach Authorization token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwttoken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Settle a Payment
const settlePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/settle", paymentData);
    return response.data;
  } catch (error) {
    console.error(
      "Error settling payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Export the service functions
const paymentService = {
  settlePayment,
};

export default paymentService;
