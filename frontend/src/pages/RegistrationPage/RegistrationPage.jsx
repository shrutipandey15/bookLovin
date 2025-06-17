import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';
import AuthCard from '@components/AuthCard';

const RegistrationPage = () => {
  // ===================================================================================
  // SECTION 1: State, Refs, and Hooks
  // ===================================================================================
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // ===================================================================================
  // SECTION 2: Validation, Logic, and Handler Functions (FULLY IMPLEMENTED)
  // ===================================================================================

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

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(current => !current);
    } else {
      setShowConfirmPassword(current => !current);
    }
  };

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

  // ===================================================================================
  // SECTION 3: Main Component Render (JSX is now fully connected to logic)
  // ===================================================================================

  if (success) {
    return (
      <AuthCard title="Your Legend Begins!">
        <div className="text-center font-body">
          <div className="text-4xl mb-4 text-primary animate-pulse">✓</div>
          <p className="font-medium mb-2 text-primary">Welcome, {username}!</p>
          <p className="text-sm text-secondary">Redirecting you to the realm's entrance...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Begin Your Chapter">
      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="block mb-1 font-semibold text-center text-text-primary font-body">Pen Name</label>
          <input
            type="text" id="username" value={username} onChange={handleInputChange(setUsername, 30)} required disabled={loading || isBlocked}
            className="w-full px-4 py-2 rounded-md bg-background border border-secondary text-text-primary font-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          {validationErrors.username && <p className="mt-1 text-xs text-red-600">{validationErrors.username}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-semibold text-center text-text-primary font-body">Ravenmail</label>
          <input
            type="email" id="email" value={email} onChange={handleInputChange(setEmail, 254)} required disabled={loading || isBlocked}
            className="w-full px-4 py-2 rounded-md bg-background border border-secondary text-text-primary font-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          {validationErrors.email && <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-semibold text-center text-text-primary font-body">Secret Rune</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} id="password" value={password} onChange={handleInputChange(setPassword, PASSWORD_MAX_LENGTH)} required disabled={loading || isBlocked}
              className="w-full px-4 py-2 pr-12 rounded-md bg-background border border-secondary text-text-primary font-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button type="button" onClick={() => togglePasswordVisibility('password')} disabled={loading || isBlocked} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary disabled:opacity-50">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-1 h-2 rounded-full bg-secondary/20 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}/>
              </div>
              <span className="text-xs font-medium min-w-[70px] text-right text-secondary">{passwordStrength.label}</span>
            </div>
          )}
          {validationErrors.password && <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-center text-text-primary font-body">Confirm Secret Rune</label>
          <div className="relative">
             <input
                type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={handleInputChange(setConfirmPassword, PASSWORD_MAX_LENGTH)} required disabled={loading || isBlocked}
                className="w-full px-4 py-2 pr-12 rounded-md bg-background border border-secondary text-text-primary font-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            <button type="button" onClick={() => togglePasswordVisibility('confirmPassword')} disabled={loading || isBlocked} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary disabled:opacity-50">
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {validationErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>}
        </div>

        {error && <div role="alert" className="p-3 text-sm font-medium rounded-md border text-primary bg-primary/10 border-primary/20">{error}</div>}
        
        {isBlocked && (
          <div role="alert" className="p-3 text-sm font-medium rounded-md border text-secondary bg-secondary/10 border-secondary/20">
            Registration temporarily blocked. Try again in {formatBlockTime()}.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isBlocked || !username || !email || !password || !confirmPassword || Object.keys(validationErrors).length > 0}
          className="w-full px-4 py-2 mt-2 rounded-lg bg-primary text-text-contrast font-body hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {loading ? 'Inscribing...' : 'Scribe Me In'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-text-primary font-body">
        Already have a chapter?{' '}
        <Link to="/login" className="underline text-primary hover:opacity-80">
          Enter the realm
        </Link>
      </p>
    </AuthCard>
  );
};

export default RegistrationPage;