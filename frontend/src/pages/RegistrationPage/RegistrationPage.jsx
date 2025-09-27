import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';
import { BookHeart, Key } from 'lucide-react';

const RegistrationPage = () => {
  // --- ALL OF YOUR EXISTING LOGIC IS 100% PRESERVED ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, _setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [_success, setSuccess] = useState(false);
  // const [_showPassword, setShowPassword] = useState(false);
  // const [_showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);

  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  const MAX_REGISTRATION_ATTEMPTS = 5;
  const BLOCK_DURATION = 10 * 60 * 1000;
  const REQUEST_TIMEOUT = 30000;
  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_MAX_LENGTH = 128;

  const validateUsername = (u) => {
    const trimmed = u.trim();
    if (trimmed.length < 3 || trimmed.length > 30) return false;
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(trimmed);
  };

  const validateEmail = (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e) && e.length <= 254;
  };

  const validatePassword = (p) => {
    if (p.length < PASSWORD_MIN_LENGTH || p.length > PASSWORD_MAX_LENGTH) {
      return { valid: false, message: `Rune must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.` };
    }
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /\d/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return { valid: false, message: 'Rune needs uppercase, lowercase, number, and special characters.' };
    }
    return { valid: true, message: '' };
  };

  const validateForm = useCallback(() => {
    const errors = {};
    if (username && !validateUsername(username)) errors.username = 'Pen Name must be 3-30 characters (letters, numbers, _, -).';
    if (email && !validateEmail(email)) errors.email = 'Please provide a valid Ravenmail address.';
    if (password) {
      const pwValidation = validatePassword(password);
      if (!pwValidation.valid) errors.password = pwValidation.message;
    }
    if (confirmPassword && password !== confirmPassword) errors.confirmPassword = 'Runes do not match.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, email, password, confirmPassword]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);
  
  useEffect(() => {
    const checkBlock = () => {
      const storedBlockEnd = localStorage.getItem('registrationBlockEnd');
      if (storedBlockEnd) {
        const blockEnd = new Date(storedBlockEnd);
        if (new Date() < blockEnd) {
          setIsBlocked(true);
          setBlockEndTime(blockEnd);
        } else {
          localStorage.removeItem('registrationBlockEnd');
          localStorage.removeItem('registrationAttempts');
          setIsBlocked(false);
          setBlockEndTime(null);
        }
      }
      const storedAttempts = localStorage.getItem('registrationAttempts');
      if (storedAttempts) setRegistrationAttempts(parseInt(storedAttempts, 10));
    };
    checkBlock();
    const interval = setInterval(checkBlock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);
  
  const handleRateLimitExceeded = useCallback(() => {
    const newAttempts = registrationAttempts + 1;
    setRegistrationAttempts(newAttempts);
    localStorage.setItem('registrationAttempts', newAttempts.toString());
    if (newAttempts >= MAX_REGISTRATION_ATTEMPTS) {
      const blockEnd = new Date(Date.now() + BLOCK_DURATION);
      setIsBlocked(true);
      setBlockEndTime(blockEnd);
      setError(`Too many attempts. Registration blocked for 10 minutes.`);
    }
  }, [registrationAttempts, MAX_REGISTRATION_ATTEMPTS, BLOCK_DURATION]);

  const clearErrorAfterDelay = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setError(''), 5000);
  }, []);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (isBlocked) {
      setError('Registration is temporarily blocked.');
      return;
    }
    if (!validateForm()) {
      setError('Please fix the errors below.');
      clearErrorAfterDelay();
      return;
    }
    setLoading(true);
    abortControllerRef.current = new AbortController();
    try {
      const requestData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };
      await axiosInstance.post('/auth/register', requestData, {
        signal: abortControllerRef.current.signal,
        timeout: REQUEST_TIMEOUT,
      });
      setSuccess(true);
      localStorage.removeItem('registrationAttempts');
      localStorage.removeItem('registrationBlockEnd');
      redirectTimeoutRef.current = setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }, 3000);
    } catch (err) {
      handleRateLimitExceeded();
      if (err.response?.status === 409) {
        setError('A tale with that Pen Name or Ravenmail already exists.');
      } else {
        setError('The stars are misaligned. Please try again later.');
      }
      clearErrorAfterDelay();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, maxLength) => (e) => {
    if (e.target.value.length <= maxLength) {
      setter(e.target.value);
    }
  };

  // const togglePasswordVisibility = (field) => {
  //   if (field === 'password') {
  //     setShowPassword(current => !current);
  //   } else {
  //     setShowConfirmPassword(current => !current);
  //   }
  // };

  const getPasswordStrength = (p) => {
    if (!p) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) score++;
    score = Math.min(score, 5);
    const levels = [
        { label: 'Very Weak', color: 'bg-red-500' }, { label: 'Weak', color: 'bg-red-400' },
        { label: 'Fair', color: 'bg-yellow-500' }, { label: 'Good', color: 'bg-blue-500' },
        { label: 'Strong', color: 'bg-green-500' }, { label: 'Very Strong', color: 'bg-green-600' }
    ];
    return { strength: score, label: levels[score].label, color: levels[score].color };
  };

  const passwordStrength = getPasswordStrength(password);
  
  const formatBlockTime = () => {
    if (!blockEndTime) return '';
    const remaining = Math.ceil((new Date(blockEndTime) - new Date()) / 60000);
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
                <Link to="/login" className="rounded-full py-2 text-center font-semibold text-text-secondary hover:bg-black/5">Sign In</Link>
                <Link to="/register" className="rounded-full bg-primary py-2 text-center font-semibold text-text-contrast shadow">Join Us</Link>
            </div>

            <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div>
                    <label htmlFor="username" className="text-sm font-medium text-text-primary">Name</label>
                    <input
                        type="text" id="username" value={username} onChange={handleInputChange(setUsername, 30)} required disabled={loading || isBlocked}
                        placeholder="Your literary alias..."
                        className="mt-1 w-full rounded-lg border border-border-color bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {validationErrors.username && <p className="mt-1 text-xs text-red-600">{validationErrors.username}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-text-primary">Email</label>
                    <input
                        type="email" id="email" value={email} onChange={handleInputChange(setEmail, 254)} required disabled={loading || isBlocked}
                        placeholder="reader@booklovin.com"
                        className="mt-1 w-full rounded-lg border border-border-color bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {validationErrors.email && <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
                    <input
                        type="password" id="password" value={password} onChange={handleInputChange(setPassword, PASSWORD_MAX_LENGTH)} required disabled={loading || isBlocked}
                        placeholder="Create your secret passage..."
                        className="mt-1 w-full rounded-lg border border-border-color bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {validationErrors.password && <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
                </div>
                {password && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary/20 overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}/>
                    </div>
                    <span className="text-xs font-medium min-w-[70px] text-right text-secondary">{passwordStrength.label}</span>
                  </div>
                )}
                 {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                 {isBlocked && <p className="text-sm text-yellow-600 text-center">Registration temporarily blocked. Try again in {formatBlockTime()}.</p>}
                <button
                    type="submit"
                    disabled={loading || isBlocked || !username || !email || !password || !confirmPassword || Object.keys(validationErrors).length > 0}
                    className="w-full rounded-lg bg-primary py-3 font-semibold text-text-contrast shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Joining...' : 'Join the Community'}
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

export default RegistrationPage;

