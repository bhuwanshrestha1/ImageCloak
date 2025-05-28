import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSignOutAlt } from 'react-icons/fa';  // Import logout icon

const AdminDash = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', fullname: '', email: '', password: '', role: 'user' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // You can customize the number of users per page

  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all users' data when the admin dashboard is loaded
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('image-cloak-user');
    setAuthUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteUser = async (user) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== user._id)); // Remove deleted user from the list
        toast.success('User deleted successfully');
        closeDeleteModal();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const openEditUserModal = (user) => {
    setUserToEdit(user);
    setIsEditUserModalOpen(true);
  };

  const closeEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!userToEdit.username || !userToEdit.fullname || !userToEdit.email ) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToEdit),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
      toast.success('User updated successfully');
      closeEditUserModal();
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.fullname || !newUser.email || !newUser.password || !newUser.role) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const data = await response.json();
      setUsers([...users, data]);
      setNewUser({ username: '', fullname: '', email: '', password: '', role: 'user' }); // Reset form
      toast.success('User added successfully');
      closeAddUserModal(); // Close the modal
    } catch (error) {
      toast.error(error.message || 'Error adding user');
    }
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setNewUser({ username: '', fullname: '', email: '', password: '', role: 'user' }); // Reset form fields
  };

  // Filter out admin users
  const filteredUsers = users
    .filter((user) => user.role !== 'admin')
    .filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDownloadReport = () => {
    const csvData = [
      ['Username', 'Full Name', 'Email', 'Created At'],
      ...users.map((user) => [
        user.username,
        user.fullname,
        user.email,
        
        new Date(user.createdAt).toLocaleString(), // Format date
      ]), 
    ];

    const csvContent = csvData
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_report.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all"
          >
            <FaSignOutAlt className="text-2xl" /> {/* Logout Icon */}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-600 bg-gray-700 rounded mt-2 text-white"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Button to open Add User Modal */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
          >
            Add New User
          </button>
        </div>

        {/* Button to download report */}
        <div className="mb-6">
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
          >
            Download Report (CSV)
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="min-w-full table-auto text-left text-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Username</th>
                  <th className="py-2 px-4 border-b">Full Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Created At</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="py-2 px-4 border-b">{user.username}</td>
                    <td className="py-2 px-4 border-b">{user.fullname}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-all mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className="mx-1 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Deleting User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md w-1/3">
            <h3 className="text-xl font-semibold text-white mb-4">Are you sure you want to delete this user?</h3>
            <div className="flex justify-between">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md w-1/3">
            <h3 className="text-xl font-semibold text-white mb-4">Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-white">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullname}
                  onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
          
              <div className="flex justify-between">
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing User */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md w-1/3">
            <h3 className="text-xl font-semibold text-white mb-4">Edit User</h3>
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-white">Username</label>
                <input
                  type="text"
                  value={userToEdit.username}
                  onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Full Name</label>
                <input
                  type="text"
                  value={userToEdit.fullname}
                  onChange={(e) => setUserToEdit({ ...userToEdit, fullname: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white">Email</label>
                <input
                  type="email"
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  className="w-full p-2 border bg-gray-700 rounded mt-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={closeEditUserModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDash;
