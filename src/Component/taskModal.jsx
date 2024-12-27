import React, { useState, useEffect } from 'react'
import { FiCheck, FiTrash2 } from 'react-icons/fi'
import { FaEdit, FaRegCircle } from 'react-icons/fa'
import { BsPerson } from 'react-icons/bs'
import { CiCalendar } from "react-icons/ci"
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './Firebase';
import { useNavigate } from 'react-router-dom';

const TaskModal = ({ task, onClose, handleCompleteTask, handleDeleteTask, setEditingTask }) => {
  const [activeTab, setActiveTab] = useState('subtasks');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUsersAndClients = async () => {
      try {
        const usersQuery = query(collection(db, "assignees"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
  
        const clientsQuery = query(collection(db, "clients"));
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchUsersAndClients();
  }, []);
  

// useEffect(() => {
//   const fetchUsersAndClients = async () => {
//     try {
//       const usersQuery = query(collection(db, "tasks"), where("type", "==", "user"));
//       const usersSnapshot = await getDocs(usersQuery);
//       const usersList = usersSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setUsers(usersList);

//       const clientsQuery = query(collection(db, "tasks"), where("type", "==", "client"));
//       const clientsSnapshot = await getDocs(clientsQuery);
//       const clientsList = clientsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setClients(clientsList);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   fetchUsersAndClients();
// }, []);
const selectedClient = clients.find(c => c.id === task.client);
  const selectedUser = users.find(u => u.id === task.user);
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border-2 border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide m-4">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="px-4 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium flex items-center gap-2">
                <span className="text-sm">⚡</span> Focus
              </button>
              <span className="text-gray-800 text-sm flex items-center gap-2">
                <CiCalendar className="w-4 h-4" />
                {new Date(task.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">

            <button
              onClick={() => {
                setEditingTask(task);
                navigate(`/dashboard/new-task`, { state: { editingTask: task } });
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-sm flex items-center gap-1 text-gray-700"
            >
              <FaEdit className="text-md" />
            </button>
            <button
              onClick={() => {
                handleDeleteTask(task.id);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-sm"
            >
            <FiTrash2 className="text-gray-700 text-md" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-700 p-1 hover:bg-gray-100 rounded-sm"
            >
              ✕
            </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FaRegCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
              <h2 className="text-xl font-medium text-gray-900">{task.title}</h2>
            </div>
            <p className="text-gray-500 text-sm ml-8">{task.description}</p>
          </div>

          <div className="space-y-2">
              <div className="flex ml-8">
                <span className="text-gray-600 text-sm font-semibold">Status</span>
                <div className="px-2 ml-8 bg-green-100 text-green-500 rounded-md flex items-center gap-2">
                  <FaRegCircle className="text-green-500 w-3 h-3 flex-shrink-0" />
                  {task.status}
                </div>
              </div>

              <div className="flex ml-8">
              <span className="text-gray-600 text-sm font-semibold">Client</span>
              <div className="px-2 ml-9 bg-gray-100 text-gray-600 rounded-md flex items-center gap-2">
                <BsPerson className="text-gray-500 text-sm" />
                {selectedClient?.clientName || 'Not Assigned'}
              </div>
            </div>

            <div className="flex ml-8">
              <span className="text-gray-600 text-sm font-semibold">Assignee</span>
              <div className="px-2 ml-11 bg-gray-100 text-gray-600 rounded-md flex items-center gap-2">
                <BsPerson className="text-gray-500 text-sm" />
                {selectedUser?.username || 'Not Assigned'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div
              onClick={() => setActiveTab('subtasks')}
              className={`flex items-center justify-center space-x-2 bg-gray-100 cursor-pointer p-2 rounded-lg ${
                activeTab === 'subtasks' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="font-medium">Subtasks</span>
              <span className="bg-gray-200 px-2 rounded">{task.subTasks?.length || 0}</span>
            </div>
            <div
              onClick={() => setActiveTab('comments')}
              className={`flex items-center justify-center space-x-2 bg-gray-100 cursor-pointer p-2 rounded-lg ${
                activeTab === 'comments' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="font-medium">Comments</span>
              <span className="bg-gray-200 px-2 rounded">{task.comments?.length || 0}</span>
            </div>
            <div
              onClick={() => setActiveTab('activity')}
              className={`flex items-center justify-center space-x-2 bg-gray-100 cursor-pointer p-2 rounded-lg ${
                activeTab === 'activity' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="font-medium">Activity</span>
              <span className="bg-gray-200 px-2 rounded">{task.activities?.length || 0}</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
          {activeTab === 'subtasks' && (
                <>
                {task.subTasks?.map(subtask => (
                    <div key={subtask.id} className="bg-gray-100 p-4 rounded-md">
                        <h4 className="text-sm text-gray-700">{subtask.subTitle}</h4>
                    </div>
                ))}
                </>
            )}
            {activeTab === 'comments' && (
              <>
                {task.comments?.slice().reverse().map(comment => (
                  <div key={comment.id} className="bg-gray-100 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{comment.assigned}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'activity' && (
              <>
                {task.activities?.slice().reverse().map(activity => (
                  <div key={activity.id} className="bg-gray-100 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="font-medium text-gray-800">{activity.title}</h5>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                ))}
              </>
            )}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center gap-2"
              >
                <FiCheck className="text-lg" />
                Complete Task
              </button>
              <button
                onClick={() => {
                  navigate(`/dashboard/chat/${task.id}`);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-2"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;