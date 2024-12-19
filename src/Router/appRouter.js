import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../Component/Login'
import Home from '../Component/Home'
import Comments from '../Component/comments'
import Activities from '../Component/activities'

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        } />
        <Route path="/home" element={
          isAuthenticated ? <Home /> : <Navigate to="/" />
        } />
        <Route path="/comments" element={
          isAuthenticated ? <Comments /> : <Navigate to="/" />
        } />
        <Route path="/activities" element={
          isAuthenticated ? <Activities /> : <Navigate to="/" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter