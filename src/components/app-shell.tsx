import type { PropsWithChildren } from 'react';

/**
 * Native passthrough. The web shell lives in `app-shell.web.tsx`,
 * which Metro resolves automatically on web builds only.
 */
export function AppShell({ children }: PropsWithChildren) {
  return <>{children}</>;
}
