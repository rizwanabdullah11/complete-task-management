// import React, { useState } from 'react'
// import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
// import { useNavigate } from 'react-router-dom'
// import { auth } from './Firebase'
// import { signInWithEmailAndPassword } from 'firebase/auth'

// const Login = ({onLoginSuccess}) => {
//   const [formData, setFormData] = useState({ email: '', password: '' })
//   const [errors, setErrors] = useState({})
//   const navigate = useNavigate()
//   const [showPassword, setShowPassword] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
//       const user = userCredential.user
//       console.log("Logged in user:", user.uid)
//       onLoginSuccess()
//       navigate('/dashboard')
//     } catch (signInError) {
//       console.error("Auth error:", signInError)
//       setErrors({ auth: 'Invalid credentials' })
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="absolute inset-0 opacity-20"></div>
//       <div className="w-full max-w-md relative">
//         <div className="relative bg-gray-200 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-black bg-clip-text bg-gradient-to-r text-black font-poppins mb-2">
//               Welcome
//             </h1>
//             <p className="text-black-300 font-poppins">Sign in to continue your journey</p>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="relative">
//               <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiMail className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="email"
//                 className="w-full pl-10 pr-4 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-green-500 text-black placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
//                 placeholder="Enter your email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//               />
//             </div>
            
//             <div className="relative">
//               <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiLock className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full pl-10 pr-12 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-green-500 text-black placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({...formData, password: e.target.value})}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
//               >
//                 {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
//               </button>
//             </div>

//             {errors.auth && <p className="text-red-400 text-sm text-center">{errors.auth}</p>}

//             <button
//               type="submit"
//               className="w-full bg-green-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transform hover:scale-105"
//             >
//               <span>Sign In</span>
//               <FiArrowRight className="h-5 w-5" />
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login

import React, { useState } from 'react'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const Login = ({onLoginSuccess}) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      console.log("Logged in user:", user.uid)
      onLoginSuccess()
      navigate('/dashboard')
    } catch (signInError) {
      console.error("Auth error:", signInError)
      setErrors({ auth: 'Invalid credentials' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20"></div>
      <div className="w-full max-w-md relative">
        <div className="relative bg-gray-200 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black bg-clip-text bg-gradient-to-r text-black font-poppins mb-2">
              Welcome
            </h1>
            <p className="text-black-300 font-poppins">Sign in to continue your journey</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-green-500 text-black placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <div className="absolute mt-4 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 bg-gray-300 bg-opacity-50 rounded-lg border border-green-500 text-black placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
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
              className="w-full bg-green-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <span>Sign In</span>
              <FiArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
