import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';
import { fetchCurrentUser } from '@components/auth';
import { useMood } from '@components/MoodContext';
import AuthCard from '@components/AuthCard';

const LoginPage = () => {
  // ===================================================================================
  // SECTION 1: State, Refs, and Hooks
  // ===================================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);

  const { mood, moodConfig } = useMood();

  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const MAX_LOGIN_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const REQUEST_TIMEOUT = 30000; // 30 seconds

  // ===================================================================================
  // SECTION 2: Logic and Handlers (FULLY IMPLEMENTED)
  // ===================================================================================
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  const validatePassword = (password) => password.length >= 8 && password.length <= 128;

  useEffect(() => {
    const checkBlock = () => {
      const storedBlockEnd = localStorage.getItem('loginBlockEnd');
      if (storedBlockEnd) {
        const blockEnd = new Date(storedBlockEnd);
        if (new Date() < blockEnd) {
          setIsBlocked(true);
          setBlockEndTime(blockEnd);
        } else {
          localStorage.removeItem('loginBlockEnd');
          localStorage.removeItem('loginAttempts');
          setIsBlocked(false);
          setBlockEndTime(null);
        }
      }
      const storedAttempts = localStorage.getItem('loginAttempts');
      if (storedAttempts) {
        setLoginAttempts(parseInt(storedAttempts, 10));
      }
    };
    checkBlock();
    const interval = setInterval(checkBlock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  useEffect(() => {
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const currentUser = await fetchCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
        }
      }
    };
    checkExistingLogin();
  }, [navigate, location]);

  const handleRateLimitExceeded = useCallback(() => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts.toString());
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockEnd = new Date(Date.now() + BLOCK_DURATION);
      setIsBlocked(true);
      setBlockEndTime(blockEnd);
      localStorage.setItem('loginBlockEnd', blockEnd.toISOString());
      setError(`Too many failed attempts. Access blocked for 15 minutes.`);
    }
  }, [loginAttempts, BLOCK_DURATION, MAX_LOGIN_ATTEMPTS]);

  const clearErrorAfterDelay = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setError(''), 5000);
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (isBlocked) {
      setError('Account temporarily blocked. Please try again later.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      clearErrorAfterDelay();
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be between 8 and 128 characters.');
      clearErrorAfterDelay();
      return;
    }
    setLoading(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    abortControllerRef.current = new AbortController();
    try {
      const params = new URLSearchParams();
      params.append('username', email.trim().toLowerCase());
      params.append('password', password);
      const response = await axiosInstance.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: abortControllerRef.current.signal,
        timeout: REQUEST_TIMEOUT,
      });

      if (!response.data?.access_token) throw new Error('Invalid response from server');
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginBlockEnd');
      setLoginAttempts(0);
      setIsBlocked(false);

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
      setPassword('');
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.');
        handleRateLimitExceeded();
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
        handleRateLimitExceeded();
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        const message = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please try again.';
        setError(typeof message === 'string' ? message : 'Login failed. Please try again.');
      }
      clearErrorAfterDelay();
      setPassword('');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailChange = (e) => {
    if (e.target.value.length <= 254) setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    if (e.target.value.length <= 128) setPassword(e.target.value);
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const formatBlockTime = () => {
    if (!blockEndTime) return '';
    const now = new Date();
    const remaining = Math.ceil((new Date(blockEndTime) - now) / 60000);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  };

  // ===================================================================================
  // SECTION 3: Main Component Render
  // ===================================================================================

  if (isLoggedIn && user) {
    const currentMoodLabel = moodConfig[mood]?.label || '...';
    return (
      <AuthCard title="Welcome Back!">
        <div className="text-center font-body">
            <p className="mb-4 text-text-primary">
              Logged in as: <strong>{user.email || email}</strong>
            </p>
            <p className="mb-4 text-xs italic text-secondary">
              Current mood: {currentMoodLabel}
            </p>
            <div className="mb-4 space-y-2">
              <Link to="/posts" className="block w-full rounded-lg bg-primary px-4 py-2 text-text-contrast transition-opacity hover:opacity-90">
                View Posts
              </Link>
              <Link to="/journal" className="block w-full rounded-lg bg-secondary px-4 py-2 text-text-contrast transition-opacity hover:opacity-90">
                My Journal
              </Link>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                setUser(null);
                setEmail('');
                setPassword('');
              }}
              className="w-full rounded-lg border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary/10"
            >
              Logout
            </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Enter the Realm">
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold text-center text-text-primary font-body">
            Ravenmail
          </label>
          <input
            type="email" id="email" value={email} onChange={handleEmailChange} required
            disabled={loading || isBlocked} autoComplete="email"
            className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary font-body transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-semibold text-center text-text-primary font-body">
            Secret Rune
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={handlePasswordChange} required
              disabled={loading || isBlocked} autoComplete="current-password"
              className="w-full rounded-md border border-secondary bg-background px-4 py-2 pr-12 text-text-primary font-body transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button" onClick={togglePasswordVisibility} disabled={loading || isBlocked}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary transition-opacity hover:text-primary disabled:opacity-50"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        
        {error && (
            <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-600">
                {error}
            </div>
        )}
        {isBlocked && (
          <div role="alert" className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm font-medium text-yellow-600">
            Account temporarily blocked. Try again in {formatBlockTime()}.
          </div>
        )}

        <button
          type="submit" disabled={loading || isBlocked || !email || !password}
          className="w-full rounded-lg bg-primary px-4 py-2 font-body text-text-contrast transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Opening scrolls...' : 'Unlock the Tome'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-text-primary font-body">
        New to the realm?{' '}
        <Link to="/register" className="font-semibold text-primary underline-offset-2 hover:underline">
          Begin your chapter
        </Link>
      </p>
    </AuthCard>
  );
};

export default LoginPage;