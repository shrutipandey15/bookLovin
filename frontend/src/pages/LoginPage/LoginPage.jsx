import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'
import { fetchCurrentUser } from '@/components/auth'
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [setUser] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post(
        '/auth/login',
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      localStorage.setItem('token', response.data.access_token)

      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      setIsLoggedIn(true)
      console.log('Login successful:', response.data)

    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-coffee-card dark:bg-dragon-card rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {isLoggedIn ? (
        <p classname="text-center font-medium">Welcome back, {email}!</p>
      ) : (
        <>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 font-semibold">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-semibold">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
              />
            </div>

            {error && (
              <p className="text-sm text-coffee-error dark:text-red-400 font-medium">{error}</p>
              )}

            <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 mt-2 bg-coffee-button dark:bg-dragon-blue text-white rounded hover:bg-coffee-hover dark:hover:bg-dragon-blueHover transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p classname="mt-4 text-sm text-center">
            Don't have an account?{' '}
            <Link
            to="/register"
            className="underline text-coffee-accent dark:text-dragon-gold hover:opacity-80"
            >
            Register here</Link></p>
        </>
      )}
      </div>
    </div>
  )
}

export default LoginPage
