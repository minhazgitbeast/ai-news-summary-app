import { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedUserData, setEditedUserData] = useState({ name: '', email: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchedUser(res.data);
    } catch (err) {
      console.error('User not found by ID:', err);
      setSearchedUser(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/${id}`, editedUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ name: '', email: '', password: '' });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditedUserData({ name: user.name, email: user.email });
  };

  return (
    <div>
      <h2>User Management</h2>

      {/* Top Controls: Add User & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => setShowAddUser(!showAddUser)}>
            {showAddUser ? 'Cancel' : 'Add New User'}
          </button>
          {showAddUser && (
            <form onSubmit={handleAddUser} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
              <h4>Add New User</h4>
              <input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <button type="submit">Add User</button>
            </form>
          )}
        </div>

        {/* Search by ID */}
        <form onSubmit={handleSearchById}>
          <input
            type="text"
            placeholder="Search by User ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Searched User Result */}
      {searchedUser && (
        <div style={{ border: '1px solid #888', padding: '1rem', marginBottom: '2rem', background: '#f9f9f9' }}>
          <h4>Search Result:</h4>
          <p><strong>Name:</strong> {searchedUser.name}</p>
          <p><strong>Email:</strong> {searchedUser.email}</p>
          <p><strong>ID:</strong> {searchedUser._id}</p>
        </div>
      )}

      {/* All Users */}
      <h4>All Users:</h4>
      {users.map((user) => (
        <div
          key={user._id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid #ddd',
          }}
        >
          {editingUser === user._id ? (
            <>
              <input
                value={editedUserData.name}
                onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value })}
              />
              <input
                value={editedUserData.email}
                onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
              />
              <div>
                <button onClick={() => handleUserUpdate(user._id)}>Save</button>
                <button onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <span><strong>{user.name}</strong> — {user.email}</span>
              <div>
                <button onClick={() => startEdit(user)}>Edit</button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  style={{ marginLeft: '0.5rem', color: 'red' }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
