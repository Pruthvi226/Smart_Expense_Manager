import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { AiCopilotDrawer } from './components/ai/AiCopilotDrawer';
import { TransactionDrawer } from './components/transactions/TransactionDrawer';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { AiCopilotPage } from './pages/AiCopilotPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import type { Expense } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'APP' | 'LANDING' | 'LOGIN'>('APP');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0);

  const handleAddExpense = () => {
    setDefaultTransactionType('EXPENSE');
    setIsAddModalOpen(true);
  };
  const handleAddIncome = () => {
    setDefaultTransactionType('INCOME');
    setIsAddModalOpen(true);
  };
  const handleTransactionSuccess = () => {
    setTransactionRefreshKey(k => k + 1);
  };

  if (!isAuthenticated && viewMode === 'APP') {
    return <LoginPage onSuccess={() => setViewMode('APP')} />;
  }

  if (viewMode === 'LANDING') {
    return <LandingPage onGetStarted={() => setViewMode('APP')} />;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        openAiCopilot={() => setCurrentTab('ai')}
      />

      {/* Main Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        {/* Sticky Top Header */}
        <TopNav
          collapsed={sidebarCollapsed}
          openAddModal={handleAddExpense}
          openCommandPalette={() => setIsCommandPaletteOpen(true)}
          openAiCopilot={() => setCurrentTab('ai')}
          toggleNotifications={() => setIsNotifOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 pt-20 px-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddModal={handleAddExpense}
              onOpenAddIncome={handleAddIncome}
              onOpenAiCopilot={() => setCurrentTab('ai')}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              onNavigate={(tab) => setCurrentTab(tab)}
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
        </main>
      </div>

      {/* Overlays & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => { setCurrentTab(tab); setIsCommandPaletteOpen(false); }}
        openAiCopilot={() => { setCurrentTab('ai'); setIsCommandPaletteOpen(false); }}
        openAddModal={() => { handleAddExpense(); setIsCommandPaletteOpen(false); }}
      />

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <AiCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
      />

      <TransactionDrawer
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onDeleted={() => { setSelectedExpense(null); handleTransactionSuccess(); }}
        onUpdated={() => { setSelectedExpense(null); handleTransactionSuccess(); }}
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

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ExpenseProvider>
          <MainAppContent />
        </ExpenseProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
