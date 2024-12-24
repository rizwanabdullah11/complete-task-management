import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Component/Login';
import Dashboard from '../Component/Dashboard';

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        } />
        <Route path="/dashboard/*" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
