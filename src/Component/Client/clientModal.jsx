import React, { useState } from 'react';
import { FaRegCircle } from 'react-icons/fa';

const ClientModal = ({ isOpen, onClose, onSubmit }) => {
  const [newClient, setNewClient] = useState({
    clientName: '',
    companyName: '',
    email: '',
    contactNumber: '',
    address: '',
    projectType: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newClient);
    setNewClient({
      clientName: '',
      companyName: '',
      email: '',
      contactNumber: '',
      address: '',
      projectType: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border-2 border-gray-200 w-full max-w-xl">
        <div className="p-3 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            Create New Client
          </h2>
        </div>

        <div className="p-3 space-y-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Client Name"
                value={newClient.clientName}
                onChange={(e) => setNewClient({...newClient, clientName: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Company Name"
                value={newClient.companyName}
                onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
                required
              />

              <input
                type="tel"
                placeholder="Contact Number"
                value={newClient.contactNumber}
                onChange={(e) => setNewClient({...newClient, contactNumber: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
              />

              <select
                value={newClient.projectType}
                onChange={(e) => setNewClient({...newClient, projectType: e.target.value})}
                className="w-full text-sm p-2 border-2 border-gray-200 rounded-md font-semibold text-gray-900 focus:outline-none"
              >
                <option value="">Select Project Type</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="desktop">Desktop Application</option>
                <option value="other">Other</option>
              </select>
            </div>

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
                Create Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
