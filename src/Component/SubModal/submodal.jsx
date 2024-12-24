import React, { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const SubModal = ({ isOpen, onClose, onSubmit, editSubTask }) => {
  const [subTaskData, setSubTaskData] = useState({
    subTitle: '',
    subDescription: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editSubTask) {
      setSubTaskData({
        subTitle: editSubTask.subTitle,
        subDescription: editSubTask.subDescription
      })
    } else {
      setSubTaskData({
        subTitle: '',
        subDescription: ''
      })
    }
  }, [editSubTask])

  const validateForm = () => {
    const newErrors = {}
    if (!subTaskData.subTitle.trim()) newErrors.subTitle = 'Sub-Title is required'
    if (!subTaskData.subDescription.trim()) newErrors.subDescription = 'Sub-Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(subTaskData)
      setSubTaskData({
        subTitle: '',
        subDescription: ''
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl p-4 border border-gray-200 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            {editSubTask ? 'Edit Sub Task' : 'Create Sub Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Sub Task Title"
              value={subTaskData.subTitle}
              className={`w-full px-3 text-md py-2 bg-gray-50 rounded-md border ${
                errors.subTitle ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 
                'border-gray-200 focus:border-green-500 focus:ring-green-200'
              } text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              onChange={(e) => setSubTaskData({...subTaskData, subTitle: e.target.value})}
            />
            {errors.subTitle && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.subTitle}</p>
            )}
          </div>
          
          <div>
            <textarea
              placeholder="Sub Task Description"
              value={subTaskData.subDescription}
              className={`w-full px-2 py-1 text-sm bg-gray-50 rounded-md border ${
                errors.subDescription ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 
                'border-gray-200 focus:border-green-500 focus:ring-green-200'
              } text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              onChange={(e) => setSubTaskData({...subTaskData, subDescription: e.target.value})}
              rows={4}
            />
            {errors.subDescription && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.subDescription}</p>
            )}
          </div>
  
          <div className="flex pt-1">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-md font-semibold py-1.5 px-2 rounded-md transform hover:scale-105 transition-all"
            >
              {editSubTask ? 'Update Sub Task' : 'Create Sub Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-md font-semibold py-1.5 px-2 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )  
}

export default SubModal