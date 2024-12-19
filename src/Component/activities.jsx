import React, { useState, useEffect } from 'react'
import { collection, query, getDocs } from "firebase/firestore"
import { db } from './Firebase'

const Activities = () => {
  const [allActivities, setAllActivities] = useState([])

  useEffect(() => {
    fetchAllActivities()
  }, [])

  const fetchAllActivities = async () => {
    try {
      const tasksQuery = query(collection(db, "tasks"))
      const task = await getDocs(tasksQuery)
      
      let activities = []
      task.docs.forEach(doc => {
        const taskData = doc.data()
        if (taskData.activities) {
          activities = [...activities, ...taskData.activities.map(activity => ({
            ...activity
          }))]
        }
      })
      
      setAllActivities(activities)
    } catch (error) {
      console.log("Error fetching activities:", error)
    }
  }
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-4xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 font-poppins mb-8">
            All Activities
          </h1>
          <div className="space-y-6">  
          {allActivities.map((activity, index) => (
            <div key={index} className="bg-white bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-700 mb-2">{activity.title}</h4>
              <p className="text-gray-700">{activity.description}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                activity.type === 'update' ? 'bg-blue-500' :
                activity.type === 'milestone' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}>
                {activity.type}
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )  
}

export default Activities