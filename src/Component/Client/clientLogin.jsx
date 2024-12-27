import React, { useState } from 'react'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { db } from '../Firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const ClientLogin = ({onLoginSuccess}) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const clientsRef = collection(db, "clients")
      const q = query(
        clientsRef, 
        where("email", "==", formData.email),
        where("password", "==", formData.password)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const clientData = querySnapshot.docs[0].data()
        localStorage.setItem('clientUser', JSON.stringify({
          id: querySnapshot.docs[0].id,
          type: 'client',
          ...clientData
        }))
        onLoginSuccess()
        navigate('/client-dashboard')
      } else {
        setErrors({ auth: 'Invalid client credentials' })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ auth: 'Login failed' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="relative bg-gray-200 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black bg-clip-text bg-gradient-to-r text-black font-poppins mb-2">
              Client Login
            </h1>
            <p className="text-black-300 font-poppins">Access your client dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-blue-500 text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your client email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-blue-500 text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>

            {errors.auth && <p className="text-red-400 text-sm text-center">{errors.auth}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <span>Client Sign In</span>
              <FiArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClientLogin
