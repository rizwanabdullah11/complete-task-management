import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import { BsLightning } from 'react-icons/bs';
import { CiCalendar } from "react-icons/ci";

const Activities = () => {
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      const tasksQuery = query(collection(db, "tasks"));
      const task = await getDocs(tasksQuery);
      
      let activities = [];
      task.docs.forEach(doc => {
        const taskData = doc.data();
        if (taskData.activities) {
          activities = [...activities, ...taskData.activities.map(activity => ({
            ...activity,
            taskTitle: taskData.title,
            assigned: taskData.assigned
          }))];
        }
      });
      setAllActivities(activities);
    } catch (error) {
      console.log("Error fetching activities:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-3">
        <div className="flex items-center justify-center mb-4">
          <BsLightning className="text-green-500 text-2xl mr-4" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Project Activities
          </h1>
        </div>

        <div className="grid gap-3">
          {allActivities.map((activity, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <CiCalendar className="w-3.5 h-3.5" />
                      {new Date(activity.createdAt || activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.type === 'update' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'milestone' ? 'bg-green-100 text-green-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                  <h3 className="text-gray-800 font-medium mb-2">{activity.title}</h3>
                  <p className="text-gray-600 mb-2">{activity.description}</p>
                  <div className="text-sm text-gray-500">
                    Task: {activity.taskTitle}
                  </div>
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

export default Activities;