import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '@api/axiosInstance'
import { fetchCurrentUser } from '@components/auth'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockEndTime, setBlockEndTime] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const abortControllerRef = useRef(null)
  const timeoutRef = useRef(null)

  // Rate limiting constants
  const MAX_LOGIN_ATTEMPTS = 5
  const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes
  const REQUEST_TIMEOUT = 30000 // 30 seconds

  // Input validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  const validatePassword = (password) => {
    return password.length >= 8 && password.length <= 128
  }

  // Check if user is currently blocked
  useEffect(() => {
    const checkBlock = () => {
      const storedBlockEnd = localStorage.getItem('loginBlockEnd')
      if (storedBlockEnd) {
        const blockEnd = new Date(storedBlockEnd)
        if (new Date() < blockEnd) {
          setIsBlocked(true)
          setBlockEndTime(blockEnd)
        } else {
          localStorage.removeItem('loginBlockEnd')
          localStorage.removeItem('loginAttempts')
          setIsBlocked(false)
          setBlockEndTime(null)
        }
      }

      const storedAttempts = localStorage.getItem('loginAttempts')
      if (storedAttempts) {
        setLoginAttempts(parseInt(storedAttempts, 10))
      }
    }

    checkBlock()
    const interval = setInterval(checkBlock, 1000)
    return () => clearInterval(interval)
  }, [])

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Check if already logged in (NO REDIRECT)
  useEffect(() => {
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const currentUser = await fetchCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            setIsLoggedIn(true)
            // REMOVED: Redirect logic
            // const from = location.state?.from?.pathname || '/dashboard'
            // navigate(from, { replace: true })
          }
        } catch (error) {
          console.error('Error fetching current user:', error)
          // Token is invalid, remove it
          localStorage.removeItem('token')
        }
      }
    }

    checkExistingLogin()
  }, [navigate, location])

  const handleRateLimitExceeded = useCallback(() => {
    const newAttempts = loginAttempts + 1
    setLoginAttempts(newAttempts)
    localStorage.setItem('loginAttempts', newAttempts.toString())

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockEnd = new Date(Date.now() + BLOCK_DURATION)
      setIsBlocked(true)
      setBlockEndTime(blockEnd)
      localStorage.setItem('loginBlockEnd', blockEnd.toISOString())
      setError(`Too many failed attempts. Access blocked for 15 minutes.`)
    }
  }, [loginAttempts])

  const clearErrorAfterDelay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setError('')
    }, 5000)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()

    // Clear any existing error
    setError('')

    // Check if blocked
    if (isBlocked) {
      setError('Account temporarily blocked. Please try again later.')
      return
    }

    // Client-side validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      clearErrorAfterDelay()
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be between 8 and 128 characters.')
      clearErrorAfterDelay()
      return
    }

    setLoading(true)

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await axiosInstance.post(
        '/auth/login',
        new URLSearchParams({
          username: email.trim().toLowerCase(), // Normalize email
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          signal: abortControllerRef.current.signal,
          timeout: REQUEST_TIMEOUT,
        }
      )

      // Validate response
      if (!response.data?.access_token) {
        throw new Error('Invalid response from server')
      }

      // Store token securely
      localStorage.setItem('token', response.data.access_token)

      // Clear login attempts on successful login
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('loginBlockEnd')
      setLoginAttempts(0)
      setIsBlocked(false)

      // Fetch user data
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      setIsLoggedIn(true)

      // Clear sensitive form data
      setPassword('')

      // Log successful login (without sensitive data)
      console.log('Login successful for user:', email)

      // REMOVED: Redirect logic
      // const from = location.state?.from?.pathname || '/dashboard'
      // navigate(from, { replace: true })

    } catch (err) {
      // Handle different types of errors
      if (err.name === 'AbortError') {
        setError('Request was cancelled.')
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.')
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.')
        handleRateLimitExceeded()
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.')
        handleRateLimitExceeded()
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        // Sanitize error message to prevent XSS
        const message = err.response?.data?.detail || 'Login failed. Please try again.'
        setError(typeof message === 'string' ? message : 'Login failed. Please try again.')
      }

      clearErrorAfterDelay()

      // Clear password on error for security
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    // Prevent extremely long inputs
    if (value.length <= 254) {
      setEmail(value)
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    // Prevent extremely long inputs
    if (value.length <= 128) {
      setPassword(value)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const formatBlockTime = () => {
    if (!blockEndTime) return ''
    const now = new Date()
    const remaining = Math.ceil((blockEndTime - now) / 1000 / 60)
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`
  }

  // Show success message instead of redirecting
  if (isLoggedIn && user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 text-coffee-text dark:text-dragon-text transition-colors duration-300">
        <div className="w-full max-w-md p-8 bg-coffee-card dark:bg-dragon-card rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Welcome back!</h2>
          <p className="mb-4">Successfully logged in as: <strong>{user.email || email}</strong></p>
          <p className="text-sm text-gray-600 dark:text-gray-400">You can now navigate to other parts of the application.</p>

          {/* Optional: Add a logout button */}
          <button
            onClick={() => {
              localStorage.removeItem('token')
              setIsLoggedIn(false)
              setUser(null)
              setEmail('')
              setPassword('')
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 text-coffee-text dark:text-dragon-text transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-coffee-card dark:bg-dragon-card rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Enter the Realm</h1>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-center">
              Ravenmail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={loading || isBlocked}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-semibold text-center">
              Secret Rune
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={loading || isBlocked}
                autoComplete="current-password"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md dark:bg-dragon-bg dark:border-gray-600 dark:text-dragon-text focus:outline-none focus:ring-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={error ? "error-message" : undefined}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={loading || isBlocked}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="error-message"
              role="alert"
              className="p-3 text-sm text-coffee-error dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            >
              {error}
            </div>
          )}

          {isBlocked && (
            <div className="p-3 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              Account temporarily blocked. Try again in {formatBlockTime()}.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isBlocked || !email || !password}
            className="w-full px-4 py-2 mt-2 bg-coffee-button dark:bg-dragon-blue text-white rounded hover:bg-coffee-hover dark:hover:bg-dragon-blueHover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-accent dark:focus:ring-dragon-gold"
          >
            {loading ? 'Opening scrolls...' : 'Unlock the Tome'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          New to the realm?{' '}
          <Link
            to="/register"
            className="underline text-coffee-accent dark:text-dragon-gold hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-coffee-accent dark:focus:ring-dragon-gold rounded"
          >
            Begin your chapter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
