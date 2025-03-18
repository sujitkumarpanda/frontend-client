import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../services/userService";
import groupService from "../services/groupService";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaTimes } from "react-icons/fa";

const CreateGroup = () => {
  const { groupId } = useParams(); // ✅ Get group ID from URL for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]); // Available users
  const [selectedUsers, setSelectedUsers] = useState([]); // Selected user IDs
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {}; // Logged-in user

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.fetchUsers();
        const filteredUsers = response.filter(
          (user) => user.id !== loggedInUser.id
        );
        setUsers(filteredUsers);
        setSelectedUsers([{ id: loggedInUser.id, name: loggedInUser.name }]); // Auto-add logged-in user
      } catch (error) {
        setMessage({ type: "danger", text: "Failed to load users" });
      } finally {
        setLoading(false);
      }
    };

    const loadGroupData = async () => {
      if (!groupId) return; // ✅ If no `groupId`, it's create mode

      try {
        setIsEditMode(true); // ✅ Ensure edit mode is set BEFORE fetching data
        const group = await groupService.getGroupById(groupId);
        console.log("Fetched Group Data:", group); // 🔍 Debugging log

        if (group) {
          setGroupName(group.name);
          setDescription(group.description || "");

          // ✅ Ensure group.members is properly set
          const groupMembers = group.members || [];
          console.log("Fetched Group Members:", groupMembers);

          // ✅ Set selected users with existing group members
          const updatedMembers = [
            { id: loggedInUser.id, name: loggedInUser.name }, // Ensure logged-in user is included
            ...groupMembers.filter((m) => m.id !== loggedInUser.id),
          ];

          console.log("Updated Selected Users:", updatedMembers);
          setSelectedUsers(updatedMembers);

          // ✅ Filter out selected users from the invite list
          setUsers((prevUsers) =>
            prevUsers.filter(
              (user) => !updatedMembers.some((m) => m.id === user.id)
            )
          );
        }
      } catch (error) {
        console.error("Failed to load group:", error);
        setMessage({ type: "danger", text: "Failed to load group details." });
      }
    };

    const fetchData = async () => {
      await loadUsers(); // ✅ First, load all available users
      await loadGroupData(); // ✅ Then remove selected users from the list
      setLoading(false); // ✅ Ensure UI updates after all data loads
    };
    fetchData();
  }, [loggedInUser.id, groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setMessage({ type: "danger", text: "Group name is required!" });
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage({ type: "danger", text: "Please add at least one member!" });
      return;
    }

    setIsSubmitting(true);
    const groupData = {
      name: groupName,
      description: description,
      members: selectedUsers.map((user) => user.id),
    };

    try {
      if (isEditMode) {
        await groupService.updateGroup(groupId, groupData);
        setMessage({ type: "success", text: "Group updated successfully!" });
      } else {
        await groupService.createGroup(groupData);
        setMessage({ type: "success", text: "Group created successfully!" });
      }
      setTimeout(() => navigate("/group-list"), 2000);
    } catch (error) {
      setMessage({
        type: "danger",
        text: isEditMode
          ? "Failed to update group. Try again!"
          : "Failed to create group. Try again!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add user to group
  const addUserToGroup = (user) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  // Remove user from group (except logged-in user)
  const removeUserFromGroup = (user) => {
    if (user.id === loggedInUser.id) return;
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    setUsers([...users, user]);
  };

  return (
    <div className="container create-group-container">
      <h2 className="text-start create-group-heading">
        {isEditMode ? "Update Group" : "Create a New Group"}
      </h2>

      {message && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="mb-3">
          <label className="form-label">
            Group Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control custom-input"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-control custom-input"
            rows="3"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Selectable Users */}
        <div className="mb-3">
          <label className="form-label">Invite Members</label>
          <div className="user-list">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="btn btn-outline-primary user-button"
                  onClick={() => addUserToGroup(user)}
                >
                  {user.name}
                </button>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Selected Members</label>
            <div className="selected-users">
              {selectedUsers.map((user) => (
                <span key={user.id} className="selected-user">
                  {user.name}
                  {user.id !== loggedInUser.id && (
                    <FaTimes
                      className="remove-icon"
                      onClick={() => removeUserFromGroup(user)}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-custom-creategroup"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
