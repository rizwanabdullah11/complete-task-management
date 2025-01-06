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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border-2 border-gray-200 w-full max-w-md">
        <div className="p-3 sm:p-4 text-center border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            Create New Assignee
          </h2>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500"
              required
            />
            
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.fullName}
              onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
              className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500"
              required
            />

            <input
              type="tel"
              placeholder="Contact Number"
              value={newUser.contactNumber}
              onChange={(e) => setNewUser({...newUser, contactNumber: e.target.value})}
              className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500"
              required
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md font-medium border-2 border-gray-200 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-200 font-medium text-xs sm:text-sm"
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