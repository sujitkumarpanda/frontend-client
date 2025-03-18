import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

// Check if a valid token exists
const storedToken = localStorage.getItem("jwttoken");
const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken, // Only true if token exists
  loading: false,
  error: null,
};

// Async thunk for user signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Signup failed"
      );
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      console.log("🔍 Redux Thunk Response:", response);

      if (!response?.token || !response?.user) {
        throw new Error("Invalid response format from server");
      }
      localStorage.setItem("jwttoken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response; // Must contain { user, token }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await authService.logout();
    localStorage.removeItem("jwttoken");
    localStorage.removeItem("user");
    dispatch(resetAuthState()); // 👈 Reset Redux state
  }
);

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("jwttoken");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // state.token = action.payload.token;
        state.isAuthenticated = true;

        // Store user data and token in localStorage
        // localStorage.setItem("jwttoken", action.payload.token);
        // localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;

        // Store user data and token in localStorage
        localStorage.setItem("jwttoken", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        // Remove user and token from localStorage
        localStorage.removeItem("jwttoken");
        localStorage.removeItem("user");
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
