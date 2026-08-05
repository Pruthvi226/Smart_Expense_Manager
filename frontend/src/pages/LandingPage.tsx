import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-indigo-500 selection:text-white font-['Outfit',sans-serif]">
      {/* Navigation Header */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl primary-gradient-bg flex items-center justify-center font-bold text-white shadow-lg primary-gradient-glow text-xl">
            S
          </div>
          <span className="font-bold text-lg text-white">SmartExpense</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-bold shadow-lg primary-gradient-glow hover:opacity-95 transition-all"
        >
          Open App Dashboard →
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
          <Sparkles size={14} />
          <span>Enterprise FinTech V2 Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Precision Financial Control for <span className="primary-gradient-text">Modern Engineers</span>
        </h1>

        <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Smart Expense Manager combines Java 21, Spring Boot 3, Redis real-time caching, Kafka event streaming, and AI advisory into a unified FinTech experience.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl primary-gradient-bg text-white text-sm font-bold shadow-xl primary-gradient-glow hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Launch Interactive App</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Hero Dashboard Preview Card */}
        <div className="pt-12">
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-2xl glass-card">
            <div className="h-64 rounded-2xl bg-gradient-to-br from-zinc-900 to-indigo-950/40 p-6 flex flex-col justify-between text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Live Dashboard Stream</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Total Monthly Savings</span>
                <h3 className="text-4xl font-extrabold text-white tabular-nums">$7,579.50</h3>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-zinc-300">
                <span>+18.4% MoM Velocity</span>
                <span>89/100 Financial Health Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12 border-t border-white/5">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Built to Stripe & Engineering Standards</h2>
          <p className="text-xs text-zinc-400">Production features engineered for zero data loss and sub-10ms response times.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Idempotency-Key UUID</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Guarantees zero duplicate transaction writes on network retries or double clicks.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-base text-white">AI Copilot Advisory</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Natural language queries, instant budget predictions, and automated spending anomaly detection.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Optimistic Lock Concurrency</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JPA `@Version` field validation with automated `409 Conflict` HTTP exception mapping.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-zinc-500">
        Smart Expense Manager V2 – Developed with Java 21, Spring Boot 3, MySQL 8 & React 19.
      </footer>
    </div>
  );
};
