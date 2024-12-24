import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubModal from '../SubModal/submodal';
import CommentModal from './commentModal';
import ActivityModal from './activitiesModal';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { FaRegCircle } from 'react-icons/fa';

const NewTask = () => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    date: '',
    assigned: '',
    status: 'pending',
    subTasks: [],
    comments: [],
    activities: []
  });
  const [errors, setErrors] = useState({});

  const handleSubModalClose = () => {
    setIsSubModalOpen(false);
    setEditingSubTask(null);
  };

  const handleCreateSubTask = (subTaskData) => {
    if (editingSubTask) {
      setTaskData(prev => ({
        ...prev,
        subTasks: prev.subTasks.map(subTask => 
          subTask.id === editingSubTask.id ? { ...subTaskData, id: subTask.id } : subTask
        )
      }));
    } else {
      setTaskData(prev => ({
        ...prev,
        subTasks: [...prev.subTasks, { ...subTaskData, id: Date.now() }]
      }));
    }
  };

  const handleCreateComment = (commentData) => {
    setTaskData(prev => ({
      ...prev,
      comments: [...prev.comments, { 
        ...commentData, 
        id: Date.now(),
        userName: auth.currentUser.displayName || 'Anonymous',
        timestamp: new Date().toISOString()
      }]
    }));
  };

  const handleCreateActivity = (activityData) => {
    setTaskData(prev => ({
      ...prev,
      activities: [...prev.activities, { ...activityData, id: Date.now() }]
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
    if (validateForm()) {
      try {
        const finalTaskData = {
          ...taskData,
          userId: auth.currentUser.uid,
          timestamp: new Date(),
          status: taskData.status || 'pending'
        };
        await addDoc(collection(db, "tasks"), finalTaskData);
        navigate('/dashboard');
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border-2 border-gray-200 transform transition-all hover:scale-[1.01]">
        <div className="p-4 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 tracking-tight">
            Create New Task
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <FaRegCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Task Title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className="w-full text-lg bg-gray-100 p-2 border-gray-100 rounded-md font-medium text-gray-900 border-none focus:outline-none"
              />
            </div>
            <div className="ml-8">
              <textarea
                placeholder="Task Description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                className="w-full text-gray-500 text-sm bg-gray-100 border-gray-100 rounded-md p-1 border-none focus:outline-none resize-none"
                rows="3"
              />
            </div>
            <div className="space-y-2 ml-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-semibold">Status</span>
                <select
                  value={taskData.status}
                  onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                  className="px-2 bg-green-100 text-green-500 rounded-md text-sm border-none focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-semibold">Assignee</span>
                <select
                  value={taskData.assigned}
                  onChange={(e) => setTaskData({...taskData, assigned: e.target.value})}
                  className="px-2 bg-gray-100 text-gray-600 rounded-md text-sm border-none focus:outline-none"
                >
                  <option value="">Select Assignee</option>
                  <option value="Nauman">Nauman</option>
                  <option value="Faraz">Faraz</option>
                  <option value="Fawad">Fawad</option>
                  <option value="Faizan">Faizan</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-semibold">Due Date</span>
                <input
                  type="date"
                  value={taskData.date}
                  onChange={(e) => setTaskData({...taskData, date: e.target.value})}
                  className="px-2 bg-gray-100 text-gray-600 rounded-md text-sm border-none focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
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
            <div className="flex p-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-100 text-green-600 ml-6 rounded-lg hover:bg-green-200 font-medium"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md"
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
        editSubTask={editingSubTask}
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
