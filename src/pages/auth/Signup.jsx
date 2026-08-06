import { useState } from 'react';
import '../../styles/auth.css';

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

export default function Signup({ onNavigate, setUser, redirectAfterLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [sent, setSent]         = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())                      e.name     = 'Full name is required';
    if (!email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters';
    if (!confirm)                          e.confirm  = 'Please confirm your password';
    else if (confirm !== password)         e.confirm  = 'Passwords do not match';
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Signup failed'); setLoading(false); return; }
      setSent(true);
      setLoading(false);
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#e55', '#f90', '#7C5CE8', '#0a0'];

  if (sent) {
    return (
      <div id="page-signup" className="page active">
        <div className="auth-wrap">
          <div className="auth-box" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className="auth-header">
              <div
                className="auth-logo"
                style={{ background: 'linear-gradient(135deg, #7C5CE8, #5B3FC4)' }}
              >
                ✉️
              </div>
              <h1>Check your email</h1>
              <p>
                We've sent a verification link to <strong>{email}</strong>. Click it to
                activate your account, then sign in.
              </p>
            </div>
            <button className="auth-btn-primary" onClick={() => onNavigate('login')}>
              Go to Sign In
            </button>
            <p className="auth-switch" style={{ marginTop: '8px' }}>
              Didn't get it? Check spam, or{' '}
              <button type="button" onClick={() => setSent(false)}>try again</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-signup" className="page active">
      <div className="auth-wrap">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo" onClick={() => onNavigate('home')}>🐾</div>
            <h1>Create your account</h1>
            <p>Join VinuCare and give your pet the best care.</p>
          </div>

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

          {apiError && <div className="auth-api-error">{apiError}</div>}

          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              className={`auth-input${errors.name ? ' err' : ''}`}
              placeholder="Sarah Johnson"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            />
            {errors.name && <span className="auth-err-msg">{errors.name}</span>}
          </div>

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
            <label>Password</label>
            <div className="auth-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`auth-input${errors.password ? ' err' : ''}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              />
              <button className="auth-eye" type="button" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      height: '3px', flex: 1, borderRadius: '2px',
                      background: i <= strength ? strengthColor[strength] : '#eee',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColor[strength] }}>
                  {strengthLabel[strength]} password
                </span>
              </div>
            )}
            {errors.password && <span className="auth-err-msg">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <div className="auth-pw-wrap">
              <input
                type={showCf ? 'text' : 'password'}
                className={`auth-input${errors.confirm ? ' err' : ''}`}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
              />
              <button className="auth-eye" type="button" onClick={() => setShowCf(v => !v)}>
                {showCf ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirm && !errors.confirm && confirm === password && (
              <span style={{ fontSize: '0.75rem', color: '#0a0' }}>✓ Passwords match</span>
            )}
            {errors.confirm && <span className="auth-err-msg">{errors.confirm}</span>}
          </div>

          <p style={{ fontSize: '0.78rem', color: '#999', textAlign: 'center', margin: '4px 0 12px' }}>
            By signing up you agree to our{' '}
            <span style={{ color: '#7C5CE8', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#7C5CE8', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

          <button className="auth-btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => onNavigate('login')}>Sign in</button>
          </p>

        </div>
      </div>
    </div>
  );
}