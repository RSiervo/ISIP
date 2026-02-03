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
  const [pulseEvents, setPulseEvents] = useState<any[]>([]);

  useEffect(() => {
    const refreshPulse = () => {
      const allIdeas = storageService.getIdeas();
      const events: any[] = [];
      const now = new Date().getTime();

      allIdeas.forEach(i => {
        events.push({
          user: i.isAnonymous ? `Anonymous @ ${i.department}` : `${i.name} @ ${i.department}`,
          action: `Submitted idea: ${i.title}`,
          rawTime: new Date(i.timestamp).getTime()
        });

        if (i.lastUpdated && Math.abs(new Date(i.lastUpdated).getTime() - new Date(i.timestamp).getTime()) > 2000) {
          events.push({
            user: "OCD Admin",
            action: `Set status of "${i.title}" to ${i.status}`,
            rawTime: new Date(i.lastUpdated).toISOString() === i.lastUpdated ? new Date(i.lastUpdated).getTime() : now
          });
        }
      });

      const sorted = events
        .sort((a, b) => b.rawTime - a.rawTime)
        .slice(0, 4)
        .map(e => {
          const seconds = Math.floor((now - e.rawTime) / 1000);
          let timeStr = 'just now';
          if (seconds >= 60) {
            const mins = Math.floor(seconds / 60);
            if (mins < 60) timeStr = `${mins}m ago`;
            else {
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) timeStr = `${hrs}h ago`;
              else timeStr = `${Math.floor(hrs / 24)}d ago`;
            }
          }
          return { ...e, time: timeStr };
        });

      setPulseEvents(sorted);
    };

    refreshPulse();
    const interval = setInterval(refreshPulse, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Premium Centered Single-Screen Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-4 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F0F7FF] dark:bg-slate-950 transition-colors duration-500">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[160px] dark:opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/15 rounded-full blur-[140px] dark:opacity-20 pointer-events-none"></div>
        
        {/* Abstract Shapes - Inspired by UI reference */}
        <div className="absolute top-[20%] left-[10%] w-24 h-6 bg-blue-600/30 rounded-full rotate-[-15deg] blur-[2px] hidden lg:block animate-float-slow"></div>
        <div className="absolute top-[35%] right-[15%] w-32 h-8 bg-indigo-600/20 rounded-full rotate-[25deg] blur-[1px] hidden lg:block animate-float"></div>
        <div className="absolute bottom-[25%] left-[15%] w-16 h-16 bg-blue-500/10 rounded-3xl rotate-[12deg] blur-[2px] hidden lg:block animate-pulse-slow"></div>
        <div className="absolute bottom-[40%] right-[10%] w-40 h-10 bg-emerald-500/10 rounded-full rotate-[-10deg] blur-[3px] hidden lg:block animate-float-slow"></div>
        
        {/* Subtle Grid / Lines */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
        <div className="absolute top-[45%] left-0 w-full h-[1px] bg-blue-500/10 hidden lg:block"></div>
        <div className="absolute top-0 left-[30%] w-[1px] h-full bg-blue-500/5 hidden lg:block"></div>

        <div className="max-w-6xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 flex flex-col items-center">
          
          <ScrollReveal className="flex justify-center">
            <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-blue-600 text-white dark:bg-blue-600 dark:text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 border border-blue-400/30 overflow-hidden min-w-[280px] justify-center backdrop-blur-md">
              <div key={messageIndex} className="animate-slide-left">
                {ROTATING_MESSAGES[messageIndex]}
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100} className="w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter drop-shadow-sm">
              Ideas that Scale <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 inline-block whitespace-nowrap pb-2">
                Impact & Productivity
              </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="space-y-4 max-w-none mx-auto px-4">
              <p className="text-slate-600 dark:text-slate-400 text-[14px] font-medium leading-tight">
                I.S.I.P. is TIM’s enterprise suggestion and improvement system, managed by the <br /> 
                <span className="text-blue-600 dark:text-blue-400 font-extrabold border-b-2 border-blue-500/30">Organizational Capability & Design</span> team.
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm sm:text-base lg:text-lg font-bold leading-relaxed italic opacity-90">
                A unified platform for continuous process evolution and shared corporate success.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 px-4">
              <button 
                onClick={onNavigateSubmission}
                className="w-full sm:w-auto group relative px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] active:scale-95 transition-all overflow-hidden border border-blue-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative flex items-center justify-center">
                  SUBMIT SUGGESTION
                  <div className="ml-3 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </span>
              </button>
              
              <button 
                onClick={onNavigateTracking}
                className="w-full sm:w-auto px-12 py-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] border-2 border-slate-200 dark:border-slate-800 active:scale-95 transition-all shadow-xl whitespace-nowrap flex items-center justify-center group"
              >
                TRACK MOVEMENT
                <svg className="w-5 h-5 ml-3 text-blue-600 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400} className="w-full max-w-3xl pt-8 sm:pt-12">
            <div className="flex items-center justify-center space-x-12 sm:space-x-24 py-6 border-t border-slate-300/30 dark:border-slate-800/50">
              <div className="text-center group">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-500 tabular-nums">{platformStats.total}</p>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.4em] mt-2">Total Submissions</p>
              </div>
              <div className="w-px h-16 bg-slate-300/30 dark:bg-slate-800"></div>
              <div className="text-center group">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-600 dark:text-emerald-500 group-hover:scale-110 transition-transform duration-500 tabular-nums">{platformStats.implemented}</p>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.4em] mt-2">Live Solutions</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Subtle Bottom Glow for Transition */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none"></div>
      </section>

      {/* Aesthetic Efficiency Yield Section */}
      <section className="relative py-24 px-4 bg-white dark:bg-slate-950 overflow-hidden border-y border-slate-100 dark:border-slate-900">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal className="space-y-4">
                <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.6em]">System Performance</h2>
                <p className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Enterprise Impact Yield</p>
                <p className="text-slate-600 dark:text-slate-400 text-base font-medium leading-relaxed">
                  Our innovation engine translates raw employee feedback into measurable organizational value. This metric represents the cumulative efficiency gain projected across all active pilots and implemented solutions.
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={100} className="flex gap-4">
                <div className="px-6 py-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
                  <p className="text-2xl font-black text-blue-600">92%</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Resource Alignment</p>
                </div>
                <div className="px-6 py-4 bg-emerald-600/5 rounded-2xl border border-emerald-600/10">
                  <p className="text-2xl font-black text-emerald-600">8.4x</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Innovation Velocity</p>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <ScrollReveal delay={200} className="relative group">
                <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-16 rounded-[4rem] shadow-2xl overflow-hidden border-slate-100">
                  <div className="absolute top-0 right-0 p-8">
                    <svg className="w-12 h-12 text-blue-600/10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="space-y-4 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Current Cumulative Yield</p>
                      <div className="text-7xl lg:text-9xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        <AnimatedCounter target={100} duration={8000} loop={true} />%
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 animate-grow-width origin-left relative rounded-full">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>Baseline Efficiency</span>
                        <span className="text-blue-600">Optimal Performance Reached</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
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
                { step: "01", title: "Discovery", desc: "Identify a friction point or efficiency gap in daily operations.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "blue" },
                { step: "02", title: "Submission", desc: "Document your solution through the ISIP portal and get a unique ID.", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8", color: "emerald" },
                { step: "03", title: "Assessment", desc: "The OCD team and AI agents evaluate feasibility and strategic fit.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "indigo" },
                { step: "04", title: "Pilot", desc: "Successful ideas are moved into controlled testing and validation.", icon: "M9.75 3.104v1.244c0 .552-.448 1-1 1s-1-.448-1-1V3.104C5.352 3.554 3.75 5.59 3.75 8c0 3.107 2.518 5.625 5.625 5.625S15 11.107 15 8c0-2.41-1.602-4.446-4-4.896V4.348c0 .552-.448 1-1 1s-1-.448-1-1V3.104zM10.5 1.5h-2a.75.75 0 000 1.5h2a.75.75 0 000-1.5z", color: "amber" },
                { step: "05", title: "Scaling", desc: "Approved pilots are integrated into TIM's enterprise standard.", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", color: "rose" }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 100} className="relative">
                  <div className="flex flex-col items-center text-center group">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 relative z-10`}>
                      <span className="absolute -top-3 -right-3 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black tracking-widest">{item.step}</span>
                      <svg className={`w-7 h-7 sm:w-9 sm:h-9 ${i === 0 ? 'text-blue-500' : i === 1 ? 'text-emerald-500' : i === 2 ? 'text-indigo-500' : i === 3 ? 'text-amber-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 font-bold uppercase leading-relaxed">{item.desc}</p>
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
                     {pulseEvents.length === 0 ? (
                       <div className="py-20 text-center opacity-40">
                         <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded yet</p>
                       </div>
                     ) : (
                       pulseEvents.map((log, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-up" style={{animationDelay: `${i*150}ms`}}>
                           <div className="flex flex-col min-w-0 pr-4">
                             <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{log.user}</span>
                             <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase truncate">{log.action}</span>
                           </div>
                           <span className="text-[8px] font-black text-slate-400 uppercase shrink-0">{log.time}</span>
                         </div>
                       ))
                     )}
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
                image: "/jas.jpg",
                gradient: "from-blue-500 to-indigo-600"
              },
              { 
                name: "Ivy Cua", 
                role: "Organizational Capability & Design", 
                bio: "Expert in process optimization and innovation scaling. Ivy ensures every submission is rigorously assessed and mapped to our strategic productivity pillars, transforming raw concepts into validated pilot programs.", 
                initials: "IC",
                image: "/ivy.jpg",
                gradient: "from-emerald-500 to-teal-600"
              }
            ].map((member, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="group bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-500 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br ${member.gradient} flex-shrink-0 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform duration-500 overflow-hidden`}>
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const initialsSpan = document.createElement('span');
                          initialsSpan.className = "text-white text-4xl font-black";
                          initialsSpan.innerText = member.initials;
                          parent.appendChild(initialsSpan);
                        }
                      }}
                    />
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
              { title: "Ways of Working", desc: "Cultural and collaborative shifts that make us more agile and connected.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "cyan" }
            ].map((pillar, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`group ${getColorClasses(pillar.color)} border p-8 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl card-hover h-full flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md`}>
                  <div className={`w-12 h-12 ${getIconColorClasses(pillar.color)} rounded-xl flex items-center justify-center mb-6 border group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={pillar.icon} /></svg>
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