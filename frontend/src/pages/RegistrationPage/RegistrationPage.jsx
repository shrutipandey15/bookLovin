import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

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
    <div className="registration-page">
      <h2>Register</h2>

      {success ? (
        <p>Registration successful! Welcome, {username}.</p>
      ) : (
        <form onSubmit={handleRegister}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}
    </div>
  )
}

export default RegistrationPage
