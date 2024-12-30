import React, { useState } from 'react';

const AssigneeModal = ({ isOpen, onClose, onSubmit }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    contactNumber: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newUser);
    setNewUser({
      username: '',
      fullName: '',
      email: '',
      contactNumber: '',
      password: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border-2 border-gray-200 w-full max-w-xl">
        <div className="p-3 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            Create New Assignee
          </h2>
        </div>

        <div className="p-3 space-y-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full text-sm p-2 border-2 border-gray-200 rounded-md"
              required
            />
            
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.fullName}
              onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
              className="w-full text-sm p-2 border-2 border-gray-200 rounded-md"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full text-sm p-2 border-2 border-gray-200 rounded-md"
              required
            />

            <input
              type="tel"
              placeholder="Contact Number"
              value={newUser.contactNumber}
              onChange={(e) => setNewUser({...newUser, contactNumber: e.target.value})}
              className="w-full text-sm p-2 border-2 border-gray-200 rounded-md"
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full text-sm p-2 border-2 border-gray-200 rounded-md"
              required
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-500 border-2 border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-100 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-200 font-medium"
              >
                Create Assignee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssigneeModal;
