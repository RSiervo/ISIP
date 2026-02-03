import React, { useState, useEffect, useRef } from 'react';
import { getOCDAIResponse } from '../services/geminiService';

const CALLOUT_MESSAGES = [
  "Need help? Visit OCD AI",
  "Got an idea? I can guide you.",
  "Track your idea's progress here.",
  "Ask me about our mission!",
  "New to ISIP? Let's chat."
];

const RobotIcon: React.FC<{ className?: string, animated?: boolean }> = ({ className = "w-8 h-8", animated = true }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head Outline */}
    <rect x="5" y="7" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
    {/* Antenna */}
    <path d="M12 7V3M12 3C13.1046 3 14 3.89543 14 5C14 6.10457 13.1046 7 12 7C10.8954 7 10 6.10457 10 5C10 3.89543 10.8954 3 12 3Z" fill="currentColor" className={animated ? "animate-pulse" : ""} />
    {/* Eyes */}
    <circle cx="9" cy="12" r="1.5" fill="currentColor" className={animated ? "animate-robot-blink" : ""} />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" className={animated ? "animate-robot-blink" : ""} />
    {/* Mouth / Data Grill */}
    <path d="M9 16H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={animated ? "animate-pulse" : ""} />
    {/* Side Bolts */}
    <path d="M5 11H3M19 11H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const OCDAIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I am OCD AI. I'm here to help you navigate the I.S.I.P. system. How can I assist you with your innovation journey today?" }
  ]);
  
  // Callout Logic States
  const [calloutIndex, setCalloutIndex] = useState(0);
  const [showCallout, setShowCallout] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Rotating Callout Logic
  useEffect(() => {
    let calloutTimer: number;
    let pauseTimer: number;

    const startCycle = () => {
      if (isOpen) return;

      // Show callout
      setShowCallout(true);
      
      // Hide after 5 seconds
      calloutTimer = window.setTimeout(() => {
        setShowCallout(false);
        
        // Wait 3 seconds before showing the next one
        pauseTimer = window.setTimeout(() => {
          if (!isOpen) {
             setCalloutIndex(prev => (prev + 1) % CALLOUT_MESSAGES.length);
          }
        }, 3000);
      }, 5000);
    };

    if (!isOpen) {
      startCycle();
    } else {
      setShowCallout(false);
    }

    return () => {
      clearTimeout(calloutTimer);
      clearTimeout(pauseTimer);
    };
  }, [isOpen, calloutIndex]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Format history for Gemini API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getOCDAIResponse(userMsg, history as any);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
      {/* Callout Pop-up Message */}
      {showCallout && !isOpen && (
        <div className="mb-3 mr-2 animate-fade-up">
          <div className="bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-none shadow-2xl relative group border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              {CALLOUT_MESSAGES[calloutIndex]}
            </p>
            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-1 right-0 w-3 h-3 bg-slate-900 dark:bg-blue-600 rotate-45 transform translate-y-1/2 border-r border-b border-white/10"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCallout(false); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[380px] h-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="p-6 bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <RobotIcon className="w-6 h-6 text-white" animated={true} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none">OCD AI</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-[8px] font-black uppercase tracking-tighter opacity-70">Agent Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-1 text-white/70 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-[1.5rem] text-[11px] sm:text-xs font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-[1.5rem] rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me about ISIP..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-5 pr-14 py-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
            <p className="text-[7px] text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-3">Powered by Gemini 3 Flash Preview</p>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-blue-600 hover:bg-blue-700 hover:scale-110 active:scale-95'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        {isOpen ? (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="flex flex-col items-center">
            <RobotIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" animated={true} />
            <span className="text-[7px] font-black text-white uppercase tracking-tighter absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">OCD AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default OCDAIAgent;