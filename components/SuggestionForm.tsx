// Import React to resolve namespace issues for FC and FormEvent types
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService';
import { Idea, ComplexityLevel } from '../types';
import { evaluateIdea, getComplexityReasoning } from '../services/geminiService';

const CATEGORIES = [
  "Process improvement",
  "Productivity & efficiency",
  "Customer experience",
  "Capability & skills",
  "Tools / systems",
  "Ways of working",
  "Other"
];

const DEPARTMENTS = [
  "Management",
  "VAS Sales",
  "VAS Technology Solutions",
  "VAS Products and Innovation",
  "VAS Provisioning",
  "FSI Sales",
  "FSI Technology Solutions",
  "FSI Products and Innovation",
  "ENT Sales",
  "ENT Technology Solutions",
  "Marketing",
  "Technology Strategy and Architecture",
  "Customer Excellence Operations",
  "Service Delivery Management",
  "Managed Services Monitoring and L1 Operations",
  "Managed Services and Cybersecurity L2/L3 Operations",
  "Managed Services L2/L3 Operations",
  "Systems Integration L2/L3 Implementation Support",
  "Operations",
  "Project Management Office",
  "GRC",
  "IT Security Operations",
  "Network Engineering",
  "Network Operations",
  "Organizational Capability and Design",
  "Nexusguard",
  "Mondelez"
];

const IMPACT_OPTIONS = [
  "Saves time",
  "Reduces cost",
  "Improves quality",
  "Improves customer experience",
  "Improves employee experience",
  "Reduces risk",
  "Other"
];

const LOADING_MESSAGES = [
  "Initializing secure handshake...",
  "Analyzing innovation impact...",
  "Gemini evaluating feasibility...",
  "Encoding productivity metrics...",
  "Mapping organizational benefits...",
  "Filing with OCD Command...",
  "Finalizing record..."
];

interface SuggestionFormProps {
  onCancel?: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  // AI Complexity reasoning state
  const [aiComplexityReason, setAiComplexityReason] = useState<string>("");
  const [isAiAnalyzingComplexity, setIsAiAnalyzingComplexity] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    isAnonymous: false,
    department: '',
    role: '',
    canContact: true,
    title: '',
    category: CATEGORIES[0],
    description: '',
    painPoint: '',
    impactTags: [] as string[],
    beneficiaries: '',
    complexity: 'Medium' as ComplexityLevel,
    seenElsewhere: false,
    seenElsewhereDetail: '',
    additionalThoughts: '',
    acknowledged: false
  });

  useEffect(() => {
    let interval: number | undefined;
    if (isSubmitting) {
      interval = window.setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Trigger AI reasoning when reaching step 4 or changing complexity
  useEffect(() => {
    if (step === 4 && formData.title && formData.description) {
      const fetchReasoning = async () => {
        setIsAiAnalyzingComplexity(true);
        const reason = await getComplexityReasoning(formData.title, formData.description, formData.complexity);
        setAiComplexityReason(reason);
        setIsAiAnalyzingComplexity(false);
      };
      fetchReasoning();
    }
  }, [step, formData.complexity]);

  const validateStep = (currentStep: number): boolean => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!formData.isAnonymous && !formData.name.trim()) {
        setValidationError("Please enter your name or select 'Submit Anonymously'.");
        return false;
      }
      if (!formData.department.trim()) {
        setValidationError("Department selection is required.");
        return false;
      }
      if (!formData.role.trim()) {
        setValidationError("Role/Position is required.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.title.trim()) {
        setValidationError("Idea Title is required.");
        return false;
      }
      if (!formData.description.trim()) {
        setValidationError("Idea Description is required.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.painPoint.trim()) {
        setValidationError("Please describe the challenge or pain point.");
        return false;
      }
      if (!formData.beneficiaries.trim()) {
        setValidationError("Please specify who will benefit.");
        return false;
      }
    } else if (currentStep === 5) {
      if (!formData.acknowledged) {
        setValidationError("You must acknowledge the terms to proceed.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevStep = () => {
    setValidationError(null);
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImpactToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      impactTags: prev.impactTags.includes(tag) 
        ? prev.impactTags.filter(t => t !== tag)
        : [...prev.impactTags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(5)) return;

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const aiScores = await evaluateIdea(
        formData.title,
        formData.description,
        formData.complexity,
        formData.painPoint
      );

      const newRefId = `ISIP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const newIdea: Idea = {
        ...formData,
        id: uuidv4(),
        referenceId: newRefId,
        timestamp: new Date().toISOString(),
        status: 'Review',
        impactScore: aiScores.impactScore,
        feasibilityScore: aiScores.feasibilityScore,
        owner: 'Unassigned',
        internalNotes: `AI Preliminary Rating: Impact ${aiScores.impactScore}/10, Feasibility ${aiScores.feasibilityScore}/10. ${aiComplexityReason ? 'AI Complexity Analysis: ' + aiComplexityReason : ''}`,
        lastUpdated: new Date().toISOString(),
        isRead: false // Initialize as unread for the 'NEW' tag
      };

      storageService.saveIdea(newIdea);
      setRefId(newRefId);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setValidationError("An error occurred during AI processing.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-6 text-center animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="w-full flex flex-col items-center space-y-10">
          
          {/* Green Checkmark Icon Box */}
          <div className="w-20 h-20 bg-slate-900/80 dark:bg-slate-900 text-emerald-500 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative animate-float">
             <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] animate-pulse"></div>
             <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Transmission Successful</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Your proposal has been securely logged and indexed into the OCD innovation repository.
            </p>
          </div>

          {/* Recessed Glass Token Display */}
          <div className="bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-2xl border border-white/5 py-10 px-12 rounded-[3.5rem] w-full max-w-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_20px_40px_rgba(0,0,0,0.3)] group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-500 mb-4 relative z-10">Submission Token</p>
             <p className="text-3xl sm:text-4xl font-mono font-black text-blue-500 dark:text-blue-400 tracking-[0.1em] select-all uppercase relative z-10 transition-transform group-hover:scale-105 duration-500">
               {refId}
             </p>
          </div>

          {/* Action Buttons with subtle glow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
                setFormData({ ...formData, department: '', title: '', description: '', painPoint: '', impactTags: [], beneficiaries: '', additionalThoughts: '', acknowledged: false });
              }}
              className="w-full sm:flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/30 active:scale-95 border border-blue-500/20"
            >
              New Submission
            </button>
            <button
              onClick={onCancel || (() => window.location.reload())}
              className="w-full sm:flex-1 px-8 py-5 bg-slate-900 dark:bg-slate-800 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 border border-slate-800 dark:border-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 mt-6 animate-fade-in">
      {isSubmitting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="text-center space-y-10">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-[2rem] opacity-20"></div>
              <div className="absolute inset-0 border-t-4 border-blue-500 rounded-[2rem] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-black text-white tracking-tight">Syncing with OCD Repository</p>
              <div className="h-1 w-48 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 animate-grow-width"></div>
              </div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] h-4">
                {LOADING_MESSAGES[loadingTextIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">I.S.I.P Innovation</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">Organizational Capability & Design Portal</p>
        </div>
        <button 
          onClick={onCancel || (() => window.location.reload())}
          className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 transition-all flex items-center space-x-3 shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          <span>Discard Draft</span>
        </button>
      </div>

      {/* High-End Stepper Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px] sm:min-h-[640px]">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-8 lg:space-y-10">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`flex items-center space-x-5 transition-all duration-500 ${step === i ? 'translate-x-3' : 'opacity-40 grayscale scale-95'}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-[10px] shadow-lg transition-all ${step >= i ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {i}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${step >= i ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-700'}`}>
                    {['Identity', 'Proposition', 'Strategic Impact', 'Feasibility', 'Confirmation'][i-1]}
                  </span>
                  <span className="text-[7px] font-bold text-slate-400 dark:text-slate-600 uppercase mt-0.5 tracking-tighter">
                    {['Submission Source', 'The Solution', 'Value Analysis', 'Implementation', 'Final Review'][i-1]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block pt-8 border-t border-slate-200 dark:border-slate-900 mt-8">
            <div className="flex items-center space-x-3 text-emerald-500">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[8px] font-black uppercase tracking-widest">Secure Link Active</span>
            </div>
            <p className="text-[7px] text-slate-400 dark:text-slate-600 font-bold mt-2 uppercase">TIM Internal Innovation Node v4.0</p>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-grow flex flex-col relative">
          <div className="p-6 lg:p-12 flex-grow overflow-y-auto no-scrollbar">
            {validationError && (
              <div className="mb-6 animate-slide-left">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-3xl flex items-center space-x-4 text-rose-600 dark:text-rose-400">
                  <div className="w-7 h-7 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wide">{validationError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="h-full">
              {/* Identity Section */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Proposed By</label>
                      <input
                        type="text"
                        disabled={formData.isAnonymous}
                        value={formData.isAnonymous ? '' : formData.name}
                        onChange={e => { setFormData({...formData, name: e.target.value}); setValidationError(null); }}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm disabled:opacity-30"
                        placeholder={formData.isAnonymous ? "Anonymous Proposal" : "Full Legal Name"}
                      />
                    </div>
                    <div className="flex flex-col justify-center pt-2">
                       <label className="flex items-center space-x-4 cursor-pointer group">
                          <input type="checkbox" className="sr-only peer" checked={formData.isAnonymous} onChange={e => { setFormData({...formData, isAnonymous: e.target.checked}); setValidationError(null); }} />
                          <div className="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-blue-600 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">Submit Anonymously</span>
                            <span className="text-[7px] font-bold text-slate-400 dark:text-slate-600 uppercase">Hide identity from review</span>
                          </div>
                       </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Organizational Unit</label>
                      <select
                        required
                        value={formData.department}
                        onChange={e => { setFormData({...formData, department: e.target.value}); setValidationError(null); }}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-bold text-sm appearance-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Current Designation</label>
                      <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={e => { setFormData({...formData, role: e.target.value}); setValidationError(null); }}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-bold text-sm"
                        placeholder="e.g. Solutions Architect"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-600/5 dark:bg-blue-500/5 border border-blue-600/10 dark:border-blue-500/10 p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Direct Consultation</p>
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Can we contact you for more details?</p>
                    </div>
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                      <button type="button" onClick={() => setFormData({...formData, canContact: true})} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.canContact ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Yes</button>
                      <button type="button" onClick={() => setFormData({...formData, canContact: false})} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!formData.canContact ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>No</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Proposition Section */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Proposal Headline</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => { setFormData({...formData, title: e.target.value}); setValidationError(null); }}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-black text-base tracking-tight"
                      placeholder="Concisely name your innovation"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Category</label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({...formData, category: cat})}
                          className={`px-3 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all text-center leading-tight ${formData.category === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Full Concept Description</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={e => { setFormData({...formData, description: e.target.value}); setValidationError(null); }}
                      className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all text-sm font-medium leading-relaxed resize-none"
                      placeholder="Describe the solution mechanics..."
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Strategic Impact Section */}
              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Identified Pain Point</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.painPoint}
                      onChange={e => { setFormData({...formData, painPoint: e.target.value}); setValidationError(null); }}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all text-sm font-medium leading-relaxed resize-none"
                      placeholder="What operation friction does this solve?"
                    ></textarea>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Impact Vectors</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {IMPACT_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleImpactToggle(opt)}
                          className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left ${formData.impactTags.includes(opt) ? 'bg-blue-600/10 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-slate-400'}`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${formData.impactTags.includes(opt) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
                            {formData.impactTags.includes(opt) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Beneficiaries</label>
                    <input
                      type="text"
                      required
                      value={formData.beneficiaries}
                      onChange={e => { setFormData({...formData, beneficiaries: e.target.value}); setValidationError(null); }}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-bold text-sm"
                      placeholder="e.g. Sales Division"
                    />
                  </div>
                </div>
              )}

              {/* Feasibility Section */}
              {step === 4 && (
                <div className="space-y-10 animate-fade-in">
                  {/* Complexity Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">Low (Quick Win)</p>
                      <p className="text-[8px] text-slate-500 dark:text-slate-500 leading-tight font-medium uppercase tracking-tighter">Easy to implement, minimal cost or effort, no major approvals needed, can be executed quickly.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Medium (Manageable)</p>
                      <p className="text-[8px] text-slate-500 dark:text-slate-500 leading-tight font-medium uppercase tracking-tighter">Requires some planning, coordination across teams, or minor resources/approvals.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">High (Complex / Further Study)</p>
                      <p className="text-[8px] text-slate-500 dark:text-slate-500 leading-tight font-medium uppercase tracking-tighter">Complex to implement; may require detailed analysis, budget approval, process changes, or alignment.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1 text-center block">Select Complexity</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { val: "Low (quick win)", label: "Low (Quick Win)" },
                        { val: "Medium", label: "Medium (Manageable)" },
                        { val: "High / requires study", label: "High (Complex / Study)" }
                      ].map((c) => (
                        <button
                          key={c.val}
                          type="button"
                          onClick={() => setFormData({...formData, complexity: c.val as ComplexityLevel})}
                          className={`px-4 py-6 rounded-[2rem] border text-center transition-all flex flex-col items-center justify-center space-y-2 ${formData.complexity === c.val ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-400'}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Complexity Reasoning Box */}
                  <div className="relative group">
                    <div className={`p-8 bg-blue-600/[0.03] dark:bg-blue-500/[0.03] border border-blue-600/10 dark:border-blue-500/10 rounded-[2.5rem] transition-all duration-700 ${isAiAnalyzingComplexity ? 'animate-pulse' : ''}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">ISIP Analysis</h4>
                      </div>
                      <div className="min-h-[60px]">
                        {isAiAnalyzingComplexity ? (
                          <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-blue-600/10 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-blue-600/10 rounded-full"></div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic transition-all animate-fade-in">
                            "{aiComplexityReason || "Selecting a complexity level triggers architectural evaluation..."}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                       <div>
                         <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">Historical Reference</p>
                         <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Has this been done elsewhere?</p>
                       </div>
                       <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                         <button type="button" onClick={() => setFormData({...formData, seenElsewhere: true})} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.seenElsewhere ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-400'}`}>Yes</button>
                         <button type="button" onClick={() => setFormData({...formData, seenElsewhere: false})} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!formData.seenElsewhere ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-400'}`}>No</button>
                       </div>
                     </div>
                     {formData.seenElsewhere && (
                       <textarea
                         rows={2}
                         value={formData.seenElsewhereDetail}
                         onChange={e => setFormData({...formData, seenElsewhereDetail: e.target.value})}
                         className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-medium text-xs"
                         placeholder="Please detail..."
                       ></textarea>
                     )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Additional Insights (Optional)</label>
                    <textarea
                      rows={4}
                      value={formData.additionalThoughts}
                      onChange={e => setFormData({...formData, additionalThoughts: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-medium text-sm resize-none"
                      placeholder="Any other data?"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Confirmation Section */}
              {step === 5 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in py-6">
                  <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_60px_rgba(37,99,235,0.1)]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Governance Verification</h3>
                    <p className="max-w-xs text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                      Evaluation triggered bi-weekly. Restricted access only.
                    </p>
                  </div>
                  
                  <label className={`flex items-start space-x-6 p-8 bg-slate-50 dark:bg-slate-950/50 border ${validationError && !formData.acknowledged ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-slate-200 dark:border-slate-800'} rounded-[2.5rem] cursor-pointer group hover:border-blue-500 transition-all text-left max-w-lg`}>
                    <div className="pt-1 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        required 
                        checked={formData.acknowledged} 
                        onChange={e => { setFormData({...formData, acknowledged: e.target.checked}); setValidationError(null); }} 
                        className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-600 transition-all" 
                      />
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-bold leading-relaxed uppercase tracking-wide">
                      I acknowledge that all proposed innovations will be reviewed for strategic fit. Submissions may be refined during evaluation.
                    </span>
                  </label>
                </div>
              )}
            </form>
          </div>

          {/* Persistent Footer Controls */}
          <div className="p-6 lg:p-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md gap-4 sm:gap-6">
            <button
              type="button"
              onClick={prevStep}
              className={`px-8 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              Previous
            </button>
            
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-grow md:flex-none px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Continue</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className={`flex-grow md:flex-none px-10 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3 ${formData.acknowledged ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 pointer-events-none opacity-50'}`}
              >
                <span>Finalize Submission</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center opacity-20">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em]">Authorized Internal Proposal Node &bull; TIM-OCD-01-A</p>
      </div>
    </div>
  );
};

export default SuggestionForm;