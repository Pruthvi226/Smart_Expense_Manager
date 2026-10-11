import { useCallback, useSyncExternalStore } from 'react';

export type AppTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'ai'
  | 'reports'
  | 'settings'
  | 'support';

export type AppRoute = 'landing' | 'login' | 'forgot-password' | 'reset-password' | AppTab;

const TAB_PATHS: Record<AppTab, string> = {
  dashboard: '/app',
  transactions: '/app/transactions',
  budgets: '/app/budgets',
  analytics: '/app/analytics',
  ai: '/app/ai',
  reports: '/app/reports',
  settings: '/app/settings',
  support: '/app/support',
};

const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as AppTab]),
) as Record<string, AppTab>;

function parsePath(pathname: string): AppRoute {
  if (pathname === '/' || pathname === '') return 'landing';
  if (pathname === '/login' || pathname === '/register') return 'login';
  if (pathname === '/forgot-password') return 'forgot-password';
  if (pathname === '/reset-password') return 'reset-password';
  if (PATH_TO_TAB[pathname]) return PATH_TO_TAB[pathname];
  if (pathname.startsWith('/app')) return 'dashboard';
  return 'landing';
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

function getSnapshot() {
  return window.location.pathname;
}

export function useAppNavigation() {
  const pathname = useSyncExternalStore(subscribe, getSnapshot, () => '/');
  const route = parsePath(pathname);

  const navigate = useCallback((to: AppRoute | string, replace = false) => {
    const path =
      to === 'landing'
        ? '/'
        : to === 'login'
          ? '/login'
          : to in TAB_PATHS
            ? TAB_PATHS[to as AppTab]
            : to;

    const next = `${path}${window.location.search}`;
    if (`${window.location.pathname}${window.location.search}` === next) return;
    if (replace) window.history.replaceState({}, '', next);
    else window.history.pushState({}, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const currentTab: AppTab = route in TAB_PATHS ? route as AppTab : 'dashboard';

  return { route, currentTab, pathname, navigate };
}
