import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import RecordingButton from './components/RecordingButton';
import TranscriptionEditor from './components/TranscriptionEditor';
import ReportDisplay from './components/ReportDisplay';
import AnimatedBackground from './components/AnimatedBackground';
import LandingPage from './components/LandingPage';

axios.defaults.baseURL = '';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [doctorName, setDoctorName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const [currentStep, setCurrentStep] = useState('dashboard');
  const [transcription, setTranscription] = useState('');
  const [report, setReport] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportsHistory, setReportsHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loginRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const cursorGlowRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('doctorName');
    if (storedName) {
      setDoctorName(storedName);
      setIsNameSet(true);
      setShowLanding(false);
      fetchReportsHistory(storedName);
    }
  }, []);

  // Cursor glow
  useEffect(() => {
    const glowEl = cursorGlowRef.current;
    if (!glowEl) return;
    const handleMouseMove = (e) => {
      gsap.to(glowEl, { x: e.clientX - 400, y: e.clientY - 400, duration: 1, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Login entrance
  useEffect(() => {
    if (!showLanding && !isNameSet && loginRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(loginRef.current, { autoAlpha: 0, y: 25, duration: 0.7, ease: 'power3.out' });
        gsap.from('.login-title', { y: 15, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 });
        gsap.from('.login-form', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power3.out', delay: 0.5 });
      }, loginRef);
      return () => ctx.revert();
    }
  }, [showLanding, isNameSet]);

  // Dashboard entrance
  useEffect(() => {
    if (isNameSet && sidebarRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(sidebarRef.current, { x: -280, autoAlpha: 0, duration: 0.7, ease: 'power3.out' });
        gsap.from('.sidebar-logo', { autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 });
        gsap.from('.sidebar-nav-item', { x: -20, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', delay: 0.4 });
        gsap.from('.sidebar-user', { y: 15, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.6 });
      }, sidebarRef);
      return () => ctx.revert();
    }
  }, [isNameSet]);

  // Content transitions
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
    }
  }, [currentStep]);

  const fetchReportsHistory = async (name) => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`/api/reports?doctor=${encodeURIComponent(name)}`);
      if (response.data.success) setReportsHistory(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (doctorName.trim()) {
      const name = doctorName.trim();
      localStorage.setItem('doctorName', name);
      if (loginRef.current) {
        gsap.to(loginRef.current, {
          autoAlpha: 0, y: -15, duration: 0.3, ease: 'power3.in',
          onComplete: () => { setIsNameSet(true); fetchReportsHistory(name); }
        });
      } else {
        setIsNameSet(true);
        fetchReportsHistory(name);
      }
    }
  };

  const sampleTranscription = `I'm looking at the peripheral blood smear. There is marked normocytic anemia with moderate anisopoikilocytosis including dacrocytes and occasional schistocytes. The leukocytes are markedly decreased with absolute neutropenia. The differential shows predominantly mature lymphocytes comprising approximately 80 percent. Occasional reactive lymphocytes are noted. No circulating blasts are identified. Platelets are moderately decreased with no significant morphologic abnormalities. No platelet clumping is seen. Moving to the bone marrow aspirate, the marrow is hypocellular for age, estimated at approximately 15 to 20 percent cellularity. The myeloid to erythroid ratio is decreased. Erythroid precursors show megaloblastic changes with nuclear-cytoplasmic dyssynchrony. Myeloid maturation is present but decreased, with mild left shift. Megakaryocytes are markedly reduced in number. No increase in blasts is identified. Iron stores are adequate.`;

  const handleRecordingComplete = (transcript) => { setTranscription(transcript); setCurrentStep('edit'); };
  const handleUseSample = () => { setTranscription(sampleTranscription); setCurrentStep('edit'); };
  const handleTranscriptionEdit = (editedTranscript) => { setTranscription(editedTranscript); };
  const handleGenerateReport = async () => { setIsProcessing(true); setCurrentStep('report'); };

  const handleReportSaved = async (newReportData) => {
    const newReportId = `EXAM-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await axios.post('/api/reports', { id: newReportId, doctor: doctorName, report: newReportData });
      await fetchReportsHistory(doctorName);
    } catch (error) { console.error('Error saving report to DB:', error); }
  };

  const handleStartOver = () => { setCurrentStep('dashboard'); setTranscription(''); setReport(''); setIsProcessing(false); };

  const handleLogout = () => {
    const cleanup = () => {
      localStorage.removeItem('doctorName');
      setDoctorName(''); setIsNameSet(false); setCurrentStep('dashboard'); setReportsHistory([]);
    };
    if (mainContentRef.current) {
      gsap.to(mainContentRef.current, { autoAlpha: 0, duration: 0.25, ease: 'power3.in', onComplete: cleanup });
    } else cleanup();
  };

  if (showLanding && !isNameSet) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] relative overflow-hidden noise-overlay">
        <AnimatedBackground />
        <div ref={cursorGlowRef} className="fixed w-[800px] h-[800px] rounded-full pointer-events-none z-0 hidden md:block"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
        <div ref={loginRef} className="relative z-10 w-full max-w-lg px-6">
          <div className="card p-12 sm:p-16">
            <div className="text-center mb-12">
              <h1 className="login-title font-serif text-4xl text-white tracking-tight">PathReport</h1>
              <p className="login-title text-neutral-500 mt-3 text-base">Clinical Pathology & Reporting</p>
            </div>
            <form onSubmit={handleNameSubmit} className="login-form space-y-8">
              <div>
                <label className="block text-base font-medium text-neutral-400 mb-3">Attending Physician / Pathologist</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="w-full btn-primary py-4 text-base">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0A0A0A] relative overflow-hidden noise-overlay">
      <AnimatedBackground />
      <div ref={cursorGlowRef} className="fixed w-[800px] h-[800px] rounded-full pointer-events-none z-[1] hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="w-[280px] bg-[#0A0A0A]/90 backdrop-blur-xl text-neutral-400 flex flex-col shrink-0 hidden md:flex border-r border-white/[0.04] z-20">
          <div className="sidebar-logo px-8 py-10 pb-8">
            <p className="font-serif text-2xl text-white tracking-tight">PathReport</p>
            <p className="text-[11px] font-medium text-neutral-600 tracking-[0.15em] mt-1">PATHOLOGY OS</p>
          </div>

          <div className="flex-1 px-5 py-5 overflow-y-auto">
            <p className="text-[11px] font-medium text-neutral-600 tracking-widest mb-4 px-3 uppercase">Workspace</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Overview' },
                { id: 'record', label: 'New Examination', matchSteps: ['record', 'edit', 'report'] },
                { id: 'history', label: 'Case History' }
              ].map((item) => {
                const isActive = item.matchSteps ? item.matchSteps.includes(currentStep) : currentStep === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentStep(item.id)}
                    className={`sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-colors duration-200 ${
                      isActive ? 'bg-white/[0.05] text-white font-medium' : 'text-neutral-500 hover:bg-white/[0.02] hover:text-neutral-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-neutral-700'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-user p-5 mt-auto border-t border-white/[0.04]">
            <div className="flex items-center gap-3 px-2 py-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-400 text-sm font-medium">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[15px] font-medium text-neutral-300 truncate">{doctorName}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-lg text-sm text-neutral-600 hover:bg-white/[0.02] hover:text-neutral-400 transition-colors duration-200">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main ref={mainContentRef} className="flex-1 h-full overflow-y-auto px-8 py-10 md:px-16 md:py-12">
          <div className="max-w-6xl mx-auto">
            <header ref={headerRef} className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-4">
              <div>
                <h1 className="font-serif text-4xl text-white tracking-tight">
                  {currentStep === 'dashboard' ? 'Overview' : currentStep === 'history' ? 'Case History' : 'Clinical Examination'}
                </h1>
                <p className="text-base text-neutral-500 mt-2">
                  {currentStep === 'dashboard' ? 'Monitor system activity and recent reports.' : currentStep === 'history' ? 'Review archived pathology reports.' : 'Record, transcribe, and generate clinical reports.'}
                </p>
              </div>
              {currentStep === 'dashboard' && (
                <button onClick={() => setCurrentStep('record')} className="btn-primary text-base px-7 py-3">
                  New Examination
                </button>
              )}
            </header>

            <div ref={contentRef}>
              {currentStep === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Card */}
                  <div className="md:col-span-2 card p-10 sm:p-12 relative overflow-hidden">
                    <p className="text-sm font-medium text-emerald-500 mb-5 tracking-wide uppercase">System Online</p>
                    <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4 tracking-tight">Ready for Transcription</h2>
                    <p className="text-neutral-500 text-base mb-8 leading-relaxed max-w-lg">
                      Initialize a new audio session to dictate your pathology findings. AI will structure the transcription into a clinical report.
                    </p>
                    <button onClick={() => setCurrentStep('record')} className="btn-primary text-base px-8 py-3.5">
                      Start Recording
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="card p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wider">Reports</p>
                      <p className="text-5xl font-semibold text-white tracking-tight">{reportsHistory.length}</p>
                    </div>
                    <p className="text-sm text-neutral-600 mt-6 pt-5 border-t border-white/[0.04]">Total in system</p>
                  </div>

                  <div className="card p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wider">Avg. Speed</p>
                      <p className="text-5xl font-semibold text-white tracking-tight">2.4<span className="text-2xl text-neutral-600 ml-1">s</span></p>
                    </div>
                    <p className="text-sm text-neutral-600 mt-6 pt-5 border-t border-white/[0.04]">Generation time</p>
                  </div>

                  {/* Recent */}
                  <div className="md:col-span-2 card overflow-hidden flex flex-col">
                    <div className="px-8 py-5 border-b border-white/[0.04] flex justify-between items-center">
                      <p className="text-base font-medium text-white">Recent Cases</p>
                      <button onClick={() => setCurrentStep('history')} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[350px]">
                      {isLoadingHistory ? (
                        <div className="flex justify-center items-center py-16">
                          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                        </div>
                      ) : reportsHistory.slice(0, 4).length > 0 ? (
                        <div className="divide-y divide-white/[0.03]">
                          {reportsHistory.slice(0, 4).map((item, i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.015] transition-colors">
                              <div>
                                <p className="text-base font-medium text-neutral-300">{item.id}</p>
                                <p className="text-sm text-neutral-600 mt-0.5">{item.date}</p>
                              </div>
                              <span className="text-xs font-medium tracking-wider uppercase text-neutral-600">Done</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-16">
                          <p className="text-base text-neutral-600">No cases yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'history' && (
                <div className="card p-8 min-h-[500px]">
                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center py-24">
                      <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : reportsHistory.length === 0 ? (
                    <div className="text-center py-24">
                      <h3 className="font-serif text-xl text-white tracking-tight">No Reports Found</h3>
                      <p className="text-neutral-500 mt-2 text-sm max-w-sm mx-auto">Start a new examination to create your first report.</p>
                      <button onClick={() => setCurrentStep('record')} className="mt-6 btn-secondary text-sm">
                        Start Examination
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportsHistory.map((item, idx) => (
                        <div key={idx} className="border border-white/[0.04] rounded-lg overflow-hidden hover:border-white/[0.08] transition-colors">
                          <div className="flex justify-between items-center p-5 border-b border-white/[0.03]">
                            <div>
                              <div className="flex items-center gap-3 mb-0.5">
                                <h4 className="text-base font-medium text-white tracking-tight">{item.id}</h4>
                                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Finalized</span>
                              </div>
                              <p className="text-xs text-neutral-600">{item.date} &middot; {item.doctor}</p>
                            </div>
                          </div>
                          <div className="p-5 max-h-56 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed">{item.report}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(currentStep === 'record' || currentStep === 'edit' || currentStep === 'report') && (
                <div className="w-full max-w-4xl mx-auto">
                  {/* Stepper */}
                  <div className="mb-10 flex items-center justify-between px-4 sm:px-16 relative">
                    <div className="absolute left-[10%] right-[10%] top-1/2 h-px bg-white/[0.04] -translate-y-1/2 z-0" />
                    <div
                      className="absolute left-[10%] h-px bg-white/20 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                      style={{ width: currentStep === 'record' ? '0%' : currentStep === 'edit' ? '40%' : '80%' }}
                    />
                    {[
                      { id: 'record', label: 'Dictate', step: 1 },
                      { id: 'edit', label: 'Review', step: 2 },
                      { id: 'report', label: 'Finalize', step: 3 }
                    ].map((s) => {
                      const isActive = currentStep === s.id;
                      const isPast = (currentStep === 'edit' && s.id === 'record') ||
                                     (currentStep === 'report' && (s.id === 'record' || s.id === 'edit'));
                      return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center bg-[#0A0A0A] px-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-400 ${
                            isActive ? 'bg-white text-[#0A0A0A]' :
                            isPast ? 'bg-white/15 text-white' : 'bg-white/[0.04] text-neutral-600'
                          }`}>
                            {isPast ? '✓' : s.step}
                          </div>
                          <span className={`mt-3 text-xs font-medium tracking-wider uppercase ${isActive ? 'text-white' : isPast ? 'text-neutral-400' : 'text-neutral-600'}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Content */}
                  <div className="card p-10 sm:p-14 min-h-[550px]">
                    {currentStep === 'record' && <RecordingButton onRecordingComplete={handleRecordingComplete} onUseSample={handleUseSample} />}
                    {currentStep === 'edit' && <TranscriptionEditor transcription={transcription} onEdit={handleTranscriptionEdit} onGenerateReport={handleGenerateReport} onBack={() => setCurrentStep('record')} />}
                    {currentStep === 'report' && <ReportDisplay transcription={transcription} onStartOver={handleStartOver} onReportSaved={handleReportSaved} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
