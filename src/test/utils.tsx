import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ToastHost } from '../components/Toast';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wraps children in the providers every component in the app relies on.
 *
 * The toast host is rendered as well, so component tests can assert on
 * notifications.
 *
 * @param props Component props.
 * @returns The provider element.
 */
function Providers({ children }: ProvidersProps) {
  return (
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          {children}
          <ToastHost />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

/**
 * Render a component with the app providers and a router.
 *
 * @param ui The element to render.
 * @param options Extra render options.
 * @returns The render result.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  // `userEvent.setup()` installs its own `navigator.clipboard` stub. Keep any
  // clipboard mock that the test installed before rendering.
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  const user = userEvent.setup();

  if (clipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  }

  const result = render(ui, { wrapper: Providers, ...options });
  return { ...result, user };
}
