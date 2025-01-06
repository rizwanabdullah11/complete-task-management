import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { FaRegCircle } from 'react-icons/fa';
import { MdArrowForwardIos } from "react-icons/md";
import { BsPerson } from 'react-icons/bs';
import CreateUserModal from './assigneeModal';

const Assignees = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "users"));
      const userList = userSnapshot.docs
        .filter(doc => doc.data().userType === "worker")
        .map(doc => ({
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
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        contactNumber: userData.contactNumber,
        password: userData.password,
        status: 'active',
        userType: "worker",
        createdAt: new Date().toISOString()
      };
   
      if (auth.currentUser) {
        newUserData.userId = auth.currentUser.uid;
      }
      
      const docRef = await addDoc(usersRef, newUserData);
      console.log('Document written with ID: ', docRef.id);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="pl-8 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
      <h2 className="text-xl sm:text-md md:text-xl ml-2 font-bold text-gray-800 tracking-tight">
        Assignee Management
      </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-600 rounded-sm hover:bg-green-200 font-medium text-sm sm:text-base"
        >
          Create Assignee
        </button>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto touch-action-pan-x">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 font-medium">Username</th>
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 font-medium">Full Name</th>
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 font-medium">Email</th>
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 font-medium">Password</th>
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 font-medium">Contact</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MdArrowForwardIos className="text-gray-500 w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <FaRegCircle className="text-green-500 w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold truncate">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <BsPerson className="text-gray-500 w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</span>
                  </td>
                  <td className="p-2 sm:p-3">
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{user.password}</span>
                  </td>
                  <td className="p-2 sm:p-3">
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{user.contactNumber}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default Assignees;