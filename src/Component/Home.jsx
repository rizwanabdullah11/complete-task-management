import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { isMobile } from 'react-device-detect'
import { useDrag, useDrop } from 'react-dnd'
import Modal from './Modal/modal'
import SubModal from './SubModal/submodal'
import CommentModal from './Modal/commentModal'
import ActivityModal from './Modal/activitiesModal'
import { collection, query, addDoc, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db, auth } from './Firebase'
import { FiPlus, FiTrash2, FiCheck, FiMessageSquare, FiActivity } from 'react-icons/fi'
import { FaEdit } from 'react-icons/fa'
import { Link } from 'react-router-dom'
 
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const DraggableTaskCard = ({ task, index, moveTask }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'TASK',
      item: { id: task.id, index, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })
  
    return (
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <TaskCard task={task} />
      </div>
    )
  }
  const TaskColumn = ({ title, tasks, status }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'TASK',
      drop: (item) => {
        if (item.status !== status) {
          handleUpdateTaskStatus(item.id, status)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })
  
    return (
      <div 
        ref={drop} 
        className={`bg-white bg-opacity-90 backdrop-blur-xl shadow-lg border border-gray-200 text-center  ${
          isOver ? 'bg-green-50' : ''
        }`}
      >
        <h2 className="text-2xl h-16 font-bold bg-green-500 text-white pt-4">
          {title}
        </h2>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <DraggableTaskCard 
              key={task.id} 
              task={task} 
              index={index}
            />
          ))}
        </div>
      </div>
    )
  }
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
    } catch (error) {
      console.log("Error updating task status:", error)
    }
  }
  
  useEffect(() => {
    const variable = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTasks(user.uid)
      }
    })
    return () => variable()
  }, [])

  const fetchTasks = async (userId) => {
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const tasksList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const taskData = { id: doc.id, ...doc.data() }
        return {
          ...taskData,
        }
      }))
      setTasks(tasksList)
    } catch (error) {
      console.log("Error fetching tasks:", error)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      if (editingTask) {
        const taskRef = doc(db, "tasks", editingTask.id)
        await updateDoc(taskRef, { ...taskData, updatedAt: new Date().toISOString() })
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? { ...task, ...taskData } : task
        ))
      } else {
        const newTask = {
          ...taskData,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
        const docRef = await addDoc(collection(db, "tasks"), newTask)
        setTasks([...tasks, { ...newTask, id: docRef.id }])
      }
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.log("Error handling task:", error)
    }
  }

  const handleCreateSubTask = async (subtaskData) => {
    try {
      const newSubTask = {
        ...subtaskData,
        taskId: selectedTaskId,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
      const docRef = await addDoc(collection(db, "subtasks"), newSubTask)
      setTasks(tasks.map(task => {
        if (task.id === selectedTaskId) {
          return {
            ...task,
            subtasks: [...(task.subtasks || []), { ...newSubTask, id: docRef.id }]
          }
        }
        return task
      }))
      setIsSubModalOpen(false)
    } catch (error) {
      console.log("Error creating subtask:", error)
    }
  }

  const handleCreateComment = async (commentData) => {
    try {
      const newComment = {
        ...commentData,
        taskId: selectedTaskId,
        userId: auth.currentUser.uid,
      }
      const docRef = await addDoc(collection(db, "comments"), newComment)
      setTasks(tasks.map(task => {
        if (task.id === selectedTaskId) {
          return {
            ...task,
            comments: [...(task.comments || []), { ...newComment, id: docRef.id }]
          }
        }
        return task
      }))
      setIsCommentModalOpen(false)
    } catch (error) {
      console.log("Error creating comment:", error)
    }
  }
  const handleCreateActivity = async (activityData) => {
    try {
      const newActivity = {
        ...activityData,
        taskId: selectedTaskId,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      }
      const docRef = await addDoc(collection(db, "activities"), newActivity)
      setTasks(tasks.map(task => {
        if (task.id === selectedTaskId) {
          return {
            ...task,
            activities: [...(task.activities || []), { ...newActivity, id: docRef.id }]
          }
        }
        return task
      }))
      setIsActivityModalOpen(false)
    } catch (error) {
      console.log("Error creating activity:", error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId))
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.log("Error deleting task:", error)
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      ))
    } catch (error) {
      console.log("Error completing task:", error)
    }
  }
  const TaskCard = ({ task }) => {
    const [isExpanded, setIsExpanded] = useState(false);  

    return (
      <div className=" shadow-md hover:shadow-xl transition-all bg-gray-200 ml-4 mt-2 mb-4 mr-4 overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              {isExpanded ? 'See Less' : 'See More'}
            </button>
          </div>
          {isExpanded && (
            <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">{task.description}</p>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-md text-gray-500">Assigned to: {task.assigned || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
              {task.subTasks && task.subTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Subtasks
                  </h4>
                  {task.subTasks.map(subtask => (
                    <div key={subtask.id} className="p-3 bg-gray-100 rounded-lg">
                      <h5 className="font-semibold text-md text-gray-800">{subtask.subTitle}</h5>
                      <p className="text-sm text-gray-600">{subtask.subDescription}</p>
                    </div>
                  ))}
                </div>
              )}
              {task.comments && task.comments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Comments
                  </h4>
                  {task.comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-blue-100 rounded-lg">
                      <p className="text-md text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {task.activities && task.activities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Activities
                  </h4>
                  {task.activities.map(activity => (
                    <div key={activity.id} className="p-3 bg-purple-100 rounded-lg">
                      <h5 className="font-semibold text-gray-800">{activity.title}</h5>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
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
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="p-2 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <FiCheck className="text-green-500 text-2xl border-2 border-green-500 rounded-full" />
                </button>
                <button
                  onClick={() => {
                    setEditingTask(task)
                    setIsModalOpen(true)
                  }}
                  className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <FaEdit className="text-blue-500 text-2xl border-2 border-blue-500 rounded-full" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 hover:bg-red-200 rounded-lg transition-colors"
                >
                  <FiTrash2 className="text-red-500 text-2xl border-2 border-red-500 rounded-full" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
  <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
    <div className="min-h-screen">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/5 lg:h-80 sm:h-40">
              <div className="bg-gray-200 h-40 lg:h-full bg-opacity-90 backdrop-blur-xl shadow-lg p-6 border border-gray-200">
                <div className="flex lg:flex-col items-center lg:items-start justify-between gap-4">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-5xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 font-poppins"
                  >
                    Task Manager
                  </button>
                  
                  <div className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-row lg:flex-col items-center gap-3 sm:gap-4 fixed lg:static bottom-0 bg-gray-200 p-4 lg:p-0 lg:bg-transparent`}>
                    <Link to="/comments" className="p-2 sm:p-3 bg-white shadow-lg hover:shadow-xl rounded-xl transition-all border border-green-200 hover:border-green-400">
                      <FiMessageSquare size={20} className="text-green-500 sm:w-6 sm:h-6" />
                    </Link>

                    <Link to="/activities" className="p-2 sm:p-3 bg-white shadow-lg hover:shadow-xl rounded-xl transition-all border border-green-200 hover:border-green-400">
                      <FiActivity size={20} className="text-green-500 sm:w-6 sm:h-6" />
                    </Link>

                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 sm:p-3 rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <FiPlus size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-4/5 lg:h-full sm:h-full">
              <div className="grid grid-cols-1 lg:grid-cols-6">
              <TaskColumn
                  title="Pending Tasks"
                  tasks={tasks.filter(task => task.status === 'pending')}
                  status="pending"
                  className="border-l-4 border-yellow-500"
                  titleClassName="text-yellow-600"
                />
                <TaskColumn
                  title="In Review"
                  tasks={tasks.filter(task => task.status === 'pending')}
                  status="pending"
                  className="border-l-4 border-yellow-500"
                  titleClassName="text-yellow-600"
                />
                <TaskColumn
                  title="Follow Up"
                  tasks={tasks.filter(task => task.status === 'pending')}
                  status="pending"
                  className="border-l-4 border-yellow-500"
                  titleClassName="text-yellow-600"
                />
                <TaskColumn
                  title="Backlog"
                  tasks={tasks.filter(task => task.status === 'pending')}
                  status="pending"
                  className="border-l-4 border-yellow-500"
                  titleClassName="text-yellow-600"
                />
                <TaskColumn
                  title="In Progress"
                  tasks={tasks.filter(task => task.status === 'in-progress')}
                  status="in-progress"
                  className="border-l-4 border-blue-500"
                  titleClassName="text-blue-600"
                />

                <TaskColumn
                  title="Completed"
                  tasks={tasks.filter(task => task.status === 'completed')}
                  status="completed"
                  className="border-l-4 border-green-500"
                  titleClassName="text-green-600"
                />
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={handleCreateTask}
          editTask={editingTask}
        />
        
        <SubModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          onSubmit={handleCreateSubTask}
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
    </DndProvider>
  ) 
}

export default Home