import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import expenseService from "../services/expenseService"; // ✅ Correct Import

// Fetch expenses for a group
export const fetchExpensesByGroupAsync = createAsyncThunk(
    "expenses/fetchExpensesByGroup",
    async (groupId, { rejectWithValue }) => {
        try {
            return await expenseService.fetchExpensesByGroup(groupId);
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch expenses");
        }
    }
);

// Create a new expense
export const createExpenseAsync = createAsyncThunk(
    "expenses/createExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            return await expenseService.createExpense(expenseData);
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to create expense");
        }
    }
);

// Fetch group balances
export const fetchGroupBalancesAsync = createAsyncThunk(
    "expenses/fetchGroupBalances",
    async (groupId, { rejectWithValue }) => {
        try {
            return await expenseService.fetchGroupBalances(groupId);
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch balances");
        }
    }
);

// Delete an expense
export const deleteExpenseAsync = createAsyncThunk(
    "expenses/deleteExpense",
    async (expenseId, { rejectWithValue }) => {
        try {
            await expenseService.deleteExpense(expenseId);
            return expenseId; // ✅ Return deleted expense ID
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to delete expense");
        }
    }
);

// ✅ Initial State
const initialState = {
    expenses: [],
    balances: {},
    loading: false,
    error: null,
};

const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            // 🔹 Fetch Expenses
            .addCase(fetchExpensesByGroupAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpensesByGroupAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchExpensesByGroupAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔹 Create Expense
            .addCase(createExpenseAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createExpenseAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses.push(action.payload);
            })
            .addCase(createExpenseAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔹 Fetch Group Balances
            .addCase(fetchGroupBalancesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupBalancesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.balances = action.payload;
            })
            .addCase(fetchGroupBalancesAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔹 Delete Expense
            .addCase(deleteExpenseAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteExpenseAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = state.expenses.filter((expense) => expense.id !== action.payload);
            })
            .addCase(deleteExpenseAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// ✅ Export the reducer
export default expenseSlice.reducer;
