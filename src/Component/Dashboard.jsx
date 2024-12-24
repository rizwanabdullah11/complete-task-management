import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Comments from './comments';
import Activities from './activities';
import Home from './Home';
import Userprofile from './User';
import NewTask from './Modal/newTask';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 overflow-hidden">
        <div className="h-full overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-task" element={<NewTask />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/users" element={<Userprofile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;