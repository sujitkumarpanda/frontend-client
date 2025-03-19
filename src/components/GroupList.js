import React, { useState, useEffect } from "react";
import groupService from "../services/groupService";
import expenseService from "../services/expenseService";
import { FaEdit, FaTrash, FaUserMinus } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { useNavigate } from "react-router-dom";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "delete" or "removeUser"
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        const groupData = await groupService.fetchGroups();
        console.log("Groups:", groupData);

        const expenseDataArray = await Promise.all(
          groupData.map(async (group) => {
            const expenses = await expenseService.fetchExpensesByGroup(
              group.id
            );
            console.log(`Expenses for group ${group.id}:`, expenses);
            return expenses;
          })
        );

        const enrichedGroups = groupData.map((group, index) => {
          const groupExpenses = expenseDataArray[index] || [];
          const groupMembers = group.members || [];
          const totalExpense = groupExpenses.reduce(
            (sum, exp) => sum + (exp.amount || 0),
            0
          );

          const splitExpenses = groupMembers.map((member) => ({
            name: member.name,
            amountOwed: (totalExpense / (groupMembers.length || 1)).toFixed(2),
          }));

          return {
            ...group,
            members: groupMembers,
            totalExpense,
            splitExpenses,
          };
        });

        setGroups(enrichedGroups);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load group data:", error);
        setError("Failed to load group data");
        setLoading(false);
      }
    };

    // ✅ Detect if payment was settled and refresh data
    if (localStorage.getItem("refreshGroups") === "true") {
      loadGroupData();
      localStorage.removeItem("refreshGroups"); // Clear flag after refresh
    } else {
      loadGroupData();
    }
  }, []);

  const handleDeleteGroup = async () => {
    if (selectedGroupId) {
      try {
        await groupService.deleteGroup(selectedGroupId);
        setGroups(groups.filter((group) => group.id !== selectedGroupId));
        setShowModal(false);
      } catch (error) {
        setError("Failed to delete group");
      }
    }
  };

  const handleRemoveUser = async () => {
    if (selectedGroupId && selectedUserId) {
      try {
        await groupService.removeUserFromGroup(selectedGroupId, selectedUserId);

        // Update UI after removal
        setGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === selectedGroupId) {
              const updatedMembers = group.members.filter(
                (user) => user.id !== selectedUserId
              );

              // Recalculate split expenses after user removal
              const totalExpense = group.totalExpense;
              const newSplitExpenses = updatedMembers.map((member) => ({
                name: member.name,
                amountOwed: (
                  totalExpense / (updatedMembers.length || 1)
                ).toFixed(2),
              }));

              return {
                ...group,
                members: updatedMembers,
                splitExpenses: newSplitExpenses, // ✅ Update split expense calculation
              };
            }
            return group;
          })
        );

        setShowModal(false);
      } catch (error) {
        setError("Failed to remove user from group");
      }
    }
  };

  return (
    <div className="container group-list-container">
      <h2 className="text-start group-list-heading">Group List</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered group-table">
            <thead className="table-header">
              <tr>
                <th>Group Name</th>
                <th>Description</th>
                <th>Members</th>
                <th>Total Expense</th>
                <th>Split Expenses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || "N/A"}</td>
                  <td>
                    <ul className="group-members-list">
                      {group.members.map((user) => (
                        <li key={user.id} className="group-member">
                          {user.name}{" "}
                          {/* ✅ Hide the remove icon for the logged-in user */}
                          {user.id !==
                            JSON.parse(localStorage.getItem("user"))?.id && (
                            <FaUserMinus
                              className="remove-user-icon"
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setSelectedUserId(user.id);
                                setModalType("removeUser");
                                setShowModal(true);
                              }}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td>${group.totalExpense.toFixed(2)}</td>
                  <td>
                    <ul className="split-expense-list">
                      {group.splitExpenses.map(({ name, amountOwed }) => (
                        <li key={name}>
                          {name}: ${amountOwed}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <FaEdit
                      className="edit-icon"
                      onClick={() => navigate(`/edit-group/${group.id}`)} // ✅ Pass groupId
                    />
                    <FaTrash
                      className="delete-icon"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setModalType("delete");
                        setShowModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bootstrap Modal for both Delete Group & Remove User */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "delete" ? "Confirm Delete" : "Remove User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "delete"
            ? "Are you sure you want to delete this group?"
            : "Are you sure you want to remove this user from the group?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={modalType === "delete" ? "danger" : "warning"}
            onClick={
              modalType === "delete" ? handleDeleteGroup : handleRemoveUser
            }
          >
            {modalType === "delete" ? "Delete" : "Remove"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GroupList;
