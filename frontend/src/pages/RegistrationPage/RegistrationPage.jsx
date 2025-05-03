import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'

const RegistrationPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
      })

      const data = response.data

      if (data?.id) {
        setSuccess(true)
        console.log('User registered:', data)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else if (data?.error_code === 'USER_ALREADY_EXISTS') {
        setError('User already exists. Try logging in.')
      } else {
        setError('Registration failed. Please check your inputs.')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-coffee-card dark:bg-dragon-card rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {success ? (
          <p className="text-center font-medium text-green-600 dark:text-green-400">
            Registration successful! Welcome, {username}.
          </p>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-1 font-semibold">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-semibold">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-semibold">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
              />
            </div>

            {error && (
              <p className="text-sm text-coffee-error dark:text-red-400 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 mt-2 bg-coffee-button dark:bg-dragon-blue text-white rounded hover:bg-coffee-hover dark:hover:bg-dragon-blueHover transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default RegistrationPage
