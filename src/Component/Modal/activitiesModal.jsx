import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'

const ActivityModal = ({ isOpen, onClose, onSubmit }) => {
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    type: 'update'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activity.title.trim() && activity.description.trim()) {
      onSubmit({
        ...activity,
        id: Date.now(),
      })
      setActivity({ title: '', description: '', type: 'update' })
      onClose()
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            Add Activity
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Activity Title"
            value={activity.title}
            onChange={(e) => setActivity({...activity, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          
          <textarea
            placeholder="Activity Description"
            value={activity.description}
            onChange={(e) => setActivity({...activity, description: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            rows={4}
          />
          
          <select
            value={activity.type}
            onChange={(e) => setActivity({...activity, type: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="update">Update</option>
            <option value="milestone">Milestone</option>
            <option value="blocker">Blocker</option>
          </select>
  
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
            >
              Add Activity
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )  
}

export default ActivityModal