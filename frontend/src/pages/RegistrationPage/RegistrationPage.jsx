import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '@api/axiosInstance'

const RegistrationPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [registrationAttempts, setRegistrationAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockEndTime, setBlockEndTime] = useState(null)

  const navigate = useNavigate()
  const abortControllerRef = useRef(null)
  const timeoutRef = useRef(null)
  const redirectTimeoutRef = useRef(null)

  const MAX_REGISTRATION_ATTEMPTS = 100 // needs to be 5, but for testing purposes, we set it to 100
  const BLOCK_DURATION = 3000 // needs to be 10 minutes, but for testing purposes, we set it to 3 seconds
  const REQUEST_TIMEOUT = 30000 // 30 seconds

  const PASSWORD_MIN_LENGTH = 8
  const PASSWORD_MAX_LENGTH = 128

  const validateUsername = (username) => {
    const trimmed = username.trim()
    if (trimmed.length < 3 || trimmed.length > 30) return false
    // Allow letters, numbers, underscores, hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    return usernameRegex.test(trimmed)
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // Fixed password validation logic
  const validatePassword = (password) => {
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      return { valid: false, message: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long` }
    }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      }
    }

    return { valid: true, message: '' }
  }

  const validateForm = useCallback(() => {
    const errors = {}

    if (username && !validateUsername(username)) {
      errors.username = 'Username must be 3-30 characters, letters/numbers/underscore/hyphen only'
    }

    if (email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (password) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message
      }
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [username, email, password, confirmPassword])

  useEffect(() => {
    validateForm()
  }, [validateForm])

  useEffect(() => {
    const checkBlock = () => {
      const storedBlockEnd = localStorage.getItem('registrationBlockEnd')
      if (storedBlockEnd) {
        const blockEnd = new Date(storedBlockEnd)
        if (new Date() < blockEnd) {
          setIsBlocked(true)
          setBlockEndTime(blockEnd)
        } else {
          localStorage.removeItem('registrationBlockEnd')
          localStorage.removeItem('registrationAttempts')
          setIsBlocked(false)
          setBlockEndTime(null)
        }
      }

      const storedAttempts = localStorage.getItem('registrationAttempts')
      if (storedAttempts) {
        setRegistrationAttempts(parseInt(storedAttempts, 10))
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
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const handleRateLimitExceeded = useCallback(() => {
    const newAttempts = registrationAttempts + 1
    setRegistrationAttempts(newAttempts)
    localStorage.setItem('registrationAttempts', newAttempts.toString())

    if (newAttempts >= MAX_REGISTRATION_ATTEMPTS) {
      const blockEnd = new Date(Date.now() + BLOCK_DURATION)
      setIsBlocked(true)
      setBlockEndTime(blockEnd)
      localStorage.setItem('registrationBlockEnd', blockEnd.toISOString())
      setError('Too many registration attempts. Please try again in 10 minutes.')
    }
  }, [registrationAttempts])

  const clearErrorAfterDelay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setError('')
    }, 5000)
  }, [])

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Check if blocked
    if (isBlocked) {
      setError('Registration temporarily blocked. Please try again later.')
      return
    }

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below.')
      clearErrorAfterDelay()
      return
    }

    // Final validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.')
      clearErrorAfterDelay()
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      clearErrorAfterDelay()
      return
    }

    setLoading(true)

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      // Backend expects: username, email, password (NewUser model)
      const requestData = {
        username: sanitizeInput(username),
        email: sanitizeInput(email.toLowerCase()),
        password: password, // Don't sanitize password as it may contain special chars
      }

      const response = await axiosInstance.post('/auth/register', requestData, {
        signal: abortControllerRef.current.signal,
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Backend returns null on success or UserError on failure
      const data = response.data

      // Check if response is null (success) or contains error
      if (data === null || data === undefined) {
        // Success case
        setSuccess(true)

        // Clear registration attempts on success
        localStorage.removeItem('registrationAttempts')
        localStorage.removeItem('registrationBlockEnd')
        setRegistrationAttempts(0)
        setIsBlocked(false)

        // Clear sensitive data
        setPassword('')
        setConfirmPassword('')

        console.log('User registered successfully')

        // Redirect after 3 seconds
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Registration successful! Please log in with your credentials.'
            }
          })
        }, 3000)

      } else if (data && data.error_code) {
        // Handle UserError response
        switch (data.error_code) {
          case 'ALREADY_EXISTS':
            setError('A tale with that Pen name or Ravenmail already exists. Try entering the realm.')
            break
          case 'INVALID_EMAIL':
            setError('Please provide a valid Ravenmail address.')
            break
          case 'WEAK_PASSWORD':
            setError('Your Secret Rune is too weak. Make it stronger.')
            break
          default:
            setError(data.details || 'The scroll was not sealed. Please check your runes and try again.')
        }
        clearErrorAfterDelay()
      } else {
        console.warn('Unexpected registration response:', data)
        setError('The scroll was not sealed. Please check your runes and try again.')
        clearErrorAfterDelay()
      }
    } catch (err) {
      console.error('Registration error:', err)

      if (err.name === 'AbortError') {
        setError('Registration was cancelled.')
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.')
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data?.details || err.response.data?.detail || 'Invalid registration data.'
        setError(typeof errorMessage === 'string' ? errorMessage : 'Invalid registration data.')
      } else if (err.response?.status === 409) {
        setError('Username or email already exists.')
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.')
        handleRateLimitExceeded()
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        setError('The stars are misaligned. Please try again later.')
        handleRateLimitExceeded()
      }

      clearErrorAfterDelay()

      // Clear sensitive data on error
      setPassword('')
      setConfirmPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (setter, maxLength) => (e) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setter(value)
    }
  }

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  const formatBlockTime = () => {
    if (!blockEndTime) return ''
    const now = new Date()
    const remaining = Math.ceil((blockEndTime - now) / 1000 / 60)
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`
  }

  // Fixed password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }

    let score = 0

    // Length scoring (more granular)
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety scoring
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const charTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

    // Add points based on character variety
    if (charTypes >= 2) score += 1
    if (charTypes >= 3) score += 1
    if (charTypes >= 4) score += 1

    // Bonus for very long passwords with all character types
    if (password.length >= 20 && charTypes === 4) score += 1

    // Cap the score at 5
    score = Math.min(score, 5)

    const strengthLevels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Very Strong', color: 'bg-green-600' }
    ]

    return {
      strength: score,
      label: strengthLevels[score]?.label || 'Very Weak',
      color: strengthLevels[score]?.color || 'bg-red-500'
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 transition-colors duration-300"
      style={{
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)'
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-md transition-colors duration-300"
        style={{
          backgroundColor: 'var(--mood-bg)',
          border: '1px solid var(--mood-secondary)'
        }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{
            color: 'var(--mood-primary)',
            fontFamily: 'var(--mood-font)'
          }}
        >
          Begin Your Chapter
        </h1>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4" style={{ color: 'var(--mood-primary)' }}>✓</div>
            <p
              className="font-medium mb-2"
              style={{ color: 'var(--mood-primary)' }}
            >
              Your legend begins, {username}!
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--mood-secondary)' }}
            >
              Redirecting you to login in 3 seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block mb-1 font-semibold text-center"
                style={{ color: 'var(--mood-text)' }}
              >
                Pen Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleInputChange(setUsername, 30)}
                required
                disabled={loading || isBlocked}
                autoComplete="username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--mood-bg)',
                  borderColor: 'var(--mood-secondary)',
                  color: 'var(--mood-text)',
                  focusRingColor: 'var(--mood-primary)'
                }}
                aria-describedby="username-error"
              />
              {validationErrors.username && (
                <p id="username-error" className="mt-1 text-xs text-red-600">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-semibold text-center"
                style={{ color: 'var(--mood-text)' }}
              >
                Ravenmail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange(setEmail, 254)}
                required
                disabled={loading || isBlocked}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--mood-bg)',
                  borderColor: 'var(--mood-secondary)',
                  color: 'var(--mood-text)'
                }}
                aria-describedby="email-error"
              />
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 font-semibold text-center"
                style={{ color: 'var(--mood-text)' }}
              >
                Secret Rune
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange(setPassword, PASSWORD_MAX_LENGTH)}
                  required
                  disabled={loading || isBlocked}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--mood-bg)',
                    borderColor: 'var(--mood-secondary)',
                    color: 'var(--mood-text)'
                  }}
                  aria-describedby="password-error password-strength"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  disabled={loading || isBlocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 disabled:opacity-50 transition-opacity duration-200"
                  style={{ color: 'var(--mood-secondary)' }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {password && (
                <div id="password-strength" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--mood-secondary)' }}
                    >
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${Math.max((passwordStrength.strength / 5) * 100, 10)}%` }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium min-w-16"
                      style={{ color: 'var(--mood-secondary)' }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-1 font-semibold text-center"
                style={{ color: 'var(--mood-text)' }}
              >
                Confirm Secret Rune
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword, PASSWORD_MAX_LENGTH)}
                  required
                  disabled={loading || isBlocked}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--mood-bg)',
                    borderColor: 'var(--mood-secondary)',
                    color: 'var(--mood-text)'
                  }}
                  aria-describedby="confirm-password-error"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={loading || isBlocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 disabled:opacity-50 transition-opacity duration-200"
                  style={{ color: 'var(--mood-secondary)' }}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-xs text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 text-sm font-medium border rounded-md"
                style={{
                  color: '#DC2626',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  borderColor: 'rgba(220, 38, 38, 0.3)'
                }}
              >
                {error}
              </div>
            )}

            {isBlocked && (
              <div
                className="p-3 text-sm border rounded-md"
                style={{
                  color: '#D97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  borderColor: 'rgba(217, 119, 6, 0.3)'
                }}
              >
                Registration temporarily blocked. Try again in {formatBlockTime()}.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isBlocked || !username || !email || !password || !confirmPassword || Object.keys(validationErrors).length > 0}
              className="w-full px-4 py-2 mt-2 text-white rounded hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--mood-primary)',
                color: 'var(--mood-contrast)',
                fontFamily: 'var(--mood-font)'
              }}
            >
              {loading ? 'Inscribing...' : 'Scribe Me In'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-4 text-sm text-center" style={{ color: 'var(--mood-text)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="underline hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded transition-opacity duration-200"
              style={{
                color: 'var(--mood-primary)',
                fontFamily: 'var(--mood-font)'
              }}
            >
              Enter the realm
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default RegistrationPage
