import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiActivity, FiPlus, FiUsers } from 'react-icons/fi';
import { CiHome } from "react-icons/ci";
import { FaUsersLine } from "react-icons/fa6";
import { RiMenu3Line } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';
import Image from '../assets/Logo.JPG';  

const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: CiHome, label: 'Home' },
    { path: '/dashboard/new-task', icon: FiPlus, label: 'New Task' },
    { path: '/dashboard/activities', icon: FiActivity, label: 'Activities' },
    { path: '/dashboard/users', icon: FiUsers, label: 'Users' },
    { path: '/dashboard/clients', icon: FaUsersLine, label: 'Clients' }
  ];

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <button onClick={handleMobileMenuClick} className="h-full p-2 bg-gray-100">
          {isMobileMenuOpen ? (
            <IoMdClose className="w-6 h-6 text-green-500" />
          ) : (
            <RiMenu3Line className="w-6 h-6 text-green-500" />
          )}
        </button>
      </div>
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out font-poppins ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="h-16 flex items-center justify-center mb-8">
            <div className="w-24 h-16 bg-gray-100 rounded-lg">
              <img src={Image} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  location.pathname === item.path 
                    ? 'bg-green-200 bg-opacity-20 border-2 border-green-300' 
                    : 'hover:bg-gray-100'}`}>
                <item.icon 
                  size={22} 
                  className={location.pathname === item.path ? 'text-green-600' : 'text-green-500'}
                />
                <span className={`font-medium tracking-wide text-[15px] ${
                  location.pathname === item.path ? 'text-green-600' : 'text-green-500'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-20 hover:lg:w-1/5 h-screen bg-white duration-300 overflow-y-auto group">
        <div className="p-4">
          <div className="h-16 flex items-center justify-center mb-8">
            <div className="w-40 mt-4 h-24 bg-gray-100 rounded-lg">
              <img src={Image} alt="Image" className="w-full h-full object-cover rounded-lg" /> 
            </div>
          </div>

          <div className="flex flex-col mt-4 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 font-poppins font-bold p-2 rounded-md transition-all duration-200
                  ${location.pathname === item.path 
                    ? 'bg-green-200 bg-opacity-20 border border-green-300' 
                    : 'hover:bg-gray-100'}`}
              >
                <item.icon 
                  size={22} 
                  className={`min-w-[20px] ${location.pathname === item.path 
                    ? 'text-green-600' 
                    : 'text-green-500'}`}
                />
                <span className={`hidden group-hover:block font-semibold tracking-wide text-[15px]
                  ${location.pathname === item.path 
                    ? 'text-green-600' 
                    : 'text-green-500'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;