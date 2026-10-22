import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthField } from '../components/auth/AuthField';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FirebaseNotice } from '../components/auth/FirebaseNotice';
import { useAuth } from '../hooks/useAuth';
import { MIN_PASSWORD_LENGTH, validateSignUpForm } from '../lib/auth';

/**
 * The registration page (`/register`).
 *
 * @returns The page element.
 */
export function SignUpPage() {
  const { signUp, configured, error } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateSignUpForm({ displayName, email, password, confirmPassword });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await signUp(displayName, email, password);
      navigate('/', { replace: true });
    } catch {
      /* The error is surfaced through the auth context. */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Your secret keys are never stored — only your account profile is."
      footer={
        <span>
          Already registered?{' '}
          <Link to="/login-page" className="text-brand-neon hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      {!configured && <FirebaseNotice />}

      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Display name"
          name="displayName"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          error={fieldErrors.displayName}
          hint="Optional — shown in the admin panel."
        />

        <AuthField
          label="E-mail address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />

        <AuthField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />

        <AuthField
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {error && (
          <p role="alert" className="text-sm text-red-400 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-neon to-brand-accent rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
