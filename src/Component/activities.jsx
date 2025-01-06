import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import { BsLightning } from 'react-icons/bs';
import { CiCalendar } from "react-icons/ci";
import { BsPerson } from 'react-icons/bs';

const Activities = () => {
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      const tasksQuery = query(collection(db, "tasks"));
      const taskSnapshot = await getDocs(tasksQuery);
      
      let activities = [];
      taskSnapshot.docs.forEach(doc => {
        const taskData = doc.data();
        if (taskData.activities) {
          activities = [...activities, ...taskData.activities.map(activity => ({
            ...activity,
            taskTitle: taskData.title,
            taskId: doc.id,
            performerName: activity.performerName || 'Unknown User',
            performerType: activity.performerType || 'Unknown Role'
          }))];
        }
      });

      const sortedActivities = activities.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAllActivities(sortedActivities);
    } catch (error) {
      console.log("Error fetching activities:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center mb-6">
          <BsLightning className="text-green-500 text-xl sm:text-2xl mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Project Activities
          </h1>
        </div>

        <div className="grid gap-4">
          {allActivities.map((activity, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <BsPerson className="text-gray-500 w-4 h-4" />
                  <span className="font-medium text-gray-800">{activity.performerName}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {activity.performerType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <CiCalendar className="w-4 h-4" />
                  {new Date(activity.createdAt).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-800 font-medium">{activity.title}</h3>
                <p className="text-gray-600 text-sm">{activity.description}</p>
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Task: {activity.taskTitle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;