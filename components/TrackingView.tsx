
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Idea, IdeaStatus } from '../types';

const TRACKING_LOADING_MESSAGES = [
  "Initializing neural handshake...",
  "Scanning OCD central repository...",
  "Decrypting reference token...",
  "Fetching milestone metadata...",
  "Synchronizing idea lifecycle...",
  "Finalizing visualization node..."
];

interface TrackingViewProps {
  onBack: () => void;
}

const TrackingView: React.FC<TrackingViewProps> = ({ onBack }) => {
  const [token, setToken] = useState('');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [error, setError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isSearching) {
      interval = window.setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % TRACKING_LOADING_MESSAGES.length);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSearching(true);
    setError(false);
    setIdea(null);
    
    // Simulate a brief search delay for aesthetic effect (matches submission)
    setTimeout(() => {
      const allIdeas = storageService.getIdeas();
      const found = allIdeas.find(i => i.referenceId.toUpperCase() === token.trim().toUpperCase());
      
      if (found) {
        setIdea(found);
        setError(false);
      } else {
        setIdea(null);
        setError(true);
      }
      setIsSearching(false);
    }, 1800);
  };

  const getStatusStep = (status: IdeaStatus) => {
    switch (status) {
      case 'Review': return 1;
      case 'Pilot': return 2;
      case 'Implemented': return 3;
      case 'Deferred': return 1;
      default: return 1;
    }
  };

  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'Review': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Pilot': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Implemented': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Deferred': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in relative">
      {/* Full screen loader overlay */}
      {isSearching && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="text-center space-y-10">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-[2rem] opacity-20"></div>
              <div className="absolute inset-0 border-t-4 border-blue-500 rounded-[2rem] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-black text-white tracking-tight">Locating Node Data</p>
              <div className="h-1 w-48 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 animate-grow-width"></div>
              </div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] h-4">
                {TRACKING_LOADING_MESSAGES[loadingTextIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Track Your Idea</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">Innovation Monitoring Node</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 transition-all flex items-center space-x-3 shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Exit Tracking</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-8 sm:p-12">
        <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Enter Submission Token</h2>
            <p className="text-xs text-slate-500 font-medium">Use the reference ID provided after your submission (e.g., ISIP-XXXXXX)</p>
          </div>
          
          <div className="relative group">
            <input
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setError(false); }}
              placeholder="ISIP-XXXXXX"
              className={`w-full px-8 py-6 bg-slate-50 dark:bg-slate-950/50 border ${error ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-slate-200 dark:border-slate-800'} rounded-3xl text-2xl font-black text-blue-600 dark:text-blue-400 placeholder:text-slate-300 dark:placeholder:text-slate-800 outline-none focus:border-blue-500 transition-all text-center uppercase tracking-widest`}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !token.trim()}
            className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            Locate Submission
          </button>

          {error && (
            <div className="text-center animate-fade-up">
              <p className="text-xs font-black text-rose-500 uppercase tracking-widest">No record found with that token</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Please verify the ID and try again</p>
            </div>
          )}
        </form>

        {/* Result Pop-up Card */}
        {idea && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto no-scrollbar">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.5)] w-full max-w-4xl p-8 sm:p-12 relative animate-fade-up my-auto">
              {/* Exit Button */}
              <button 
                onClick={() => setIdea(null)}
                className="absolute top-6 right-6 sm:top-10 sm:right-10 p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl transition-all hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 sm:pt-0">
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                    <div className="text-blue-500 font-mono font-black text-xs tracking-widest uppercase mt-4">{idea.referenceId}</div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">{idea.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{idea.category}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                      {idea.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {idea.impactTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-10">
                  <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Process Milestone</p>
                    
                    <div className="space-y-10 relative z-10">
                      {[
                        { step: 1, label: 'Review', desc: 'OCD initial evaluation', active: true },
                        { step: 2, label: 'Pilot', desc: 'Controlled testing phase', active: getStatusStep(idea.status) >= 2 },
                        { step: 3, label: 'Implementation', desc: 'Enterprise wide deployment', active: getStatusStep(idea.status) >= 3 }
                      ].map((m, idx) => (
                        <div key={m.step} className={`flex items-start space-x-6 ${!m.active ? 'opacity-20 grayscale' : ''}`}>
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${m.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-600'}`}>
                              {m.step}
                            </div>
                            {idx < 2 && (
                              <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 ${m.active && getStatusStep(idea.status) > m.step ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                            )}
                          </div>
                          <div>
                            <p className={`text-[11px] font-black uppercase tracking-widest ${m.active ? 'text-white' : 'text-slate-600'}`}>{m.label}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl">
                     <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">OCD Note</p>
                     <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                       "Our team typically reviews all submissions within 14 business days. Thank you for contributing to TIM's innovation culture."
                     </p>
                  </div>
                  
                  <button 
                    onClick={() => setIdea(null)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl"
                  >
                    Close Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingView;
