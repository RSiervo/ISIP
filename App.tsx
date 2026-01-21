
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AppView } from './types';
import Layout from './components/Layout';
import SuggestionForm from './components/SuggestionForm';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import TrackingView from './components/TrackingView';
import { storageService } from './services/storageService';

const ROTATING_MESSAGES = [
  "Next-Gen Corporate Innovation",
  "Unlocking Collective Potential",
  "Continuous Process Evolution",
  "Data-Driven Shared Success",
  "Scaling Employee Impact",
  "Bridging Ideas & Execution"
];

const LOGIN_LOADING_MESSAGES = [
  "Logging in Please wait...",
  "Verifying biometric hash...",
  "Syncing with OCD Neural Link...",
  "Authorizing core access...",
  "Loading strategic portfolio...",
  "Establishing secure session...",
  "Finalizing command link..."
];

const AnimatedCounter: React.FC<{ target: number; duration?: number; loop?: boolean }> = ({ target, duration = 8000, loop = true }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      
      if (loop) {
        const progress = (elapsed % duration) / duration;
        setCount(Math.floor(progress * (target + 1)));
      } else {
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(progress * target));
      }
      
      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [target, duration, loop]);

  return <>{Math.min(count, target)}</>;
};

const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LandingPage: React.FC<{ 
  onNavigateSubmission: () => void, 
  onNavigateTracking: () => void,
  platformStats: { total: number, implemented: number },
  messageIndex: number
}> = ({ onNavigateSubmission, onNavigateTracking, platformStats, messageIndex }) => {
  
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-white/80 dark:bg-slate-900/90 border-blue-200/60 text-blue-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-blue-500 hover:border-blue-400 dark:hover:border-blue-500/30 hover:shadow-blue-500/10';
      case 'emerald': return 'bg-white/80 dark:bg-slate-900/90 border-emerald-200/60 text-emerald-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-emerald-500 hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:shadow-emerald-500/10';
      case 'indigo': return 'bg-white/80 dark:bg-slate-900/90 border-indigo-200/60 text-indigo-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-500/30 hover:shadow-indigo-500/10';
      case 'amber': return 'bg-white/80 dark:bg-slate-900/90 border-amber-200/60 text-amber-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-amber-500 hover:border-amber-400 dark:hover:border-amber-500/30 hover:shadow-amber-500/10';
      case 'rose': return 'bg-white/80 dark:bg-slate-900/90 border-rose-200/60 text-rose-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-rose-500 hover:border-rose-400 dark:hover:border-blue-500/30 hover:shadow-rose-500/10';
      case 'cyan': return 'bg-white/80 dark:bg-slate-900/90 border-cyan-200/60 text-cyan-700 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 dark:text-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-500/30 hover:shadow-cyan-500/10';
      default: return 'bg-white/80 border-slate-100 text-blue-600 dark:bg-slate-900 dark:border-slate-800';
    }
  };

  const getIconColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-white text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 border-blue-200 dark:border-blue-500/10 shadow-sm';
      case 'emerald': return 'bg-white text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/10 shadow-sm';
      case 'indigo': return 'bg-white text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500 border-indigo-200 dark:border-indigo-500/10 shadow-sm';
      case 'amber': return 'bg-white text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 border-amber-200 dark:border-amber-500/10 shadow-sm';
      case 'rose': return 'bg-white text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 border-rose-200 dark:border-rose-500/10 shadow-sm';
      case 'cyan': return 'bg-white text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-500 border-cyan-200 dark:border-cyan-500/10 shadow-sm';
      default: return 'bg-blue-500/10 text-blue-600';
    }
  };

  const getHeadingColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'text-blue-900 dark:text-white';
      case 'emerald': return 'text-emerald-900 dark:text-white';
      case 'indigo': return 'text-indigo-900 dark:text-white';
      case 'amber': return 'text-amber-900 dark:text-white';
      case 'rose': return 'text-rose-900 dark:text-white';
      case 'cyan': return 'text-cyan-900 dark:text-white';
      default: return 'text-slate-900 dark:text-white';
    }
  };

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* Hero Section - Snapped to header */}
      <section className="relative pt-12 lg:pt-24 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -mr-64 -mt-32 dark:hidden"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] -ml-32 -mb-32 dark:hidden"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          <div className="lg:w-3/5 space-y-6 lg:space-y-8 text-center lg:text-left">
            <ScrollReveal>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] overflow-hidden min-w-[280px] justify-center lg:justify-start">
                <div key={messageIndex} className="animate-slide-left">
                  {ROTATING_MESSAGES[messageIndex]}
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={100}>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter">
                Ideas that Scale <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400">
                  Impact & Productivity
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <div className="space-y-4 max-w-2xl mx-auto lg:mx-0">
                <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg font-medium leading-relaxed">
                  I.S.I.P. is TIM’s enterprise suggestion and improvement system, managed by the <span className="text-blue-600 dark:text-blue-400 font-bold">Organizational Capability & Design (OCD)</span> team.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg font-medium leading-relaxed">
                  A space to share ideas that improve productivity, efficiency, quality, customer experience, or ways of working.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <button 
                  onClick={onNavigateSubmission}
                  className="flex-1 sm:flex-none group relative px-4 sm:px-10 py-4 sm:py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(37,99,235,0.25)] active:scale-95 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                  <span className="relative flex items-center justify-center">
                    Submit Idea
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </button>
                
                <button 
                  onClick={onNavigateTracking}
                  className="flex-1 sm:flex-none px-4 sm:px-8 py-4 sm:py-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-800 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                >
                  Track Ideas
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="flex items-center justify-center lg:justify-start space-x-10 pt-6 border-t border-slate-200 dark:border-slate-900">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{platformStats.total}</p>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Total Submissions</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{platformStats.implemented}</p>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Live Solutions</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:w-2/5 relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white dark:border-slate-800 p-8 lg:p-10 rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-all duration-1000 group animate-float border-slate-100">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-all duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Efficiency Yield</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      <AnimatedCounter target={100} duration={8000} loop={true} />%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-grow-width origin-left relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "Ideas don’t need to be perfect, clarity matters more than polish."
                  </p>
                  <div className="mt-3 flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider">OCD Team</p>
                      <p className="text-[7px] text-slate-400 dark:text-slate-600 uppercase">Innovation Stewards</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-around pt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Idea Tracking Features */}
      <section className="relative py-24 px-4 bg-slate-900 dark:bg-slate-950 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -ml-64 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Transparency Node</h2>
                <p className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-none">Track Every Movement</p>
                <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
                  Every submission to ISIP is a live entity. Use our decentralized tracking system to watch your proposal evolve from a raw concept to a pilot program.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Token Based", val: "Secure ID Tracking", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
                  { label: "Status Mapping", val: "Real-time Lifecycle", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }
                ].map((feat, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={feat.icon} /></svg>
                    </div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{feat.label}</p>
                    <p className="text-sm font-black text-white">{feat.val}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200} className="relative h-[400px] bg-slate-800 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 opacity-40"></div>
               <div className="h-full w-full rounded-[2.9rem] bg-slate-900 flex flex-col p-10 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Console</span>
                     </div>
                     <div className="px-3 py-1 bg-blue-600/20 rounded-lg text-[8px] font-black text-blue-400 uppercase">Live Sync</div>
                  </div>
                  <div className="space-y-6">
                     <div className="h-px w-full bg-white/5"></div>
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target ID</span>
                        <span className="text-xs font-mono font-black text-blue-400">ISIP-7X29K1</span>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pilot Readiness</span>
                           <span className="text-sm font-black text-white">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full w-[85%] bg-blue-500"></div>
                        </div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Latest Event</p>
                        <p className="text-[10px] text-slate-300 font-bold">Assigned to Technology Architecture Unit for feasibility study.</p>
                     </div>
                  </div>
                  <div className="mt-auto">
                     <button onClick={onNavigateTracking} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] active:scale-95 transition-all">Launch Tracker</button>
                  </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trusted Indicators */}
      <section className="bg-slate-50 dark:bg-slate-950 py-12 px-4 border-y border-slate-100 dark:border-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto opacity-40 flex flex-wrap justify-center items-center gap-12 sm:gap-20">
          {["Managed Services", "Cloud Platforms", "Digital GRC", "Cybersecurity", "Network Strategy"].map((unit) => (
            <div key={unit} className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 select-none whitespace-nowrap">
              {unit}
            </div>
          ))}
        </div>
      </section>

      {/* Innovation Lifecycle Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.5em]">Process Flow</h2>
            <p className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">The Innovation Lifecycle</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl mx-auto">From a raw concept to enterprise-wide implementation. We've built a streamlined path for every employee's contribution.</p>
          </ScrollReveal>

          <div className="relative">
            {/* Desktop Path SVG */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-900 -translate-y-1/2 hidden lg:block pointer-events-none">
              <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 w-full opacity-20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 relative z-10">
              {[
                { step: "01", title: "Discovery", desc: "Identify a friction point or efficiency gap in daily operations.", icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-8.212-4.33l.054-.09A10.003 10.003 0 0112 21z", color: "blue" },
                { step: "02", title: "Submission", desc: "Document your solution through the ISIP portal and get a unique ID.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", color: "emerald" },
                { step: "03", title: "Assessment", desc: "The OCD team and AI agents evaluate feasibility and strategic fit.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "indigo" },
                { step: "04", title: "Pilot", desc: "Successful ideas are moved into controlled testing and validation.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-1.778.417H7.5a2 2 0 01-2-2V10a2 2 0 012-2h1.5a2 2 0 012-2h1.5a2 2 0 002-2V4.5a2 2 0 114 0V6a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 01-2 2h-1.572", color: "amber" },
                { step: "05", title: "Scaling", desc: "Approved pilots are integrated into TIM's enterprise standard.", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "rose" }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 100} className="relative">
                  <div className="flex flex-col items-center text-center group">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 relative z-10`}>
                      <span className="absolute -top-3 -right-3 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black tracking-widest">{item.step}</span>
                      <svg className={`w-7 h-7 sm:w-9 sm:h-9 ${i === 0 ? 'text-blue-500' : i === 1 ? 'text-emerald-500' : i === 2 ? 'text-indigo-500' : i === 3 ? 'text-amber-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Pulse Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 dark:hidden"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.5em]">Live Platform Activity</h2>
                <p className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">The Innovation Pulse</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
                  See how different departments are contributing to the growth of TIM. Our AI categorization helps identify key trends in operational efficiency.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Trending Node", val: "IT Strategy", color: "blue" },
                  { label: "High Yield", val: "Process Ops", color: "emerald" },
                  { label: "Top Category", val: "Productivity", color: "indigo" },
                  { label: "Active Cycle", val: "Q1 Launch", color: "amber" }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-sm font-black text-slate-900 dark:text-white`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200} className="relative h-[400px] bg-slate-100 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-1 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-emerald-600/5 group-hover:opacity-100 transition-opacity"></div>
               <div className="h-full w-full rounded-[2.9rem] bg-white dark:bg-slate-950 flex flex-col p-8 space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Stream</span>
                     </div>
                     <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Live Updates</span>
                  </div>
                  <div className="space-y-4">
                     {[
                       { user: "Tech Solutions", action: "submitted a Productivity idea", time: "2m ago" },
                       { user: "Marketing", action: "idea reached Pilot stage", time: "15m ago" },
                       { user: "Operations", action: "implemented Quality fix", time: "1h ago" },
                       { user: "GRC", action: "submitted 3 new capabilities", time: "3h ago" }
                     ].map((log, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-up" style={{animationDelay: `${i*150}ms`}}>
                         <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{log.user}</span>
                           <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase">{log.action}</span>
                         </div>
                         <span className="text-[8px] font-black text-slate-400 uppercase">{log.time}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The OCD Team Section */}
      <section className="relative py-24 px-4 bg-white dark:bg-slate-950 transition-colors duration-500 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.5em]">The People Behind ISIP</h2>
            <p className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">The OCD Team</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl mx-auto">Meet the strategic stewards dedicated to transforming your ideas into organizational reality.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            {[
              { 
                name: "Jas Faith Negru", 
                role: "Organizational Capability & Design", 
                bio: "Driving strategic innovation and fostering a culture of excellence within TIM. Jas leads the OCD mission to bridge the gap between employee insights and enterprise-wide execution with a focus on high-impact cultural shifts.", 
                initials: "JN",
                gradient: "from-blue-500 to-indigo-600",
                img: "jas.png"
              },
              { 
                name: "Ivy Cua", 
                role: "Organizational Capability & Design", 
                bio: "Expert in process optimization and innovation scaling. Ivy ensures every submission is rigorously assessed and mapped to our strategic productivity pillars, transforming raw concepts into validated pilot programs.", 
                initials: "IC",
                gradient: "from-emerald-500 to-teal-600",
                img: "ivy.png"
              }
            ].map((member, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="group bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-500 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border-4 border-white dark:border-slate-700 shadow-lg group-hover:scale-105 transition-transform duration-500 relative">
                     <img 
                        src={member.img} 
                        alt={member.name} 
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                     />
                     <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${member.gradient} text-white shadow-inner`}>
                        <span className="text-4xl font-black tracking-tighter">{member.initials}</span>
                     </div>
                  </div>
                  <div className="space-y-4 text-center sm:text-left">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">{member.role}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex justify-center sm:justify-start pt-2">
                      <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                        Innovation Steward
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-12 space-y-3">
            <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.5em]">The I.S.I.P. Framework</h2>
            <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Focus Areas for Innovation</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "Productivity", desc: "Reduce redundant tasks and manual intervention through smarter workflows.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "blue" },
              { title: "Quality", desc: "Eliminate errors at the source and improve our final output for stakeholders.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z", color: "emerald" },
              { title: "Experience", desc: "Enhance how employees work and how customers perceive TIM services.", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "indigo" },
              { title: "Efficiency", desc: "Optimization of resource allocation and time management across units.", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "amber" },
              { title: "Capability", desc: "Ideas that help our teams learn, adapt, and master new skills faster.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "rose" },
              { title: "Ways of Working", desc: "Cultural and collaborative shifts that make us more agile and connected.", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z", color: "cyan" }
            ].map((pillar, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`group ${getColorClasses(pillar.color)} border p-8 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl card-hover h-full flex flex-col relative overflow-hidden backdrop-blur-md`}>
                  <div className={`w-12 h-12 ${getIconColorClasses(pillar.color)} rounded-xl flex items-center justify-center mb-6 border group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <h3 className={`text-xl font-black mb-3 ${getHeadingColorClasses(pillar.color)} transition-colors`}>{pillar.title}</h3>
                  <p className={`text-slate-600 dark:text-slate-500 text-xs font-bold leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors`}>
                    {pillar.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.5em]">Information Hub</h2>
            <p className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Common Questions</p>
          </ScrollReveal>
          
          <div className="space-y-4">
            {[
              { q: "Who can submit suggestions to ISIP?", a: "All active employees of Total Information Management Corp. (TIM) across all departments and levels are encouraged to submit ideas." },
              { q: "Are submissions really anonymous?", a: "Yes. If you select the 'Submit Anonymously' option, your name and profile data are stripped from the record before it reaches the review board." },
              { q: "How long does the review process take?", a: "The OCD team typically performs an initial assessment within 14 business days. You can track your idea's status in real-time using your reference token." },
              { q: "What happens if my idea is implemented?", a: "Implemented ideas are recognized as strategic successes. Authors (unless anonymous) are acknowledged as innovation leaders and may be eligible for performance indexing rewards." }
            ].map((faq, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className={`border rounded-[2rem] overflow-hidden transition-all duration-500 ${activeFaq === i ? 'bg-white dark:bg-slate-900 border-blue-500/30 shadow-xl' : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'}`}>
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                  >
                    <span className={`text-[11px] sm:text-sm font-black uppercase tracking-widest ${activeFaq === i ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {faq.q}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${activeFaq === i ? 'rotate-180 text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="relative py-24 px-4 bg-white dark:bg-slate-950 transition-colors duration-500">
        <ScrollReveal className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 lg:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter relative z-10">
              Ready to shape the <br className="hidden lg:block"/> future of TIM?
            </h2>
            <p className="text-blue-100/70 text-base lg:text-lg font-medium max-w-2xl mx-auto relative z-10">
              Every submission is reviewed by the Organizational Capability & Design team. 
              No idea is too small to start a movement.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onNavigateSubmission}
                className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-xl"
              >
                Submit Idea
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [view, setView] = useState<AppView>('LANDING');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [platformStats, setPlatformStats] = useState({ total: 0, implemented: 0 });
  const [messageIndex, setMessageIndex] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [globalNotification, setGlobalNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [loginLogoError, setLoginLogoError] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stats = storageService.getStats();
    setPlatformStats({
      total: stats.total,
      implemented: stats.byStatus.Implemented
    });
  }, [view]);

  useEffect(() => {
    if (view === 'LANDING') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view]);

  useEffect(() => {
    let interval: number | undefined;
    if (isLoginSuccess) {
      interval = window.setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % LOGIN_LOADING_MESSAGES.length);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isLoginSuccess]);

  // Auto-hide toast
  useEffect(() => {
    if (globalNotification) {
      const timer = setTimeout(() => setGlobalNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalNotification]);

  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button')) return;
      if (currentRole === UserRole.EMPLOYEE) {
        setShowLoginModal(true);
      }
    };
    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [currentRole]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storageService.getUsers();
    const found = users.find(u => u.username === username && u.password === password);

    if (found) {
      setError('');
      setIsLoginSuccess(true);
      storageService.updateUserLogin(username);
      setTimeout(() => {
        setCurrentRole(UserRole.ADMIN);
        setView('ADMIN');
        setShowLoginModal(false);
        setIsLoginSuccess(false);
        setGlobalNotification({ message: 'Login successful. Authorized access granted.', type: 'success' });
      }, 2500);
    } else {
      setError('Invalid authorization credentials.');
    }
  };

  const handleExitConsole = () => {
    setCurrentRole(UserRole.EMPLOYEE);
    setView('LANDING');
    setUsername('');
    setPassword('');
    setGlobalNotification({ message: 'Logout successful. Secure session terminated.', type: 'info' });
  };

  return (
    <Layout 
      role={currentRole} 
      onRoleToggle={handleExitConsole} 
      onNavigateHome={() => setView('LANDING')}
      onNavigateSettings={() => setView('USER_MANAGEMENT')}
    >
      <div className={view === 'LANDING' ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'}>
        {/* Global Notification Banner */}
        {globalNotification && (
          <div className="fixed top-4 inset-x-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 z-[200] animate-fade-in">
            <div className={`flex items-center space-x-4 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex-nowrap ${globalNotification.type === 'success' ? 'bg-emerald-500/95 border-emerald-400 text-white' : 'bg-blue-600/95 border-blue-400 text-white'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {globalNotification.type === 'success' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-tight break-words text-center sm:text-left">
                  {globalNotification.message}
                </p>
              </div>
              <button onClick={() => setGlobalNotification(null)} className="text-white/60 hover:text-white transition-colors flex-shrink-0 ml-2 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {view === 'LANDING' && (
          <LandingPage 
            onNavigateSubmission={() => setView('SUBMISSION')} 
            onNavigateTracking={() => setView('TRACKING')}
            platformStats={platformStats}
            messageIndex={messageIndex}
          />
        )}
        {view === 'SUBMISSION' && <SuggestionForm onCancel={() => setView('LANDING')} />}
        {view === 'TRACKING' && <TrackingView onBack={() => setView('LANDING')} />}
        {view === 'ADMIN' && <AdminDashboard onLogout={handleExitConsole} />}
        {view === 'USER_MANAGEMENT' && <UserManagement onBack={() => setView('ADMIN')} />}
      </div>

      {/* Success full-screen loading overlay */}
      {isLoginSuccess && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="text-center space-y-8 sm:space-y-10 w-full max-w-xs">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] opacity-20"></div>
              <div className="absolute inset-0 border-t-4 border-blue-500 rounded-[1.5rem] sm:rounded-[2rem] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Authorization</p>
              <div className="h-1 w-32 sm:w-48 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 animate-grow-width"></div>
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] h-4">
                {LOGIN_LOADING_MESSAGES[loadingTextIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && !isLoginSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[3rem] p-1 w-full max-w-md border border-white/40 dark:border-slate-800/50 relative shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 pointer-events-none"></div>
            
            <div className="bg-transparent rounded-[2.9rem] p-10 relative z-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border border-white/50 dark:border-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
                  {!loginLogoError ? (
                    <img 
                      src="logo.png" 
                      alt="ISIP Logo" 
                      className="w-14 h-14 object-contain"
                      onError={() => setLoginLogoError(true)}
                    />
                  ) : (
                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">ISIP SECURITY</h3>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.4em] mt-2">OCD Restricted Access</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest ml-4">USERNAME</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Username" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      className="w-full px-6 py-4 bg-white/40 dark:bg-slate-950/30 border border-white/40 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all text-sm backdrop-blur-md" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest ml-4">PASSWORD</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      placeholder="Enter Password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full px-6 py-4 bg-white/40 dark:bg-slate-950/30 border border-white/40 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all text-sm backdrop-blur-md" 
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 justify-center py-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                  </div>
                )}

                <div className="pt-4">
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="flex-1 py-5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center"
                    >
                      <span>LOGIN</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
