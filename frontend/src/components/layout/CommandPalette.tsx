import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Receipt, PieChart, BarChart3, Sparkles, X, CornerDownLeft,
  LayoutDashboard, FileText, Settings, HelpCircle, Plus
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  openAiCopilot: () => void;
  openAddModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  openAiCopilot,
  openAddModal,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const actions = [
    { id: 'add',        label: 'Create New Expense / Income',        icon: Plus,            category: 'Actions',      run: () => { openAddModal(); } },
    { id: 'ai',         label: 'Ask AI Copilot for Financial Insight', icon: Sparkles,      category: 'AI Assistant', run: () => { openAiCopilot(); } },
    { id: 'dashboard',  label: 'Go to Overview Dashboard',           icon: LayoutDashboard,  category: 'Navigation',   run: () => { onSelectTab('dashboard'); } },
    { id: 'trans',      label: 'View All Transactions & Expenses',   icon: Receipt,          category: 'Navigation',   run: () => { onSelectTab('transactions'); } },
    { id: 'budgets',    label: 'Manage Category Budgets',            icon: PieChart,         category: 'Navigation',   run: () => { onSelectTab('budgets'); } },
    { id: 'analytics',  label: 'Open Analytics & Visual Charts',     icon: BarChart3,        category: 'Navigation',   run: () => { onSelectTab('analytics'); } },
    { id: 'reports',    label: 'Generate & View Reports',            icon: FileText,         category: 'Navigation',   run: () => { onSelectTab('reports'); } },
    { id: 'settings',   label: 'Manage Application Settings',        icon: Settings,         category: 'Navigation',   run: () => { onSelectTab('settings'); } },
    { id: 'support',    label: 'Help Center & Support',              icon: HelpCircle,       category: 'Navigation',   run: () => { onSelectTab('support'); } },
    { id: 'ai-page',    label: 'Open Full AI Copilot Page',          icon: Sparkles,         category: 'Navigation',   run: () => { onSelectTab('ai'); } },
  ];

  const filtered = query.trim() === ''
    ? actions
    : actions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase()) ||
        a.id.includes(query.toLowerCase())
      );

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard: Ctrl+K toggle, Escape close, Arrow keys nav, Enter execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
        // Note: opening is handled by TopNav → setIsCommandPaletteOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        filtered[activeIndex].run();
        onClose();
      }
    }
  }, [filtered, activeIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInScale 0.15s ease-out' }}
      >
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search size={18} className="text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. 'Add expense', 'Budgets', 'AI')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={filtered[activeIndex]?.id}
          />
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg" aria-label="Close palette">
            <X size={16} />
          </button>
        </div>

        {/* Action List */}
        <div
          id="command-list"
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 space-y-0.5"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group text-left ${
                    isActive
                      ? 'bg-indigo-600/15 text-white border border-indigo-500/30'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 group-hover:bg-indigo-600/20 group-hover:text-indigo-400'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-indigo-400">
                    {isActive && (
                      <>
                        <span>Execute</span>
                        <CornerDownLeft size={12} />
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-300">↑↓</kbd></span>
            <span>Execute: <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-300">↵</kbd></span>
          </div>
          <span>Close: <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-300">ESC</kbd></span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
