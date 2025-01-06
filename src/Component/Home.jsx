import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import SubModal from './SubModal/submodal'
import CommentModal from './Modal/commentModal'
import ActivityModal from './Modal/activitiesModal'
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { isMobile } from 'react-device-detect'
import { useDrag, useDrop } from 'react-dnd'
import { BsGrid3X3Gap, BsList } from 'react-icons/bs'
import { collection, query, addDoc, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db, auth } from './Firebase'
import { BsPerson } from 'react-icons/bs'
import { CiCalendar } from "react-icons/ci"
import { FaRegCircle } from "react-icons/fa"
import { FiMessageSquare } from "react-icons/fi";
import { LiaFileSolid } from "react-icons/lia"
import { MdArrowForwardIos } from "react-icons/md";
import TaskModal from './taskModal'
import { useSelector } from 'react-redux'

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const userType = useSelector(state => state.auth.userType);
  const [editingTask, setEditingTask] = useState(null)
  const [viewType, setViewType] = useState('board')
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null);
  const [allComments, setAllComments] = useState([]);

  const DraggableTaskCard = ({ task, index }) => {
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
          className={`bg-gray-100 bg-opacity-90 backdrop-blur-xl shadow-lg mb-8 border border-gray-200 text-center ${
          isOver ? 'bg-green-50' : ''
        }`}
      >
        <div className="flex justify-between h-12 ml-4 mr-4text-green-500">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-green-300 bg-opacity-20 text-xs px-1.5 p-1 rounded-lg border-2 border-green-200">
              {tasks.length}
            </span>
            {title}
          </h2>
        </div>
        <div className="space-y-2">
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
  const clientData = useSelector(state => state.auth.currentUser);
  const assigneeData = useSelector(state => state.auth.currentUser);

  useEffect(() => {
    const fetchTasks = async () => {
      console.log("Logged in user data:", clientData);
      if (!clientData?.id) return;
      try {
        let tasksQuery;
        if (clientData?.userType === "client") {
          tasksQuery = query(
            collection(db, "tasks"),
            where("client", "==", clientData.id)
          );
        } else if (assigneeData?.userType === "worker") {

          tasksQuery = query(
            collection(db, "tasks"),
            where("assignee", "==", assigneeData.id)
          );

        } else {
          console.log("Unknown user type:");
          return;
        }

        const querySnapshot = await getDocs(tasksQuery);

        const tasksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Tasks:", tasksList);
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [clientData, assigneeData]);
  
  const handleCreateSubTask = async (subtaskData) => {
    try {
      const newSubTask = {
        ...subtaskData,
        taskId: selectedTask.id,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
      const docRef = await addDoc(collection(db, "subtasks"), newSubTask)
      setTasks(tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            subtasks: [...(task.subtasks || []), { ...newSubTask, id: docRef.id }]
          }
        }
        return task
      }))
    } catch (error) {
      console.log("Error creating subtask:", error)
    }
  }
  const handleCreateComment = async (commentData) => {
    try {
      const newComment = {
        ...commentData,
        taskId: selectedTask.id,
        userId: auth.currentUser.uid,
        assigned: selectedTask.assigned,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString()
      }
  
      const docRef = await addDoc(collection(db, "comments"), newComment)
      setTasks(tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            comments: [...(task.comments || []), { ...newComment, id: docRef.id }]
          }
        }
        return task
      }))
      const commentsQuery = query(collection(db, "comments"));
      const commentsSnapshot = await getDocs(commentsQuery);
      const updatedComments = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      setAllComments(updatedComments);
  
    } catch (error) {
      console.log("Error creating comment:", error)
    }
  }
  const handleCreateActivity = async (activityData) => {
    try {
      const newActivity = {
        ...activityData,
        taskId: selectedTask.id,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      }
      const docRef = await addDoc(collection(db, "activities"), newActivity)
      setTasks(tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            activities: [...(task.activities || []), { ...newActivity, id: docRef.id }]
          }
        }
        return task
      }))
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
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      console.log(`Task ${taskId} status updated to: ${newStatus}`);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.log("Error updating task status:", error);
    }
  };
 const ListView = () => {
  const sections = [
    { title: 'Pending', status: 'pending', bgColor: 'bg-green-200 border-green-300', textColor: 'text-green-600' },
    { title: 'In Review', status: 'in-review', bgColor: 'bg-green-200  border-green-300', textColor: 'text-green-600' },
    { title: 'Follow Up', status: 'follow-up', bgColor: 'bg-green-200  border-green-300', textColor: 'text-green-600' },
    { title: 'Backlog', status: 'backlog', bgColor: 'bg-green-200  border-green-300', textColor: 'text-green-600' },
    { title: 'In Progress', status: 'in-progress', bgColor: 'bg-green-200  border-green-300', textColor: 'text-green-600' },
    { title: 'Completed', status: 'completed', bgColor: 'bg-green-200  border-green-300', textColor: 'text-green-600' }
  ];

  return (
    <div className="px-1 py-3">
      {sections.map(section => {
        const sectionTasks = tasks.filter(task => task.status === section.status);
        
        return (
          <div key={section.status} className="mb-2">
            <div className="flex items-center gap-2 mb-2 bg-green-200 w-32 border border-green-500 rounded-sm">
              <div className={`px-2 py-1 border-r border-green-500 ${section.bgColor} ${section.textColor} text-sm font-medium`}>
                {sectionTasks.length}
              </div>
              <h2 className="text-md font-medium text-green-600">{section.title}</h2>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg">
            <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Task</th>
                    <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Assigned To</th>
                    <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Description</th>
                    <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionTasks.map(task => (
                    <tr 
                      key={task.id} 
                      className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="p-2">
                        <div className="flex items-center truncate">
                          <MdArrowForwardIos className="text-gray-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                          <FaRegCircle className="text-green-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate text-xs font-semibold">{task.title}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 truncate">
                          <BsPerson className="text-gray-500 flex-shrink-0" />
                          <span className="truncate text-xs">{task.assigned || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-gray-600 truncate text-xs">
                          {task.description}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 truncate">
                          <CiCalendar className="text-gray-500 flex-shrink-0" />
                          <span className="truncate text-xs">
                            {new Date(task.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TaskCard = ({ task }) => {
  return (
    <div
      onClick={() => setSelectedTask(task)}
      className="transform transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-action-manipulation"
    >
      <div className="bg-white w-[280px] sm:w-80 mx-1.5 sm:mx-2 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md">
        <div className="p-2 sm:p-3">
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-md text-left text-gray-800 flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 font-medium">
              <FaRegCircle className="text-green-500 w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{task.title}</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-4 sm:ml-5">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-400 border border-green-500 text-[10px] sm:text-xs rounded-md flex items-center gap-1 whitespace-nowrap">
                <CiCalendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {new Date(task.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>

              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 border border-2 text-gray-500 text-[10px] sm:text-xs rounded-md flex items-center gap-1 whitespace-nowrap">
                <BsPerson className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="truncate max-w-[80px] sm:max-w-[100px]">
                  {task.assigned || 'Unassigned'}
                </span>
              </span>

              {task.subTasks?.length > 0 && (
                <div className="flex items-center border gap-1 px-1.5 py-0.5 sm:p-1 border-2 text-gray-500 rounded-md">
                  <span className="text-[10px] sm:text-xs">3/3</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                {task.comments?.length > 0 && (
                  <div className="flex items-center text-gray-500">
                    <LiaFileSolid className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                )}

                {task.hasChat && (
                  <div className="flex items-center gap-0.5 text-blue-500">
                    <FiMessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="text-[10px] sm:text-xs">Chat</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
  <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
    <div className="min-h-screen pl-7">
      <div className="flex border-b mb-2 sm:mb-4">
        <button
          onClick={() => setViewType('board')}
          className={`px-2 sm:px-4 py-1 sm:py-1.5 flex items-center transition-all text-xs sm:text-base ${
            viewType === 'board'
              ? 'bg-green-100 font-semibold text-green-500 border-b-2 border-green-500'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-200 border-b-2 border-transparent'
          }`}
        >
          <BsGrid3X3Gap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Board
        </button>
        <button
          onClick={() => setViewType('list')}
          className={`px-2 sm:px-4 py-1 sm:py-1.5 ml-2 sm:ml-4 flex items-center transition-all text-xs sm:text-base ${
            viewType === 'list'
              ? 'bg-green-100 font-semibold text-green-500 border-b-2 border-green-500'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-200 border-b-2 border-transparent'
          }`}
        >
          <BsList className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          List
        </button>
      </div>

      {viewType === 'board' ? (
        <div className="w-full overflow-x-auto scrollbar-hide touch-action-pan-y">
          <div className="flex flex-nowrap gap-2 sm:gap-4 pb-4">
            <div className="inline-flex min-w-max gap-2 sm:gap-4 lg:grid lg:grid-cols-6">
              {[
                { title: "Pending Tasks", status: "pending" },
                { title: "In Review", status: "in-review" },
                { title: "Follow Up", status: "follow-up" },
                { title: "Backlog", status: "backlog" },
                { title: "In Progress", status: "in-progress" },
                { title: "Completed", status: "completed" }
              ].map(column => (
                <TaskColumn
                  key={column.status}
                  title={column.title}
                  tasks={tasks.filter(task => task.status === column.status)}
                  status={column.status}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ListView />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          handleCreateSubTask={handleCreateSubTask}
          handleCreateComment={handleCreateComment}
          handleCreateActivity={handleCreateActivity}
          setEditingTask={setEditingTask}
        />
      )}

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
  );
}
export default Home