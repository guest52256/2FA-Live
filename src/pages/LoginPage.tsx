import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthField } from '../components/auth/AuthField';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FirebaseNotice } from '../components/auth/FirebaseNotice';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../lib/auth';

/**
 * The sign-in page (`/login-page`).
 *
 * @returns The page element.
 */
export function LoginPage() {
  const { signIn, configured, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      /* The error is surfaced through the auth context. */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your account and the administration panel."
      footer={
        <span>
          No account yet?{' '}
          <Link to="/register" className="text-brand-neon hover:underline">
            Create one
          </Link>
        </span>
      }
    >
      {!configured && <FirebaseNotice />}

      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
