import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';
import { fetchCurrentUser } from '@components/auth';
import { BookHeart, Key } from 'lucide-react';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [_isLoggedIn, setIsLoggedIn] = useState(false);
  const [_user, setUser] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const MAX_LOGIN_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const REQUEST_TIMEOUT = 30000; // 30 seconds

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
            navigate('/'); // Redirect if already logged in
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
      navigate('/');
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
  
  const formatBlockTime = () => {
    if (!blockEndTime) return '';
    const now = new Date();
    const remaining = Math.ceil((new Date(blockEndTime) - now) / 60000);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  };
  
  // --- ONLY THE JSX BELOW HAS BEEN CHANGED ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <BookHeart className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mt-4 text-3xl font-bold text-text-primary font-heading">Welcome to BookLovin'</h1>
                <p className="mt-2 text-text-secondary">Your enchanted reading sanctuary awaits</p>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-background p-1">
                <Link to="/login" className="rounded-full bg-primary py-2 text-center font-semibold text-text-contrast shadow">Sign In</Link>
                <Link to="/register" className="rounded-full py-2 text-center font-semibold text-text-secondary hover:bg-black/5">Join Us</Link>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-text-primary">Email</label>
                    <input
                        type="email" id="email" value={email} onChange={handleEmailChange} required
                        disabled={loading || isBlocked} autoComplete="email"
                        placeholder="reader@booklovin.com"
                        className="mt-1 w-full rounded-lg border border-border-color bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
                    <input
                        type="password" id="password" value={password} onChange={handlePasswordChange} required
                        disabled={loading || isBlocked} autoComplete="current-password"
                        placeholder="Your secret passage..."
                        className="mt-1 w-full rounded-lg border border-border-color bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                 {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                 {isBlocked && <p className="text-sm text-yellow-600 text-center">Account temporarily blocked. Try again in {formatBlockTime()}.</p>}
                <button
                    type="submit" disabled={loading || isBlocked || !email || !password}
                    className="w-full rounded-lg bg-primary py-3 font-semibold text-text-contrast shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Entering...' : 'Enter the Library'}
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-text-secondary">
                <Link to="#" className="flex items-center justify-center gap-2 hover:text-primary">
                    <Key size={14} />
                    <span>Unlock your reading world</span>
                </Link>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
