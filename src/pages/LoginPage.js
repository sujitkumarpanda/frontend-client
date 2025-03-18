import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { Formik, Field, ErrorMessage, Form as FormikForm } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice"; 
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(4, "Password must be at least 4 characters").required("Password is required"),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth || {});

  const [successMessage, setSuccessMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showLoader, setShowLoader] = useState(false); // Loader state

  const handleLogin = async (values, { setSubmitting }) => {
    setSuccessMessage("");
    setErrorMessage("");
    setShowLoader(true); // Show loader

    setTimeout(async () => {
      try {
        const response = await dispatch(loginUser(values)).unwrap();
        console.log("Login Response:", response);

        if (response?.token) {
          setSuccessMessage("Login successful! Redirecting...");
          setTimeout(() => {
            setSuccessMessage("");
            navigate("/dashboard");
          }, 2000);
        } else {
          setErrorMessage("Invalid login response format.");
        }
      } catch (error) {
        setErrorMessage(error?.message || "Login failed. Please try again.");
      }
      setShowLoader(false); // Hide loader
      setSubmitting(false);
    }, 3000);
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6} className="login-form-container">
          <h2 className="text-center user-login mb-4">User Login</h2>

          {showLoader && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
          {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

          <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={handleLogin}>
            {({ isSubmitting }) => (
              <FormikForm>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Field type="email" name="email" className="form-control" placeholder="Enter email" />
                  <ErrorMessage name="email" component="div" className="text-danger small" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Field type="password" name="password" className="form-control" placeholder="Password" />
                  <ErrorMessage name="password" component="div" className="text-danger small" />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button className="btn btn-custom-login" type="submit" disabled={isSubmitting || loading || showLoader}>
                    {isSubmitting || loading || showLoader ? "Logging in..." : "Login"}
                  </Button>
                  <span className="me-3">
                    Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
                  </span>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
