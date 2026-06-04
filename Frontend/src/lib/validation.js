// Shared form validators (deduped from LoginPage and SignUpPage).
// Each returns an error string, or '' when the value is valid.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (value, { min = 6 } = {}) => {
  if (!value) return 'Password is required';
  if (value.length < min) return `Password must be at least ${min} characters`;
  return '';
};

export const validatePasswordConfirm = (value, original) => {
  if (!value) return 'Please confirm your password';
  if (value !== original) return 'Passwords do not match';
  return '';
};
