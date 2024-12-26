import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiActivity, FiPlus, FiUsers } from 'react-icons/fi';
import { CiHome } from "react-icons/ci";
import { FaUsersLine } from "react-icons/fa6";

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="lg:w-20 hover:lg:w-1/5 h-full bg-white duration-300 overflow-y-auto group shadow-xl">
      <div className="p-4">
        <div className="flex flex-col gap-3">
          {[
            { path: '/dashboard', icon: CiHome, label: 'Home' },
            { path: '/dashboard/new-task', icon: FiPlus, label: 'New Task' },
            { path: '/dashboard/comments', icon: FiMessageSquare, label: 'Comments' },
            { path: '/dashboard/activities', icon: FiActivity, label: 'Activities' },
            { path: '/dashboard/users', icon: FiUsers, label: 'Users' },
            { path: '/dashboard/clients', icon: FaUsersLine, label: 'Clients' }

          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-xl
                ${location.pathname === item.path 
                  ? 'bg-green-200 bg-opacity-20 borer-2 border-green-300 transform scale-105' 
                  : 'hover:bg-gray-200 hover:bg-opacity-10'}`}
            >
              <item.icon 
                size={20} 
                className={`min-w-[20px] text-bold ${location.pathname === item.path 
                  ? 'text-green-500' 
                  : 'text-green-500'}`}
              />
              <span className={`hidden group-hover:block font-medium tracking-wide
                ${location.pathname === item.path 
                  ? 'text-green-500' 
                  : 'text-green-500'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
