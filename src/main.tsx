import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

/**
 * Restore the URL that GitHub Pages' `404.html` fallback stashed away.
 *
 * GitHub Pages cannot rewrite unknown paths to `index.html`, so the fallback
 * page stores the requested URL in `sessionStorage` and redirects here. This
 * restores it before the router reads the current location.
 */
function restoreSpaRedirect(): void {
  try {
    const target = window.sessionStorage.getItem('spa-redirect');
    if (!target) return;
    window.sessionStorage.removeItem('spa-redirect');
    window.history.replaceState(null, '', target);
  } catch {
    /* Private mode or disabled storage — the app still works. */
  }
}

restoreSpaRedirect();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root was not found in index.html.');
}

createRoot(container).render(
  <StrictMode>
    {/* `basename` makes the router work when the app is served from a
        sub-path, e.g. https://<user>.github.io/<repo>/ on GitHub Pages. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
