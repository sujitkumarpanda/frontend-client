import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";

// Async Thunks
export const fetchUsersAsync = createAsyncThunk("users/fetchUsers", async () => {
    return await userService.fetchUsers();
});

export const getUserByIdAsync = createAsyncThunk("users/getUserById", async (userId) => {
    return await userService.getUserById(userId);
});

export const createUserAsync = createAsyncThunk("users/createUser", async (userData) => {
    return await userService.createUser(userData);
});

export const deleteUserAsync = createAsyncThunk("users/deleteUser", async (userId) => {
    return await userService.deleteUser(userId);
});

// ✅ New: Fetch users by group ID
export const getUsersByGroupIdAsync = createAsyncThunk(
    "users/getUsersByGroupId",
    async (groupId) => {
        return await userService.getUsersByGroupId(groupId);
    }
);

// User Slice
const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        groupUsers: [], // ✅ New: Store users by group
        selectedUser: null,
        loading: false,
        error: null,
    },
    reducers: {}, 
    extraReducers: (builder) => {
        builder
            // Fetch All Users
            .addCase(fetchUsersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Fetch User by ID
            .addCase(getUserByIdAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserByIdAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(getUserByIdAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // ✅ Fetch Users by Group ID
            .addCase(getUsersByGroupIdAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUsersByGroupIdAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groupUsers = action.payload; // ✅ Update groupUsers state
            })
            .addCase(getUsersByGroupIdAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create User
            .addCase(createUserAsync.fulfilled, (state, action) => {
                state.users.push(action.payload);
            })

            // Delete User
            .addCase(deleteUserAsync.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
            });
    },
});

export default userSlice.reducer;
