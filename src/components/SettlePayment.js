import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import groupService from "../services/groupService";
import paymentService from "../services/paymentService";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const SettlePayment = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userGroups = await groupService.getUserGroups(loggedInUser.id);
        setGroups(userGroups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        setMessage({ type: "danger", text: "Failed to load groups." });
      }
    };

    fetchGroups();
  }, [loggedInUser.id]);

  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);
    try {
      const group = await groupService.getGroupById(groupId);
      setGroupMembers(
        group.members.filter((user) => user.id !== loggedInUser.id)
      );
    } catch (error) {
      console.error("Failed to fetch group members:", error);
    }
  };

  return (
    <div className="container settle-payment-container">
      <h2 className="text-start settle-payment-heading">Settle Payment</h2>

      {message && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <Formik
        initialValues={{
          groupId: "",
          fromUserId: loggedInUser.id,
          toUserId: "",
          amount: "",
        }}
        validationSchema={Yup.object({
          groupId: Yup.string().required("Group is required"),
          toUserId: Yup.string().required("Recipient is required"),
          amount: Yup.number()
            .positive("Amount must be a positive number")
            .required("Amount is required"),
        })}
        onSubmit={async (values, { resetForm }) => {
          setIsSubmitting(true);
          try {
            await paymentService.settlePayment(values);
            setMessage({
              type: "success",
              text: "Payment settled successfully!",
            });
            // ✅ Force group data reload in GroupList after payment
            localStorage.setItem("refreshGroups", "true");
            setTimeout(() => navigate("/group-list"), 2000);
          } catch (error) {
            setMessage({
              type: "danger",
              text: "Failed to settle payment. Try again!",
            });
          } finally {
            setIsSubmitting(false);
            resetForm();
          }
        }}
      >
        {({ setFieldValue }) => (
          <Form className="settle-payment-form">
            <div className="mb-3">
              <label className="form-label">
                Group<span className="text-danger">*</span>
              </label>
              <Field
                as="select"
                className="form-control custom-input"
                name="groupId"
                onChange={(e) => {
                  setFieldValue("groupId", e.target.value);
                  handleGroupChange(e.target.value);
                }}
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="groupId"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">From (You)</label>
              <input
                type="text"
                className="form-control custom-input"
                value={loggedInUser.name}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                To (Recipient)<span className="text-danger">*</span>
              </label>
              <Field
                as="select"
                className="form-control custom-input"
                name="toUserId"
              >
                <option value="">Select a recipient</option>
                {groupMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="toUserId"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Amount<span className="text-danger">*</span>
              </label>
              <Field
                type="number"
                className="form-control custom-input"
                name="amount"
                placeholder="Enter amount"
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-custom-settle"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Settling...
                  </>
                ) : (
                  "Settle Payment"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SettlePayment;
