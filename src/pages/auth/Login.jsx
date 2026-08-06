import { useState } from 'react';
import '../../styles/auth.css';
import { isAdminEmail } from '../../config/adminAccess';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login({ onNavigate, setUser, redirectAfterLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending]   = useState(false);
  const [resendMsg, setResendMsg]   = useState('');

  const validate = () => {
    const e = {};
    if (!email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters';
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    setNeedsVerification(false);
    setResendMsg('');
    try {
      const res  = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || 'Login failed');
        if (data.needsVerification) setNeedsVerification(true);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);

      const admin = isAdminEmail(data.user?.email) || data.user?.role === 'Admin';
      const isDoctor = data.user?.role === 'Doctor';
      const isNurse = data.user?.role === 'Nurse';
      const userWithAccess = { ...data.user, isAdmin: admin, isDoctor, isNurse }
      localStorage.setItem('user', JSON.stringify(userWithAccess));;
      setUser(userWithAccess);

      let destination = redirectAfterLogin || 'home';
      if (admin) destination = 'admin';
      else if (isDoctor) destination = 'doctor';
      else if (isNurse) destination = 'nurse';

      onNavigate(destination);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || 'Verification email sent.');
    } catch {
      setResendMsg('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div id="page-login" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')}>🐾</div>
            <h1>Sign in to VinuCare</h1>
            <p>Welcome back — your pets are waiting.</p>
          </div>

          {apiError && <div className="auth-api-error">{apiError}</div>}
          {needsVerification && (
            <div style={{ textAlign: 'center', marginTop: '-8px' }}>
              {resendMsg ? (
                <span style={{ fontSize: '.82rem', color: '#0a0' }}>{resendMsg}</span>
              ) : (
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={resendVerification}
                  disabled={resending}
                >
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <button className="auth-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-or"><span>or</span></div>

          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email"
              className={`auth-input${errors.email ? ' err' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            />
            {errors.email && <span className="auth-err-msg">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label>Password</label>
              <button className="auth-link-btn" type="button">Forgot password?</button>
            </div>
            <div className="auth-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`auth-input${errors.password ? ' err' : ''}`}
                placeholder="Your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              />
              <button className="auth-eye" type="button" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="auth-err-msg">{errors.password}</span>}
          </div>

          <button className="auth-btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={() => onNavigate('signup')}>Create one free</button>
          </p>

        </div>
      </div>
    </div>
  );
}