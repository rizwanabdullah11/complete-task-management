import React, { useState, useEffect } from 'react'
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi'
import SubModal from '../SubModal/submodal'
import CommentModal from './commentModal'
import ActivityModal from './activitiesModal'
import { auth } from '../Firebase'

const Modal = ({ isOpen, onClose, onSubmit, editTask }) => {
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingSubTask, setEditingSubTask] = useState(null)
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    date: '',
    assigned: '',
    status: 'pending',
    subTasks: [],
    comments: [],
    activities: []
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editTask) {
      console.log("Loading task for editing:", editTask)
      setTaskData(editTask)
    }
  }, [editTask])

  const handleSubModalClose = () => {
    setIsSubModalOpen(false)
    setEditingSubTask(null)
  }

  const handleCreateSubTask = (subTaskData) => {
    console.log("Creating/Updating subtask:", subTaskData)
    if (editingSubTask) {
      setTaskData(prev => ({
        ...prev,
        subTasks: prev.subTasks.map(subTask => 
          subTask.id === editingSubTask.id ? { ...subTaskData, id: subTask.id } : subTask
        )
      }))
    } else {
      setTaskData(prev => ({
        ...prev,
        subTasks: [...prev.subTasks, { ...subTaskData, id: Date.now() }]
      }))
    }
  }

  const handleCreateComment = (commentData) => {
    console.log("Adding comment:", commentData)
    setTaskData(prev => ({
      ...prev,
      comments: [...prev.comments, { ...commentData, id: Date.now() }]
    }))
  }

  const handleCreateActivity = (activityData) => {
    console.log("Adding activity:", activityData)
    setTaskData(prev => ({
      ...prev,
      activities: [...prev.activities, { ...activityData, id: Date.now() }]
    }))
  }

  const handleDeleteSubTask = (subTaskId) => {
    console.log("Deleting subtask:", subTaskId)
    setTaskData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter(subTask => subTask.id !== subTaskId)
    }))
  }

  const handleEditSubTask = (subTask) => {
    console.log("Editing subtask:", subTask)
    setEditingSubTask(subTask)
    setIsSubModalOpen(true)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!taskData.title.trim()) newErrors.title = 'Title is required'
    if (!taskData.description.trim()) newErrors.description = 'Description is required'
    if (!taskData.date) newErrors.date = 'Date is required'
    if (!taskData.assigned) newErrors.assigned = 'Assignment is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      const finalTaskData = {
        title: taskData.title,
        description: taskData.description,
        date: taskData.date,
        assigned: taskData.assigned,
        status: taskData.status,
        subTasks: taskData.subTasks || [],
        comments: taskData.comments || [],
        activities: taskData.activities || [],
        userId: auth.currentUser.uid,
        timestamp: new Date()
      }
      onSubmit(finalTaskData)
      onClose() 
      setTaskData({ 
        title: '',
        description: '',
        date: '',
        assigned: '',
        status: 'pending',
        subTasks: [],
        comments: [],
        activities: []
      })
    }
 }
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="my-8 bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiX size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Task Title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'} text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.title ? 'focus:ring-red-200' : 'focus:ring-green-200'}`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
  
            <div>
              <textarea
                placeholder="Task Description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'} text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.description ? 'focus:ring-red-200' : 'focus:ring-green-200'}`}
                rows={4}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={taskData.date}
                  onChange={(e) => setTaskData({...taskData, date: e.target.value})}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'} text-gray-700 focus:outline-none focus:ring-2 ${errors.date ? 'focus:ring-red-200' : 'focus:ring-green-200'}`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>
  
              <div>
                <select
                  value={taskData.assigned}
                  onChange={(e) => setTaskData({...taskData, assigned: e.target.value})}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${errors.assigned ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'} text-gray-700 focus:outline-none focus:ring-2 ${errors.assigned ? 'focus:ring-red-200' : 'focus:ring-green-200'}`}
                >
                  <option value="">Select Assignee</option>
                  <option value="Nauman">Nauman</option>
                  <option value="Faraz">Faraz</option>
                  <option value="Fawad">Fawad</option>
                  <option value="Faizan">Faizan</option>
                </select>
                {errors.assigned && <p className="text-red-500 text-sm mt-1">{errors.assigned}</p>}
              </div>
            </div>
  
            <select
              value={taskData.status}
              onChange={(e) => setTaskData({...taskData, status: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
  
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsSubModalOpen(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
              >
                Sub-Task
              </button>
              <button
                type="button"
                onClick={() => setIsCommentModalOpen(true)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
              >
                Comments
              </button>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(true)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
              >
                Activities
              </button>
            </div>
            {taskData.subTasks.length > 0 && (
              <div className="space-y-3 bg-gray-100 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700">Sub Tasks</h3>
                {taskData.subTasks.map((subTask) => (
                  <div key={subTask.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{subTask.subTitle}</h4>
                        <p className="text-gray-600 text-sm">{subTask.subDescription}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSubTask(subTask)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubTask(subTask.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {taskData.comments && taskData.comments.length > 0 && (
              <div className="space-y-3 bg-gray-100 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700">Comments</h3>
                {taskData.comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-600">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
            {taskData.activities && taskData.activities.length > 0 && (
              <div className="space-y-3 bg-gray-100 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700">Activities</h3>
                {taskData.activities.map((activity) => (
                  <div key={activity.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-800">{activity.title}</h4>
                    <p className="text-gray-600 text-sm">{activity.description}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                      activity.type === 'update' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'milestone' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
            >
              {editTask ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
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
  )  
}

export default Modal