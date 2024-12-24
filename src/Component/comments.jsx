import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import { BsChatSquareQuote, BsPerson } from 'react-icons/bs';
import { CiCalendar } from "react-icons/ci";

const Comments = () => {
  const [allComments, setAllComments] = useState([]);

  useEffect(() => {
    fetchAllComments();
  }, []);

  const fetchAllComments = async () => {
    try {
      const tasksQuery = query(collection(db, "tasks"));
      const task = await getDocs(tasksQuery);
      
      let comments = [];
      task.docs.forEach(doc => {
        const taskData = doc.data();
        if (taskData.comments) {
          comments = [...comments, ...taskData.comments.map(comment => ({
            ...comment,
            taskTitle: taskData.title,
            assigned: taskData.assigned
          }))];
        }
      });
      setAllComments(comments);
    } catch (error) {
      console.log("Error fetching comments:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-3">
        <div className="flex items-center justify-center mb-4">
          <BsChatSquareQuote className="text-green-500 text-2xl mr-4" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Project Comments
          </h1>
        </div>

        <div className="grid gap-3">
          {allComments.map((comment, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <BsPerson className="w-3.5 h-3.5" />
                      {comment.assigned || 'Unassigned'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <CiCalendar className="w-3.5 h-3.5" />
                      {new Date(comment.createdAt || comment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{comment.text}</p>
                  <div className="text-sm text-gray-500">
                    Task: {comment.taskTitle}
                  </div>
                  {comment.reply && (
                    <div className="ml-6 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                          <BsPerson className="w-3.5 h-3.5" />
                          {comment.reply.assigned || 'Unassigned'}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <CiCalendar className="w-3.5 h-3.5" />
                          {new Date(comment.reply.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600">{comment.reply.text}</p>
                    </div>
                  )}
                </div>
                <button className="text-sm text-green-500 hover:text-green-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comments;
