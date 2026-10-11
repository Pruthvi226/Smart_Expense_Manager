import React, { lazy, Suspense, useCallback, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { TransactionDrawer } from './components/transactions/TransactionDrawer';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage').then(m => ({ default: m.BudgetsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AiCopilotPage = lazy(() => import('./pages/AiCopilotPage').then(m => ({ default: m.AiCopilotPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(m => ({ default: m.SupportPage })));
const RecoveryPage = lazy(() => import('./pages/RecoveryPage').then(m => ({ default: m.RecoveryPage })));
import { useAppNavigation, type AppTab } from './lib/navigation';
import { isDemoMode } from './services/api';
import type { Expense } from './types';
import { useExpenses } from './context/ExpenseContext';

const AppShell: React.FC = () => {
  const { navigate, currentTab } = useAppNavigation();
  const { loadError, loading, refreshExpenses, refreshBudgets } = useExpenses();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0);

  const setCurrentTab = useCallback(
    (tab: string) => {
      navigate(tab as AppTab);
      setMobileNavOpen(false);
    },
    [navigate],
  );

  const handleAddExpense = () => {
    setDefaultTransactionType('EXPENSE');
    setIsAddModalOpen(true);
  };
  const handleAddIncome = () => {
    setDefaultTransactionType('INCOME');
    setIsAddModalOpen(true);
  };
  const handleTransactionSuccess = () => setTransactionRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-[var(--sem-bg)] text-white flex">
      <a href="#main-content" className="skip-link">Skip to content</a>
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileNavOpen}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <TopNav
          collapsed={sidebarCollapsed}
          openAddModal={handleAddExpense}
          openCommandPalette={() => setIsCommandPaletteOpen(true)}
          openAiCopilot={() => setCurrentTab('ai')}
          toggleNotifications={() => setIsNotifOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {isDemoMode() && <p role="status" className="mb-4 rounded-xl border border-teal-400/30 bg-teal-400/10 p-3 text-sm text-teal-200">Demo workspace · Changes stay in this browser session.</p>}
          {loading && <p role="status" className="mb-4 text-sm text-slate-300">Loading your records…</p>}
          {loadError && <div role="alert" className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
            {loadError} <button className="underline font-semibold ml-2" onClick={() => { void refreshExpenses(); void refreshBudgets(); }}>Try again</button>
          </div>}
          <Suspense fallback={<p role="status" className="p-6 text-slate-300">Loading this page…</p>}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddModal={handleAddExpense}
              onOpenAddIncome={handleAddIncome}
              onOpenAiCopilot={() => setCurrentTab('ai')}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              onNavigate={setCurrentTab}
              refreshKey={transactionRefreshKey}
            />
          )}
          {currentTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={handleAddExpense}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              refreshKey={transactionRefreshKey}
            />
          )}
          {currentTab === 'budgets' && <BudgetsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'ai' && <AiCopilotPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'settings' && <SettingsPage />}
          {currentTab === 'support' && <SupportPage />}
          </Suspense>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        openAiCopilot={() => {
          setCurrentTab('ai');
          setIsCommandPaletteOpen(false);
        }}
        openAddModal={() => {
          handleAddExpense();
          setIsCommandPaletteOpen(false);
        }}
      />

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      <TransactionDrawer
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onDeleted={() => {
          setSelectedExpense(null);
          handleTransactionSuccess();
        }}
        onUpdated={() => {
          setSelectedExpense(null);
          handleTransactionSuccess();
        }}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        defaultType={defaultTransactionType}
      />
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { route, navigate } = useAppNavigation();

  if (route === 'forgot-password' || route === 'reset-password') {
    return <RecoveryPage reset={route === 'reset-password'} onBack={() => navigate('login')} />;
  }

  if (route === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => navigate(isAuthenticated || isDemoMode() ? 'dashboard' : 'login')}
        onSignIn={() => navigate('login')}
      />
    );
  }

  if (!isAuthenticated || route === 'login') {
    return (
      <LoginPage
        onSuccess={() => navigate('dashboard', true)}
        onBack={() => navigate('landing')}
        onForgotPassword={() => navigate('/forgot-password')}
      />
    );
  }

  return <AppShell />;
};

function WorkspaceState() {
  const { user } = useAuth();
  const identity = user ? `${user.id}:${user.email}` : 'signed-out';
  return (
      <NotificationProvider key={identity}>
        <ExpenseProvider>
          <Suspense fallback={<div role="status" className="min-h-screen bg-[var(--sem-bg)] text-slate-200 p-8">Loading your workspace…</div>}>
            <MainAppContent />
          </Suspense>
        </ExpenseProvider>
      </NotificationProvider>
  );
}

export default function App() {
  return <AuthProvider><WorkspaceState /></AuthProvider>;
}
