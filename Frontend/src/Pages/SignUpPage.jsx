import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword, validatePasswordConfirm } from '../lib/validation';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Icon3D from '../components/ui/Icon3D';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const validateAll = () => {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirm(confirm, password),
    };
    setErrors(next);
    return !next.email && !next.password && !next.confirm;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.post(ENDPOINTS.SIGNUP, { email, password }, { auth: false });
      toast.success('Account created! Please sign in.');
      navigate(ROUTES.LOGIN, { state: { signedUp: true } });
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eye = (shown, toggle) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}
    >
      <Icon3D code={shown ? '🙈' : '👁'} size={17} />
    </button>
  );

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start your smart study journey for free"
      footer={
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSignUp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: validateEmail(e.target.value) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={password}
          error={errors.password}
          rightAdornment={eye(showPassword, () => setShowPassword((s) => !s))}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: validatePassword(e.target.value) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
        />
        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirm}
          error={errors.confirm}
          rightAdornment={eye(showConfirm, () => setShowConfirm((s) => !s))}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm) setErrors((p) => ({ ...p, confirm: validatePasswordConfirm(e.target.value, password) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, confirm: validatePasswordConfirm(confirm, password) }))}
        />
        <Button type="submit" size="lg" loading={loading} style={{ marginTop: 'var(--space-2)', width: '100%' }}>
          {loading ? 'Creating account…' : 'Create free account →'}
        </Button>
      </form>
    </AuthLayout>
  );
}
