import React, { useState, useEffect } from "react";
import groupService from "../services/groupService";
import userService from "../services/userService";

import expenseService from "../services/expenseService";
import { FaEdit, FaTrash, FaUserMinus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        const groupData = await groupService.fetchGroups();
        console.log("Groups:", groupData);

        const userData = await userService.fetchUsers();
        console.log("Users:", userData);

        const expenseDataArray = await Promise.all(
          groupData.map(async (group) => {
            const expenses = await expenseService.fetchExpensesByGroup(
              group.id
            );
            console.log(`Expenses for group ${group.id}:`, expenses);
            return expenses;
          })
        );

        console.log("Expense Data Array:", expenseDataArray);

        const enrichedGroups = groupData.map((group, index) => {
          console.log(`Raw Group Data for ${group.name}:`, group);

          const groupExpenses = expenseDataArray[index] || [];

          const groupMembers = group.members || [];
          console.log(`Processed Members for ${group.name}:`, groupMembers);

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

        console.log("Enriched Groups:", enrichedGroups);
        setGroups(enrichedGroups);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load group data:", error);
        setError("Failed to load group data");
        setLoading(false);
      }
    };

    loadGroupData();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await groupService.deleteGroup(groupId);
        setGroups(groups.filter((group) => group.id !== groupId));
      } catch (error) {
        setError("Failed to delete group");
      }
    }
  };

  const handleRemoveUser = (groupId, userId) => {
    alert(`Remove user ${userId} from group ${groupId} - Implement API call`);
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
                          <FaUserMinus
                            className="remove-user-icon"
                            onClick={() => handleRemoveUser(group.id, user.id)}
                          />
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
                    <FaEdit className="edit-icon" />
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDeleteGroup(group.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupList;
