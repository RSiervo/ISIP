
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Idea } from '../types';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onRoleToggle: () => void;
  onNavigateHome?: () => void;
  onNavigateSettings?: () => void;
}

type ModalType = 'MISSION' | 'PRIVACY' | 'GUIDELINES' | null;

const Layout: React.FC<LayoutProps> = ({ children, role, onRoleToggle, onNavigateHome, onNavigateSettings }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      // Look for the 'dark' class explicitly; if absent, it's light mode (default)
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [footerLogoError, setFooterLogoError] = useState(false);
  const [unreadIdeas, setUnreadIdeas] = useState<Idea[]>([]);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync unread ideas on load and when role is Admin
  const refreshNotifications = () => {
    if (role === UserRole.ADMIN) {
      const allIdeas = storageService.getIdeas();
      const unread = allIdeas.filter(i => i.isRead === false);
      setUnreadIdeas(unread);
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [role]);

  // Initialize notification sound
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current = audio;
  }, []);

  // Listen for storage changes to notify admin
  useEffect(() => {
    if (role === UserRole.ADMIN) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'isip_enterprise_ideas') {
          const oldLen = e.oldValue ? JSON.parse(e.oldValue).length : 0;
          const newLen = e.newValue ? JSON.parse(e.newValue).length : 0;
          
          if (newLen > oldLen) {
            refreshNotifications();
            audioRef.current?.play().catch(err => console.debug("Audio play blocked:", err));
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('isip_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('isip_theme', 'light');
    }
  };

  const handleMarkAsRead = (idea: Idea) => {
    storageService.updateIdea({ ...idea, isRead: true });
    refreshNotifications();
  };

  const handleMarkAllAsRead = () => {
    unreadIdeas.forEach(i => storageService.updateIdea({ ...i, isRead: true }));
    refreshNotifications();
    setShowNotifications(false);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const d = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const t = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { date: d, time: t };
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'MISSION':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Our Mission</h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <p>The <span className="text-blue-600 dark:text-blue-400 font-bold">Organizational Capability & Design (OCD)</span> team is dedicated to fostering a culture of innovation across TIM.</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Drive operational efficiency through collective intelligence.</li>
                <li>Empower employees at all levels to contribute to TIM's strategy.</li>
                <li>Ensure sustainable growth by optimizing internal processes.</li>
              </ul>
            </div>
          </div>
        );
      case 'PRIVACY':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Privacy & Security</h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">Confidentiality</p>
                <p>Non-anonymous submissions are visible only to the authorized OCD review board.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">Anonymity</p>
                <p>Anonymous submissions are truly anonymous. We do not track user identifiers for these ideas.</p>
              </div>
            </div>
          </div>
        );
      case 'GUIDELINES':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Review Guidelines</h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "1. Strategic Fit", desc: "Alignment with TIM's quarterly objectives." },
                  { label: "2. Feasibility", desc: "Implementation within realistic resources." },
                  { label: "3. Impact/Yield", desc: "Significant improvement in productivity or experience." }
                ].map((item, idx) => (
                  <div key={idx} className="flex space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-2xl transition-colors">
                    <span className="text-blue-600 dark:text-blue-400 font-black">{idx + 1}.</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 overflow-x-hidden">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer overflow-hidden" onClick={onNavigateHome || (() => window.location.reload())}>
            {!logoError ? (
              <img 
                src="logo.png" 
                alt="ISIP Logo" 
                className="h-10 sm:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="bg-slate-900 dark:bg-blue-600 p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" />
                </svg>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ISIP</span>
              <span className="text-[7px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] mt-1 whitespace-nowrap">Total Information Management Corp.</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {role === UserRole.ADMIN && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm flex items-center justify-center border relative ${showNotifications ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/50 dark:border-slate-700/50'}`}
                  title="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadIdeas.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-black text-white items-center justify-center border-2 border-white dark:border-slate-900">
                        {unreadIdeas.length}
                      </span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="fixed sm:absolute top-[70px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:mt-3 sm:w-96 bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in flex flex-col max-h-[calc(100vh-100px)] sm:max-h-[480px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Alert Console</h4>
                      {unreadIdeas.length > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-[9px] font-black uppercase tracking-tighter text-blue-600 hover:text-blue-500 transition-colors">Mark all as read</button>
                      )}
                    </div>
                    <div className="flex-grow overflow-y-auto no-scrollbar py-2">
                      {unreadIdeas.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No unread alerts</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {unreadIdeas.map(idea => {
                            const { date, time } = formatDateTime(idea.timestamp);
                            return (
                              <div key={idea.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start space-x-4 relative group">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse"></div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate pr-4">
                                      {idea.isAnonymous ? `Anon @ ${idea.department}` : idea.name}
                                    </p>
                                    <button 
                                      onClick={() => handleMarkAsRead(idea)}
                                      className="text-[8px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase shrink-0"
                                    >
                                      Read
                                    </button>
                                  </div>
                                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{idea.title}</p>
                                  <div className="flex items-center space-x-3 mt-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{date}</span>
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{time}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm active:scale-90 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {role === UserRole.ADMIN && (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 sm:space-x-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-md">
                    AD
                  </div>
                  <div className="hidden sm:block text-left pr-2">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Admin</p>
                    <p className="text-[7px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter mt-1">OCD User</p>
                  </div>
                  <svg className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in py-1">
                    <button 
                      onClick={() => { onNavigateSettings?.(); setShowUserMenu(false); }}
                      className="w-full px-5 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                    >
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Settings</span>
                    </button>
                    <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800"></div>
                    <button 
                      onClick={() => { onRoleToggle(); setShowUserMenu(false); }}
                      className="w-full px-5 py-3 flex items-center space-x-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left group"
                    >
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 opacity-80 dark:hidden"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-10 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 lg:col-span-1 space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-4">
                {!footerLogoError ? (
                  <img 
                    src="logo.png" 
                    alt="ISIP Logo" 
                    className="h-10 sm:h-12 w-auto object-contain"
                    onError={() => setFooterLogoError(true)}
                  />
                ) : (
                  <div className="bg-slate-900 dark:bg-blue-600 p-2.5 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" />
                    </svg>
                  </div>
                )}
                <span className="text-lg sm:text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase">ISIP Portal</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
                Empowering every TIM employee to shape the future through clarity, collaboration, and continuous improvement.
              </p>
            </div>

            <div className="col-span-1 space-y-4 sm:space-y-6">
              <h4 className="text-[8px] sm:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Platform</h4>
              <ul className="space-y-2 sm:space-y-4">
                <li><button onClick={() => alert('Roadmap feature coming soon.')} className="text-xs sm:text-sm text-slate-600 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors font-bold text-left">Innovation Roadmap</button></li>
                <li><button onClick={() => alert('Success stories currently being archived.')} className="text-xs sm:text-sm text-slate-600 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors font-bold text-left">Success Stories</button></li>
              </ul>
            </div>

            <div className="col-span-1 space-y-4 sm:space-y-6">
              <h4 className="text-[8px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Governance</h4>
              <ul className="space-y-2 sm:space-y-4">
                <li><button onClick={() => setActiveModal('MISSION')} className="text-xs sm:text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors font-bold text-left">OCD Mission</button></li>
                <li><button onClick={() => setActiveModal('PRIVACY')} className="text-xs sm:text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors font-bold text-left">Privacy Policy</button></li>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-4 sm:space-y-6">
              <h4 className="text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Direct Contact</h4>
              <div className="bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm dark:shadow-none">
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold mb-2 sm:mb-4 uppercase tracking-widest">Questions?</p>
                <a href="mailto:ocd@tim.com" className="inline-flex items-center text-xs sm:text-sm font-black text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Reach out to OCD
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 sm:pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Total Information Management Corp. All Rights Reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-[7px] sm:text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                System Operational
              </span>
              <span className="text-[7px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Internal Use Only</span>
            </div>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl sm:rounded-[3rem] p-1 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto">
            <div className="bg-white dark:bg-slate-900 rounded-[1.9rem] sm:rounded-[2.9rem] p-6 sm:p-12 relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="animate-fade-up">
                {renderModalContent()}
                <div className="mt-8 sm:mt-12">
                  <button onClick={() => setActiveModal(null)} className="w-full py-3 sm:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
