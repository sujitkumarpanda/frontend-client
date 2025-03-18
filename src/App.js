import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GroupList from "./components/GroupList";

import AddExpense from "./components/ExpenseForm";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreateGroup from "./components/GroupForm";
import SettlePayment from "./components/SettlePayment";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/view-group" element={<GroupList />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/group-list" element={<GroupList />} />
          <Route path="/edit-group/:groupId" element={<CreateGroup />} />
          <Route path="/settle-payment" element={<SettlePayment />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
