import { useState } from 'react';
import '../../styles/auth.css';

export default function Login({ onNavigate, setIsLoggedIn }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters';
    return e;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      onNavigate('home');
    }, 1400);
  };

  return (
    <div id="page-login" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">

          {/* HEADER */}
          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')}>🐾</div>
            <h1>Sign in to VinuCare</h1>
            <p>Welcome back — your pets are waiting.</p>
          </div>

          {/* GOOGLE */}
          <button className="auth-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="auth-or"><span>or</span></div>

          {/* EMAIL */}
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

          {/* PASSWORD */}
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
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="auth-err-msg">{errors.password}</span>}
          </div>

          {/* SUBMIT */}
          <button className="auth-btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* SWITCH TO SIGNUP */}
          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={() => onNavigate('signup')}>Create one free</button>
          </p>

        </div>
      </div>
    </div>
  );
}
