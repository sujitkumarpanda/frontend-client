import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "bootstrap/dist/css/bootstrap.min.css";

const Signup = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: "", message: "" });

  const initialValues = {
    name: "",
    email: "",
    PasswordHash: "",
    phoneNumber: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    PasswordHash: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await authService.signup(values);
      setAlert({
        type: "success",
        message: "Signup successful! Redirecting...",
      });

      setTimeout(() => {
        resetForm();
        navigate("/"); // Redirect to login after 2 seconds
      }, 2000);
    } catch (error) {
      console.error("Signup Error:", error);
      setAlert({ type: "danger", message: "Signup failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <div className="signup-form-container p-4 shadow-sm rounded">
            <h2 className="text-center user-signup mb-4">Signup</h2>

            {/* Success or Error Alert */}
            {alert.message && (
              <Alert variant={alert.type} className="text-center">
                {alert.message}
              </Alert>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Row>
                    <Col md={12}>
                      {/* Name Field */}
                      <div className="mb-3">
                        <label className="form-label">
                          Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          type="text"
                          name="name"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-danger small"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="mb-3">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <Field
                          type="email"
                          name="email"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-danger small"
                        />
                      </div>

                      {/* Password Field */}
                      <div className="mb-3">
                        <label className="form-label">
                          Password <span className="text-danger">*</span>
                        </label>
                        <Field
                          type="password"
                          name="PasswordHash"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="PasswordHash"
                          component="div"
                          className="text-danger small"
                        />
                      </div>

                      {/* Phone Number Field */}
                      <div className="mb-3">
                        <label className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          type="text"
                          name="phoneNumber"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="phoneNumber"
                          component="div"
                          className="text-danger small"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col className="text-center">
                      <Button
                        type="submit"
                        className="btn-custom-signup w-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />{" "}
                            Signing Up...
                          </>
                        ) : (
                          "Signup"
                        )}
                      </Button>
                    </Col>
                  </Row>

                  <Row className="text-center mt-3">
                    <Col>
                      Already have an account?{" "}
                      <Link to="/login" className="signup-link">
                        Login
                      </Link>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
