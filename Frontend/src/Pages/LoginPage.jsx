import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../lib/validation';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Icon3D from '../components/ui/Icon3D';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setLoading(true);
    try {
      const data = await api.post(ENDPOINTS.LOGIN, { email, password }, { auth: false });
      login(data.token, data.user);
      toast.success('Welcome back!');
      // Redirect: profile setup if degree missing, else the main flow.
      navigate(data.user.degree ? ROUTES.IMAGE_INPUT : ROUTES.PROFILE_SETUP);
    } catch (err2) {
      toast.error(err2.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}
    >
      <Icon3D code={showPassword ? '🙈' : '👁'} size={17} />
    </button>
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your smart study journey"
      footer={
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
          New to StudyAI?{' '}
          <Link to={ROUTES.SIGNUP} style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
            Create a free account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          error={emailError}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(validateEmail(e.target.value));
          }}
          onBlur={() => setEmailError(validateEmail(email))}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightAdornment={eyeToggle}
        />
        <Button type="submit" size="lg" loading={loading} style={{ marginTop: 'var(--space-2)', width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign in securely →'}
        </Button>
      </form>
    </AuthLayout>
  );
}
