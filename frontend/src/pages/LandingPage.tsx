import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Layers, Radio, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../components/ui';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const stack = [
  'Java 21',
  'Spring Boot 3',
  'TypeScript',
  'MySQL',
  'Redis',
  'Apache Kafka',
  'Docker',
];

const pillars = [
  {
    icon: Zap,
    title: 'Sub-100ms cached reads',
    body: 'SHA-256 Redis idempotency keys and Spring Cache keep hot dashboard endpoints fast under load.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    body: 'JWT auth, Spring Security filters, optimistic locking with @Version, and token-bucket rate limits.',
  },
  {
    icon: Radio,
    title: 'Event-driven workflows',
    body: 'Background analytics, notifications, and audit trails fan out across Kafka topics in KRaft mode.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen text-white font-['Sora',sans-serif] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(6,182,212,0.12),_transparent_45%),linear-gradient(180deg,#07111a_0%,#0a1622_45%,#071018_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Cpath d=%22M0 39.5h40M39.5 0v40%22 stroke=%22%23fff%22 stroke-width=%221%22 fill=%22none%22/%3E%3C/svg%3E')]" />

      <nav className="relative z-10 h-16 sm:h-20 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold text-lg tracking-tight">
            SE
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight">SmartExpense</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-teal-300/80 mt-1">Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onSignIn}>
            Sign in
          </Button>
          <Button size="sm" onClick={onGetStarted}>
            Open platform
          </Button>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center min-h-[calc(100dvh-5rem)]">
        <div className="space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300/90"
          >
            Full-stack fintech platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] text-white"
          >
            SmartExpense
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-lg text-slate-300 max-w-xl leading-relaxed"
          >
            Track spending, enforce budgets, and stream financial events with a Java 21 / Spring Boot backend,
            TypeScript SPA, MySQL, Redis, and Kafka — packaged for Docker.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button size="lg" className="w-full sm:w-auto" onClick={onGetStarted}>
              Launch workspace
              <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={onSignIn}>
              Sign in
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {stack.map((item) => (
              <span
                key={item}
                className="text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-300"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-teal-500/10 blur-3xl" />
          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#0c1824]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="h-11 px-4 flex items-center gap-2 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-[11px] text-slate-400 font-medium">dashboard · live cashflow</span>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Net savings</p>
                <p className="text-4xl font-extrabold tabular-nums mt-1">$7,579.50</p>
                <p className="text-sm text-teal-300 mt-1">+18.4% month over month</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Database size={16} className="text-cyan-300 mb-2" />
                  <p className="text-[11px] text-slate-400">MySQL + Flyway</p>
                  <p className="text-sm font-semibold">Versioned schema</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Layers size={16} className="text-teal-300 mb-2" />
                  <p className="text-[11px] text-slate-400">Redis cache</p>
                  <p className="text-sm font-semibold">&lt;100ms reads</p>
                </div>
              </div>
              <div className="h-24 rounded-2xl border border-white/10 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-transparent flex items-end px-3 pb-3 gap-1">
                {[40, 55, 35, 70, 48, 82, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-teal-400/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-[#071018]/70">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center border border-teal-500/20">
                <Icon size={18} />
              </div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
          Smart Expense Manager — Java 21 · Spring Boot 3 · TypeScript · MySQL · Redis · Kafka · Docker
        </footer>
      </section>
    </div>
  );
};
