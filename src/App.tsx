import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { ToastHost } from './components/Toast';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider } from './hooks/useAuth';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignUpPage } from './pages/SignUpPage';

/**
 * Scrolls to the element referenced by the URL fragment, if any.
 *
 * Needed because the content is rendered client-side, so the browser's native
 * fragment handling can run before the target exists.
 *
 * @returns A component that performs the scroll.
 */
function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const target = document.getElementById(id);
    if (target && typeof target.scrollIntoView === 'function') {
      // Let the browser finish painting the freshly mounted content first.
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash, location.pathname]);

  return null;
}

/**
 * The application shell and router.
 *
 * Route map:
 *   /            the TOTP tool
 *   /login-page  sign in
 *   /register    sign up
 *   /admin       administration panel (administrators only)
 *   *            themed 404
 *
 * @returns The app element.
 */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastHost />
      </AuthProvider>
    </ToastProvider>
  );
}
