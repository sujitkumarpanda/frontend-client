import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, resetAuthState } from "../store/authSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../App.css";
import logo from "../logo.png";

const Navbar = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);

  useEffect(() => {
    if (!token) {
      dispatch(resetAuthState());
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setAlertMessage("Logout successful! Redirecting...");
    setAlertType("success");

    setTimeout(() => {
      setAlertMessage(null);
      navigate("/");
    }, 2000);
  };

  return (
    <>
      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertType} text-center`} role="alert">
          {alertMessage}
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          {/* Navbar Brand with Logo */}
          <Link
            className="navbar-brand custom-brand d-flex align-items-center"
            to="/"
          >
            <img
              src={logo}
              alt="App Logo"
              width="40"
              height="40"
              className="d-inline-block align-top me-2"
            />
            Expense Splitter
          </Link>

          {/* Navbar Toggler for Mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link custom-link" to="/">
                  Home
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link custom-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>

                  <li className="nav-item dropdown">
                    <span
                      className="nav-link dropdown-toggle"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Groups
                    </span>
                    <ul className="dropdown-menu">
                      <li>
                        <Link
                          className="dropdown-item dropdown-custom"
                          to="/create-group"
                        >
                          Create Group
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item dropdown-custom"
                          to="/view-group"
                        >
                          View Group
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <span
                      className="nav-link dropdown-toggle"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Expenses
                    </span>
                    <ul className="dropdown-menu">
                      <li>
                        <Link
                          className="dropdown-item dropdown-custom"
                          to="/add-expense"
                        >
                          Add Expense
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link custom-link" to="/settle-payment">
                      SettlePayments
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-custom-logout mx-4"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="btn btn-custom mx-4" to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-custom mx-2" to="/signup">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
