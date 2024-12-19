import React, { useState, useEffect } from 'react'
import { collection, query, getDocs } from "firebase/firestore"
import { db } from './Firebase'

const Comments = () => {
  const [allComments, setAllComments] = useState([])

  useEffect(() => {
    fetchAllComments()
  }, [])

  const fetchAllComments = async () => {
    try {
      const tasksQuery = query(collection(db, "tasks"))
      const task = await getDocs(tasksQuery)
      
      let comments = []
      task.docs.forEach(doc => {
        const taskData = doc.data()
        if (taskData.comments) {
          comments = [...comments, ...taskData.comments.map(comment => ({
            ...comment
          }))]
        }
      })
      setAllComments(comments)
    } catch (error) {
      console.log("Error fetching comments:", error)
    }
  }
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-transparent text-center bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 font-poppins mb-8">
            All Comments
          </h1>
          <div className="space-y-4">  
            {allComments.map((comment, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
  
}

export default Comments