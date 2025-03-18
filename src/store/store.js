import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import groupReducer from "./groupSlice";
import userReducer from "./userSlice";
import expenseReducer from "./expenseSlice";
import debtsReducer from "./debtsSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        groups: groupReducer,
        expenses: expenseReducer,
        debts: debtsReducer,

    },
});

export default store;
