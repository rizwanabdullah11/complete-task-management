import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'

const CommentModal = ({ isOpen, onClose, onSubmit }) => {
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      onSubmit({
        id: Date.now(),
        text: comment,
      })
      setComment('')
      onClose()
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            Add Comment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            rows={4}
          />
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all"
            >
              Add Comment
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

export default CommentModal