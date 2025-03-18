import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  FormCheck,
} from "react-bootstrap";

import expenseService from "../services/expenseService";
import groupService from "../services/groupService";
import "bootstrap/dist/css/bootstrap.min.css";

const AddExpense = () => {
  const [groups, setGroups] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {}; // Fetch logged-in user

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const allGroups = await groupService.getUserGroups(user.id);
        const filteredGroups = allGroups.filter(
          (group) => group.members.some((member) => member.id === user.id) // ✅ Only groups where user as a member
        );
        setGroups(filteredGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [user.id]);

  const initialValues = {
    groupId: "",
    description: "",
    amount: "",
    payerId: user.id,
  };

  const validationSchema = Yup.object({
    groupId: Yup.string().required("Group is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    description: Yup.string().required("Description is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      await expenseService.createExpense(values);
      setAlert({ type: "success", message: "Expense added successfully!" });
      resetForm();
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to add expense. Try again.",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Container className="expense-container">
      <Row className="justify-content-center">
        <Col xs={12} md={12}>
          <div className="expense-form-container p-4 shadow-sm rounded">
            <h2 className="text-right expense-title mb-4">Add Expense</h2>

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
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <div className="mb-3">
                    <label className="form-label">
                      Select Group: <span className="text-danger">*</span>
                    </label>
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <FormCheck
                          key={group.id}
                          type="radio"
                          label={group.name}
                          name="groupId"
                          value={group.id}
                          checked={values.groupId === group.id}
                          onChange={() => setFieldValue("groupId", group.id)}
                        />
                      ))
                    ) : (
                      <p>No groups found</p>
                    )}
                    <ErrorMessage
                      name="groupId"
                      component="div"
                      className="text-danger small"
                    />
                  </div>

                  {/* Description Field */}
                  <div className="mb-3">
                    <label className="form-label">Description:</label>
                    <Field
                      type="text"
                      name="description"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-danger small"
                    />
                  </div>

                  {/* Amount Field */}
                  <div className="mb-3">
                    <label className="form-label">
                      Amount: <span className="text-danger">*</span>
                    </label>
                    <Field
                      type="number"
                      name="amount"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="amount"
                      component="div"
                      className="text-danger small"
                    />
                  </div>

                  {/* Payer Field (Auto-filled, Non-Editable) */}
                  <div className="mb-3">
                    <label className="form-label">Payer:</label>
                    <input
                      type="text"
                      value={`${user.name}`}
                      className="form-control"
                      disabled
                    />
                  </div>

                  {/* Submit Button with Spinner */}
                  <Row>
                    <Col className="text-right">
                      <Button
                        type="submit"
                        className="btn-custom-expense "
                        disabled={isSubmitting}
                      >
                        {isSubmitting || loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />{" "}
                            Adding...
                          </>
                        ) : (
                          "Add Expense"
                        )}
                      </Button>
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

export default AddExpense;
