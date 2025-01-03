import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Component/Login';
import Dashboard from '../Component/Dashboard';
import ChatRoom from '../Component/Chat/chatRoom';
import AudioCall from '../Component/Chat/videoCall';


const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
   
 
      <Routes>
        <Route 
          path="/" 
          element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} 
        />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route path="/dashboard/chat/:taskId" element={<ChatRoom />} />
        <Route path="/call/:taskId/:userId" element={<AudioCall />} />
      </Routes>
  
  );
};

export default AppRouter;
