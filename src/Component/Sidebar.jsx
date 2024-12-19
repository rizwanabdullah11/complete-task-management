// import React, { useEffect, useState } from 'react';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from './Firebase';
// import { Link } from 'react-router-dom';
// import { FiMessageSquare, FiActivity, FiPlus } from 'react-icons/fi';

// const Sidebar = ({ setIsModalOpen }) => {
//   const [stats, setStats] = useState({
//     total: 0,
//     completed: 0,
//     pending: 0
//   });
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchStats = async () => {
//       const tasksRef = collection(db, 'tasks');
//       const tasksSnapshot = await getDocs(tasksRef);
//       const completedSnapshot = await getDocs(query(tasksRef, where('status', '==', 'Completed')));
      
//       setStats({
//         total: tasksSnapshot.size,
//         completed: completedSnapshot.size,
//         pending: tasksSnapshot.size - completedSnapshot.size
//       });
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div className="lg:w-1/5 lg:h-screen sm:h-40 bg-gray-200">
//       <div className="h-40 lg:h-full bg-opacity-90 backdrop-blur-xl shadow-lg p-6 border border-gray-200">
//         <div className="flex lg:flex-col items-center lg:items-start justify-between gap-4">
//           <button 
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="text-5xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 font-poppins"
//           >
//             Task Manager
//           </button>
          
//           {/* Stats Section */}
//           <div className="hidden lg:flex flex-col gap-4 my-8">
//             <div className="bg-white p-4 rounded-lg shadow">
//               <p className="text-gray-600">Total Tasks</p>
//               <p className="text-2xl font-bold">{stats.total}</p>
//             </div>
//             <div className="bg-green-100 p-4 rounded-lg shadow">
//               <p className="text-gray-600">Completed</p>
//               <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
//             </div>
//             <div className="bg-yellow-100 p-4 rounded-lg shadow">
//               <p className="text-gray-600">Pending</p>
//               <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//             </div>
//           </div>

//           <div className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-row lg:flex-col items-center gap-3 sm:gap-4 fixed lg:static bottom-0 bg-gray-200 p-4 lg:p-0 lg:bg-transparent`}>
//             <Link to="/comments" className="p-2 sm:p-3 bg-white shadow-lg hover:shadow-xl rounded-xl transition-all border border-green-200 hover:border-green-400">
//               <FiMessageSquare size={20} className="text-green-500 sm:w-6 sm:h-6" />
//             </Link>

//             <Link to="/activities" className="p-2 sm:p-3 bg-white shadow-lg hover:shadow-xl rounded-xl transition-all border border-green-200 hover:border-green-400">
//               <FiActivity size={20} className="text-green-500 sm:w-6 sm:h-6" />
//             </Link>

//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="bg-green-500 hover:bg-green-600 text-white p-2 sm:p-3 rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
//             >
//               <FiPlus size={20} className="sm:w-6 sm:h-6" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './Firebase';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiActivity, FiPlus } from 'react-icons/fi';

const Sidebar = ({ setIsModalOpen }) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      const completedSnapshot = await getDocs(query(tasksRef, where('status', '==', 'Completed')));
      
      setStats({
        total: tasksSnapshot.size,
        completed: completedSnapshot.size,
        pending: tasksSnapshot.size - completedSnapshot.size
      });
    };

    fetchStats();
  }, []);

  return (
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
  );
};

export default Sidebar;
