import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

import groupService from "../services/groupService";// Import createGroup API call
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaTimes } from "react-icons/fa"; // Import delete icon

const CreateGroup = () => {
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [users, setUsers] = useState([]); // List of available users
    const [selectedUsers, setSelectedUsers] = useState([]); // Selected user IDs
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true); // Loading users
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading for submit

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch users from API
        const loadUsers = async () => {
            try {
                const response = await userService.fetchUsers();
                setUsers(response);
            } catch (error) {
                setMessage({ type: "danger", text: "Failed to load users" });
            } finally {
                setLoading(false); // Stop loading when done
            }
        };

        loadUsers();
    }, []);

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

        setIsSubmitting(true); // Start submit loading

        // Prepare group data for API call
        const groupData = {
            name: groupName,
            description,
            members: selectedUsers.map((user) => user.id), // Extract user IDs
        };

        try {
            await groupService.createGroup(groupData);
            setMessage({ type: "success", text: "Group created successfully!" });
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setMessage({ type: "danger", text: "Failed to create group. Please try again!" });
        } finally {
            setIsSubmitting(false); // Stop submit loading
        }
    };

    // Handle selecting a user
    const addUserToGroup = (user) => {
        if (!selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // Handle removing a user
    const removeUserFromGroup = (user) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    };

    return (
        <div className="container create-group-container">
           <h2 className="text-start create-group-heading">Create a New Group</h2>

            {message && (
                <div className={`alert alert-${message.type}`} role="alert">
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="create-group-form">
                <div className="mb-3">
                    <label className="form-label">Group Name</label>
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
                        {loading ? ( // Show spinner while loading
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
                                    <FaTimes className="remove-icon" onClick={() => removeUserFromGroup(user)} />
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-custom-creategroup" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Creating...
                            </>
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
