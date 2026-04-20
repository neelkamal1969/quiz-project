// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// export default function SignUpPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert("Account created! Please login.");
//         navigate('/login');
//       } else {
//         alert(data.error || "Signup failed");
//       }
//     } catch (err) {
//       console.error("Signup error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
//       <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
//         <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Create Account</h2>
//         <form onSubmit={handleSignUp} className="space-y-4">
//           <input 
//             type="email" placeholder="Email Address" required
//             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input 
//             type="password" placeholder="Password (min 6 chars)" required minLength={6}
//             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button 
//             disabled={loading}
//             className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
//           >
//             {loading ? "Creating Account..." : "Sign Up"}
//           </button>
//         </form>
//         <p className="mt-6 text-center text-slate-500 text-sm">
//           Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const navigate = useNavigate();

  // ── Validation helpers ───────────────────────────────────────────────────
  const validateEmail = (value) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirm = (value) => {
    if (!value) {
      setConfirmError('Please confirm your password');
      return false;
    }
    if (value !== password) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Run all validations before hitting the network
    const emailOk    = validateEmail(email);
    const passwordOk = validatePassword(password);
    const confirmOk  = validateConfirm(confirmPassword);
    if (!emailOk || !passwordOk || !confirmOk) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login', { state: { signedUp: true } });
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Shared styles — mirrors LoginPage exactly
  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
    @keyframes floatA {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, -25px) scale(1.05); }
    }
    @keyframes floatB {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-18px, 22px) scale(1.04); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .signup-card { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .input-field {
      width: 100%;
      padding: 14px 18px;
      background: rgba(255,255,255,0.05);
      border: 1.5px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      color: #f1f5f9;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .input-field::placeholder { color: rgba(148,163,184,0.6); }
    .input-field:focus {
      border-color: rgba(99,102,241,0.7);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    .input-field.error-field {
      border-color: rgba(239,68,68,0.6);
      box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
    }
    .signup-btn {
      width: 100%;
      padding: 15px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #fff;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0ea5e9 100%);
      box-shadow: 0 4px 24px rgba(79,70,229,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
      transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .signup-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(79,70,229,0.5), 0 1px 0 rgba(255,255,255,0.1) inset;
    }
    .signup-btn:active:not(:disabled) { transform: scale(0.98); }
    .signup-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toggle-btn {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: rgba(148,163,184,0.7);
      line-height: 1;
      padding: 0;
    }
    .field-hint { color: #f87171; font-size: 12px; margin-top: 6px; margin-left: 4px; }
  `;

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    >
      {/* ── Mystical gradient background — identical to LoginPage ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 70% at 20% 10%, #1e3a8a22 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 80% at 80% 90%, #4f46e520 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 50% at 55% 40%, #0ea5e912 0%, transparent 55%),' +
            'linear-gradient(160deg, #0f172a 0%, #0c1428 40%, #0f1729 100%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: '8%', left: '12%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0,
          animation: 'floatA 9s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', bottom: '10%', right: '8%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)', zIndex: 0,
          animation: 'floatB 12s ease-in-out infinite',
        }}
      />

      <style>{sharedStyles}</style>

      {/* ── Card ── */}
      <div
        className="signup-card"
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 440,
          background: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          padding: '44px 40px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08) inset',
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 32, fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.8px', margin: '0 0 8px',
            }}
          >
            Create account
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 14, margin: 0 }}>
            Start your smart study journey for free
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              className={`input-field${emailError ? ' error-field' : ''}`}
            />
            {emailError && <p className="field-hint">{emailError}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                className={`input-field${passwordError ? ' error-field' : ''}`}
                style={{ paddingRight: 50 }}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {passwordError && <p className="field-hint">{passwordError}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) validateConfirm(e.target.value);
                }}
                onBlur={() => validateConfirm(confirmPassword)}
                className={`input-field${confirmError ? ' error-field' : ''}`}
                style={{ paddingRight: 50 }}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {confirmError && <p className="field-hint">{confirmError}</p>}
          </div>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#fca5a5', fontSize: 13,
              }}
            >
              <span>⚠️</span>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="signup-btn"
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Creating account...
              </>
            ) : (
              'Create free account →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', fontSize: 14, margin: 0 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.target.style.color = '#818cf8')}
          >
            Sign in
          </Link>
        </p>

        {/* Trust bar */}
        <div
          style={{
            marginTop: 28, display: 'flex', justifyContent: 'center', gap: 24,
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20,
          }}
        >
          {['100% Private', 'Gemini Powered', 'Secure Login'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: 'rgba(148,163,184,0.5)',
                fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase',
              }}
            >
              <span style={{ color: '#34d399' }}>✓</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}