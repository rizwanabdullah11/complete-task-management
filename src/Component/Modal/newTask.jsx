import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SubModal from '../SubModal/submodal';
import CommentModal from './commentModal';
import ActivityModal from './activitiesModal';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { FaRegCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const NewTask = () => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    const clientData = useSelector(state => state.auth.currentUser);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const { state } = useLocation();
  const editingTask = state?.editingTask;
  const [taskData, setTaskData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    date: editingTask?.date || '',
    assigned: editingTask?.assigned || '',
    status: editingTask?.status || 'pending',
    client: editingTask?.client || '',
    assignee: editingTask?.assignee || '',
    subTasks: editingTask?.subTasks || [],
    comments: editingTask?.comments || [],
    activities: editingTask?.activities || []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setTaskData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        date: editingTask.date || '',
        assigned: editingTask.assigned || '',
        status: editingTask.status || 'pending',
        client: editingTask.client || '',
        assignee: editingTask.assignee || '',
        subTasks: editingTask.subTasks || [],
        comments: editingTask.comments || [],
        activities: editingTask.activities || []
      });
    }
  }, [editingTask]);
  useEffect(() => {
    const fetchUsersAndClients = async () => {
      try {
        const usersQuery = query(collection(db, "users"), where("userType", "==", "worker"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          ...doc.data()
        }));
        setUsers(usersList);
        const clientsQuery = query(collection(db, "users"), where("userType", "==", "client"));
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          clientName: doc.data().clientName,
          ...doc.data()
        }));
        setClients(clientsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchUsersAndClients();
  }, []);
  

  const handleSubModalClose = () => {
    setIsSubModalOpen(false);
  };

  const handleCreateSubTask = (subTaskData) => {
    setTaskData(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, { ...subTaskData, id: Date.now() }]
    }));
  };
  const handleCreateComment = (commentData) => {
    setTaskData(prev => ({
      ...prev,
      comments: [...prev.comments, {
        ...commentData,
        id: Date.now(),
        userName: auth.currentUser?.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
        date: new Date().toISOString()
      }]
    }));
  };

  const handleCreateActivity = (activityData) => {
    setTaskData(prev => ({
      ...prev,
      activities: [...prev.activities, {
        ...activityData,
        id: Date.now(),
        performedBy: clientData?.id,
        performerType: clientData?.userType,
        performerName: clientData?.username || clientData?.clientName,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString()
      }]
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!taskData.title.trim()) newErrors.title = 'Title is required';
    if (!taskData.description.trim()) newErrors.description = 'Description is required';
    if (!taskData.date) newErrors.date = 'Date is required';
    if (!taskData.assigned) newErrors.assigned = 'Assignment is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const finalTaskData = {
        title: taskData.title,
        description: taskData.description,
        date: taskData.date,
        status: taskData.status,
        client: taskData.client,
        assignee: taskData.assignee,
        subTasks: taskData.subTasks || [],
        comments: taskData.comments || [],
        activities: taskData.activities || [],
        updatedAt: new Date().toISOString()
      };
  
      if (editingTask?.id) {
        const taskRef = doc(db, "tasks", editingTask.id);
        await updateDoc(taskRef, finalTaskData);
        console.log("Task updated successfully");
      } else {
        finalTaskData.createdAt = new Date().toISOString();
        finalTaskData.createBy = clientData?.id;
        await addDoc(collection(db, "tasks"), finalTaskData);
        console.log("New task created successfully");
      }
  
      navigate('/dashboard');
    } catch (error) {
      console.error("Error handling task:", error);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 md:py-16 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border-2 border-gray-200 transform transition-all hover:scale-[1.01]">
        <div className="p-3 sm:p-4 text-center border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>
  
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaRegCircle className="text-green-500 w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Task Title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className="w-full text-base sm:text-lg bg-gray-100 p-2 rounded-md font-medium text-gray-900 focus:outline-none"
              />
            </div>
  
            <div className="ml-6 sm:ml-8">
              <textarea
                placeholder="Task Description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                className="w-full text-sm bg-gray-100 rounded-md p-2 focus:outline-none resize-none"
                rows="3"
              />
            </div>
  
            <div className="ml-6 sm:ml-8">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {/* Status Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm font-semibold w-full sm:w-20">Status</span>
                  <select
                    value={taskData.status}
                    onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                    className="w-full sm:w-48 px-2 py-1.5 bg-green-100 text-green-500 rounded-md text-sm focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
  
                {/* Client Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm font-semibold w-full sm:w-20">Client</span>
                  <select
                    value={taskData.client}
                    onChange={(e) => setTaskData({...taskData, client: e.target.value})}
                    className="w-full sm:w-48 px-2 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.clientName}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Assignee Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm font-semibold w-full sm:w-20">Assignees</span>
                  <select
                    value={taskData.assignee}
                    onChange={(e) => setTaskData({...taskData, assignee: e.target.value})}
                    className="w-full sm:w-48 px-2 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Select Assignee</option>
                    {users.map(assignee => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.username}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Due Date Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm font-semibold w-full sm:w-20">Due Date</span>
                  <input
                    type="date"
                    value={taskData.date}
                    onChange={(e) => setTaskData({...taskData, date: e.target.value})}
                    className="w-full sm:w-48 px-2 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
  
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-b pb-4">
            <button
                type="button"
                onClick={() => setIsSubModalOpen(true)}
                className="flex items-center justify-center space-x-2 p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <span className="font-medium">Subtasks</span>
                <span className="bg-gray-200 px-2 rounded">{taskData.subTasks.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCommentModalOpen(true)}
                className="flex items-center justify-center space-x-2 p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <span className="font-medium">Comments</span>
                <span className="bg-gray-200 px-2 rounded">{taskData.comments.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(true)}
                className="flex items-center justify-center space-x-2 p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <span className="font-medium">Activity</span>
                <span className="bg-gray-200 px-2 rounded">{taskData.activities.length}</span>
              </button>
            </div>
  
            <div className="flex flex-col sm:flex-row gap-2 p-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-200 font-medium text-sm sm:text-base"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold border-2 border-gray-200 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <SubModal
        isOpen={isSubModalOpen}
        onClose={handleSubModalClose}
        onSubmit={handleCreateSubTask}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCreateComment}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleCreateActivity}
      />
    </div>
  );
};

export default NewTask;