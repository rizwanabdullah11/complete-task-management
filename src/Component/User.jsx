import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './Firebase';
import { FaRegCircle } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    contactNumber: ''
  });

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "tasks"), where("type", "==", "user"));
      const userSnapshot = await getDocs(q);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      const tasksRef = collection(db, "tasks");
      const userData = {
        ...newUser,
        type: "user",
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const docRef = await addDoc(tasksRef, userData);
      console.log("User added successfully with ID:", docRef.id);
      console.log("User data:", userData);

      setNewUser({
        username: '',
        fullName: '',
        email: '',
        contactNumber: ''
      });

      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-md border-2 border-gray-200 transform transition-all hover:scale-[1.01]">
        <div className="p-4 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            Create New User
          </h2>
        </div>

        <div className="p-4 space-y-2">
          <form onSubmit={addUser} className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="w-full text-sm bg-gray-100 p-2 border-gray-100 rounded-md font-semibold text-gray-900 border-none focus:outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                className="w-full text-gray-500 text-sm bg-gray-100 border-gray-100 rounded-md font-semibold p-2 border-none focus:outline-none"
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full text-gray-500 text-sm bg-gray-100 border-gray-100 rounded-md p-2 font-semibold border-none focus:outline-none"
                required
              />

              <input
                type="tel"
                placeholder="Contact Number"
                value={newUser.contactNumber}
                onChange={(e) => setNewUser({...newUser, contactNumber: e.target.value})}
                className="w-full text-gray-500 text-sm bg-gray-100 border-gray-100 rounded-md p-2 font-semibold border-none focus:outline-none"
              />
            </div>

            <div className="flex ml-48 mr-48 mt-4">
              <button
                type="submit"
                className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-medium"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact #</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.contactNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
