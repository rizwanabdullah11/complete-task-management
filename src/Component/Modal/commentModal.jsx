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
      <div className="bg-white rounded-xl p-4 border border-gray-200 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            Add Comment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-2 bg-gray-50 text-sm rounded-md border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            rows={4}
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-md hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-xl transform hover:scale-105 transition-all"
            >
              Add Comment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-md hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-3 rounded-xl transition-colors"
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
