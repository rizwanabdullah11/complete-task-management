import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { FaRegCircle } from 'react-icons/fa';
import { MdArrowForwardIos } from "react-icons/md";
import { BsPerson } from 'react-icons/bs';
import CreateUserModal from './userModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "users"));
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const usersRef = collection(db, "users");
      const newUserData = {
        ...userData,
        createdBy: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        status: 'active',
        user_type : "workers"
      };

      await addDoc(usersRef, newUserData);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-medium"
        >
          Create User
        </button>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Username</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Full Name</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Email</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Password</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Contact</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-2">
                  <div className="flex items-center truncate">
                    <MdArrowForwardIos className="text-gray-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                    <FaRegCircle className="text-green-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate text-xs font-semibold">{user.username}</span>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2 truncate">
                    <BsPerson className="text-gray-500 flex-shrink-0" />
                    <span className="truncate text-xs">{user.fullName}</span>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {user.email}
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {user.password}
                  </div>
                </td>

                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {user.contactNumber}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default Users;
