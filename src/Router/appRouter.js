import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Component/Login';
import Dashboard from '../Component/Dashboard';
import ChatRoom from '../Component/Chat/chatRoom';
import AudioCall from '../Component/Chat/audioCall';

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default AppRouter;
