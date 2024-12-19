// import React, { useEffect, useState } from 'react';
// import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import { db } from './Firebase';
// import { useDrop } from 'react-dnd';

// const TaskColumn = ({ title, tasks, status, onDrop }) => {
//   const [{ isOver }, drop] = useDrop({
//     accept: 'TASK',
//     drop: (item) => onDrop(item.id, status),
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//     }),
//   });

//   return (
//     <div 
//       ref={drop} 
//       className={`bg-white bg-opacity-90 backdrop-blur-xl shadow-lg border border-gray-200 text-center ${
//         isOver ? 'bg-green-50' : ''
//       }`}
//     >
//       <h2 className="text-2xl h-16 font-bold bg-green-500 text-white pt-4">
//         {title}
//       </h2>
//       <div className="space-y-4">
//         {tasks.map((task) => (
//           <TaskCard key={task.id} task={task} />
//         ))}
//       </div>
//     </div>
//   );
// };

// const TaskCard = ({ task }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   return (
//     <div className="shadow-md hover:shadow-xl transition-all bg-gray-200 ml-4 mt-2 mb-4 mr-4">
//       <div className="p-5">
//         <div className="flex justify-between items-center">
//           <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700"
//           >
//             {isExpanded ? 'See Less' : 'See More'}
//           </button>
//         </div>
//         {isExpanded && (
//           <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
//             <p className="text-gray-600">{task.description}</p>
//             <div className="flex items-center gap-2">
//               <span className={`px-2 py-1 rounded-full text-xs ${
//                 task.priority === 'High' ? 'bg-red-100 text-red-600' :
//                 task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
//                 'bg-green-100 text-green-600'
//               }`}>
//                 {task.priority}
//               </span>
//               <span className="text-gray-500">Due: {new Date(task.endDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       const tasksRef = collection(db, 'tasks');
//       const tasksSnapshot = await getDocs(tasksRef);
//       const tasksList = tasksSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setTasks(tasksList);
//     };

//     fetchTasks();
//   }, []);

//   const handleDrop = async (taskId, newStatus) => {
//     // Update task status in Firebase
//   };

//   return (
//     <div className="lg:w-4/5 lg:h-full sm:h-full">
//       <div className="grid grid-cols-1 lg:grid-cols-6">
//         <TaskColumn
//           title="Pending Tasks"
//           tasks={tasks.filter(task => task.status === 'pending')}
//           status="pending"
//           onDrop={handleDrop}
//         />
//         <TaskColumn
//           title="In Review"
//           tasks={tasks.filter(task => task.status === 'review')}
//           status="review"
//           onDrop={handleDrop}
//         />
//         <TaskColumn
//           title="Follow Up"
//           tasks={tasks.filter(task => task.status === 'followup')}
//           status="followup"
//           onDrop={handleDrop}
//         />
//         <TaskColumn
//           title="Backlog"
//           tasks={tasks.filter(task => task.status === 'backlog')}
//           status="backlog"
//           onDrop={handleDrop}
//         />
//         <TaskColumn
//           title="In Progress"
//           tasks={tasks.filter(task => task.status === 'in-progress')}
//           status="in-progress"
//           onDrop={handleDrop}
//         />
//         <TaskColumn
//           title="Completed"
//           tasks={tasks.filter(task => task.status === 'completed')}
//           status="completed"
//           onDrop={handleDrop}
//         />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from './Firebase';
import { useDrag, useDrop } from 'react-dnd';

const DraggableTaskCard = ({ task, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      ref={drag} 
      className={`shadow-md hover:shadow-xl transition-all bg-gray-200 ml-4 mt-2 mb-4 mr-4 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700"
          >
            {isExpanded ? 'See Less' : 'See More'}
          </button>
        </div>
        {isExpanded && (
          <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">{task.description}</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.priority === 'High' ? 'bg-red-100 text-red-600' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {task.priority}
              </span>
              <span className="text-gray-500">Due: {new Date(task.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskColumn = ({ title, tasks, status }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: async (item) => {
      if (item.status !== status) {
        const taskRef = doc(db, "tasks", item.id);
        await updateDoc(taskRef, { 
          status: status,
          updatedAt: new Date().toISOString()
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop} 
      className={`bg-white bg-opacity-90 backdrop-blur-xl shadow-lg border border-gray-200 text-center ${
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
  );
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      const tasksList = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksList);
    };

    fetchTasks();
  }, []);

  return (
    <div className="lg:w-4/5 lg:h-full sm:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-6">
        <TaskColumn
          title="Pending Tasks"
          tasks={tasks.filter(task => task.status === 'pending')}
          status="pending"
        />
        <TaskColumn
          title="In Review"
          tasks={tasks.filter(task => task.status === 'review')}
          status="review"
        />
        <TaskColumn
          title="Follow Up"
          tasks={tasks.filter(task => task.status === 'followup')}
          status="followup"
        />
        <TaskColumn
          title="Backlog"
          tasks={tasks.filter(task => task.status === 'backlog')}
          status="backlog"
        />
        <TaskColumn
          title="In Progress"
          tasks={tasks.filter(task => task.status === 'in-progress')}
          status="in-progress"
        />
        <TaskColumn
          title="Completed"
          tasks={tasks.filter(task => task.status === 'completed')}
          status="completed"
        />
      </div>
    </div>
  );
};

export default Dashboard;
