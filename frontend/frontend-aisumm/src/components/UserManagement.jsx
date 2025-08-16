import { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedUserData, setEditedUserData] = useState({ name: "", email: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);

  // Use backend URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/api/auth/user/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchedUser(res.data);
    } catch (err) {
      console.error("User not found by ID:", err);
      // show friendly error message in UI
      setSearchedUser({
        invalid: true,
        errorMessage:
          err.response?.data?.error || `No user found with ID: ${searchId}`, // fallback message
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/api/auth/${id}`, editedUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/signup`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ name: "", email: "", password: "" });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditedUserData({ name: user.name, email: user.email });
  };

  return (
    <div
      style={{
        marginTop: "5rem",
        marginLeft: "3rem",
        marginRight: "3rem",
        paddingRight: "2rem",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "2rem" }}>User Management</h2>

      {/* Top Controls: Add User & Search */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            marginBottom: window.innerWidth < 768 ? "1rem" : "0",
          }}
        >
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            style={{
              width: window.innerWidth < 768 ? "100%" : "auto",
              marginBottom: "0.5rem",
            }}
          >
            {showAddUser ? "Cancel" : "Add New User"}
          </button>
          {showAddUser && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                background: "#413366EB",
              }}
            >
              <h4 style={{ marginBottom: "1rem", color: "white" }}>
                Add New User
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    window.innerWidth < 768 ? "1fr" : "1fr 1fr",
                  gap: "1rem",
                  alignItems: "start",
                }}
              >
                <input
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box",
                    gridColumn: window.innerWidth < 768 ? "1" : "1 / -1",
                  }}
                />
                <button
                  onClick={handleAddUser}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    gridColumn: window.innerWidth < 768 ? "1" : "1 / -1",
                    width: window.innerWidth < 768 ? "100%" : "auto",
                    justifySelf: "start",
                  }}
                >
                  Add User
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Search by ID */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexDirection: window.innerWidth < 480 ? "column" : "row",
            width: window.innerWidth < 768 ? "100%" : "auto",
            maxWidth: window.innerWidth >= 768 ? "300px" : "none",
          }}
        >
          <input
            type="text"
            placeholder="Search by User ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              flex: 1,
              minWidth: "150px",
            }}
          />
          <button
            onClick={handleSearchById}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </div>
      {/* Searched User Result */}

      {searchedUser && (
        <div
          style={{
            border: "1px solid #888",
            padding: "1rem",
            marginBottom: "2rem",
            background: searchedUser.invalid ? "#ffe6e6" : "#f9f9f9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ color: searchedUser.invalid ? "#dc3545" : "black" }}>
              {searchedUser.invalid ? "Error" : "Search Result:"}
            </h4>
            <button
              onClick={() => setSearchedUser(null)}
              style={{
                padding: "0.3rem 0.8rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
          </div>
          {searchedUser.invalid ? (
            <p style={{ color: "#dc3545", fontWeight: "bold" }}>
              {searchedUser.errorMessage}
            </p>
          ) : (
            <>
              <p>
                <strong>Name:</strong> {searchedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {searchedUser.email}
              </p>
              <p>
                <strong>ID:</strong> {searchedUser._id}
              </p>
            </>
          )}
        </div>
      )}

      {/* All Users */}
      <h4 style={{ color: "white" }}>All Users:</h4>
      {users.map((user) => (
        <div
          key={user._id}
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 640 ? "column" : "row",
            justifyContent: "space-between",
            alignItems: window.innerWidth < 640 ? "stretch" : "center",
            padding: "1rem ",
            borderBottom: "1px solid #ddd",
            marginBottom: "0.5rem",
            borderRadius: "4px",
          }}
        >
          {editingUser === user._id ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 640 ? "column" : "row",
                  gap: "0.5rem",
                  flex: 1,
                  alignItems: window.innerWidth < 640 ? "stretch" : "center",
                }}
              >
                <input
                  value={editedUserData.name}
                  onChange={(e) =>
                    setEditedUserData({
                      ...editedUserData,
                      name: e.target.value,
                    })
                  }
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    flex: 1,
                    minWidth: 0,
                  }}
                />
                <input
                  value={editedUserData.email}
                  onChange={(e) =>
                    setEditedUserData({
                      ...editedUserData,
                      email: e.target.value,
                    })
                  }
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    flex: 1,
                    minWidth: 0,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => handleUserUpdate(user._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    flex: window.innerWidth < 640 ? 1 : "none",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    flex: window.innerWidth < 640 ? 1 : "none",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  color: "white",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: window.innerWidth < 480 ? "column" : "row",
                    alignItems:
                      window.innerWidth < 480 ? "flex-start" : "center",
                    gap: window.innerWidth < 480 ? "0.25rem" : "1rem",
                  }}
                >
                  <strong style={{ fontSize: "1rem" }}>{user.name}</strong>
                  <span
                    style={{
                      color: "#ccc",
                      fontSize: "0.9rem",
                    }}
                  >
                    {window.innerWidth < 480 ? "" : "—"} {user.email}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => startEdit(user)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    flex: window.innerWidth < 640 ? 1 : "none",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    flex: window.innerWidth < 640 ? 1 : "none",
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {users.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: "2rem",
            padding: "2rem",
          }}
        >
          <p>No users found. Add some users to get started.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
