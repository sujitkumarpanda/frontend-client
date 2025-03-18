import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import debtService from "../services/debtService";


// Async Thunk: Fetch debts for the logged-in user
export const fetchUserDebts = createAsyncThunk(
  "debts/fetchUserDebts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await debtService.getUserDebts(userId);
      return response; // Return fetched debts
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch debts");
    }
  }
);

// Initial State
const initialState = {
  debts: [],
  loading: false,
  error: null,
};

// Create Slice
const debtsSlice = createSlice({
  name: "debts",
  initialState,
  reducers: {
    clearDebts: (state) => {
      state.debts = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDebts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDebts.fulfilled, (state, action) => {
        state.loading = false;
        state.debts = action.payload;
      })
      .addCase(fetchUserDebts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export Actions & Reducer
export const { clearDebts } = debtsSlice.actions;
export default debtsSlice.reducer;
