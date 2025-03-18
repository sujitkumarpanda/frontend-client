import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import groupService from "../services/groupService";

// Fetch all groups (Async action)
export const fetchGroupsAsync = createAsyncThunk("groups/fetchGroups", async () => {
    return await groupService.fetchGroups();
});

// ✅ Fetch group by ID (Async action)
export const getGroupByIdAsync = createAsyncThunk(
    "groups/getGroupById",
    async (groupId) => {
        return await groupService.getGroupById(groupId);
    }
);

// Create group (Async action)
export const createGroupAsync = createAsyncThunk("groups/createGroup", async (groupData) => {
    return await groupService.createGroup(groupData);
});

// Delete group (Async action)
export const deleteGroupAsync = createAsyncThunk("groups/deleteGroup", async (groupId) => {
    await groupService.deleteGroup(groupId);
    return groupId; // Return the deleted group's ID to remove it from the state
});

// Update group (Async action)
export const updateGroupAsync = createAsyncThunk("groups/updateGroup", async ({ groupId, updatedData }) => {
    return await groupService.updateGroup(groupId, updatedData);
});

const groupSlice = createSlice({
    name: "groups",
    initialState: {
        groups: [],
        selectedGroup: null, // ✅ Store selected group
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            // Fetch all groups
            .addCase(fetchGroupsAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGroupsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroupsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // ✅ Fetch group by ID
            .addCase(getGroupByIdAsync.pending, (state) => {
                state.loading = true;
                state.selectedGroup = null;
            })
            .addCase(getGroupByIdAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedGroup = action.payload;
            })
            .addCase(getGroupByIdAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create a new group
            .addCase(createGroupAsync.fulfilled, (state, action) => {
                state.groups.push(action.payload);
            })

            // Delete a group
            .addCase(deleteGroupAsync.fulfilled, (state, action) => {
                state.groups = state.groups.filter((group) => group.id !== action.payload);
            })

            // Update a group
            .addCase(updateGroupAsync.fulfilled, (state, action) => {
                const index = state.groups.findIndex((group) => group.id === action.payload.id);
                if (index !== -1) {
                    state.groups[index] = action.payload;
                }
            });
    },
});

export default groupSlice.reducer;
