import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecordingButton from './components/RecordingButton';
import TranscriptionEditor from './components/TranscriptionEditor';
import ReportDisplay from './components/ReportDisplay';
import AnimatedBackground from './components/AnimatedBackground';

// Set base URL for axios to point to the backend if needed (in dev it's proxied, but good to ensure API path)
axios.defaults.baseURL = 'http://localhost:3001';

function App() {
  const [doctorName, setDoctorName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const [currentStep, setCurrentStep] = useState('dashboard'); // dashboard, record, edit, report, history
  const [transcription, setTranscription] = useState('');
  const [report, setReport] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportsHistory, setReportsHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('doctorName');
    if (storedName) {
      setDoctorName(storedName);
      setIsNameSet(true);
      fetchReportsHistory(storedName);
    }
  }, []);

  const fetchReportsHistory = async (name) => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`/api/reports?doctor=${encodeURIComponent(name)}`);
      if (response.data.success) {
        setReportsHistory(response.data.reports);
      }
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
      setIsNameSet(true);
      fetchReportsHistory(name);
    }
  };

  const handleRecordingComplete = (transcript) => {
    setTranscription(transcript);
    setCurrentStep('edit');
  };

  const handleTranscriptionEdit = (editedTranscript) => {
    setTranscription(editedTranscript);
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    setCurrentStep('report');
  };

  const handleReportSaved = async (newReportData) => {
    const newReportId = `EXAM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      await axios.post('/api/reports', {
        id: newReportId,
        doctor: doctorName,
        report: newReportData
      });
      // Refresh history from server
      await fetchReportsHistory(doctorName);
    } catch (error) {
      console.error('Error saving report to DB:', error);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('dashboard');
    setTranscription('');
    setReport('');
    setIsProcessing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorName');
    setDoctorName('');
    setIsNameSet(false);
    setCurrentStep('dashboard');
    setReportsHistory([]);
  };

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden font-sans">
        <AnimatedBackground />
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-white/40">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100/50">
               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MedExam Workspace</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Clinical Pathology & Reporting</p>
          </div>
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Attending Physician / Pathologist</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 relative overflow-hidden font-sans">
      <AnimatedBackground />

      <div className="relative z-10 flex w-full h-full bg-transparent">
        
        {/* Sidebar */}
        <aside className="w-[280px] bg-[#0B1120] text-slate-300 flex flex-col shrink-0 hidden md:flex border-r border-slate-800/50 shadow-2xl z-20">
          <div className="p-8 pb-6">
            <div className="flex items-center gap-3 text-xl font-bold tracking-tight text-white mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              MedExam
            </div>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] ml-11">PATHOLOGY OS</p>
          </div>
          
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-3 px-4">WORKSPACE</p>
            <nav className="space-y-1">
              <button 
                onClick={() => setCurrentStep('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentStep === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Overview
              </button>
              <button 
                onClick={() => setCurrentStep('record')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${(currentStep === 'record' || currentStep === 'edit' || currentStep === 'report') ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Examination
              </button>
              <button 
                onClick={() => setCurrentStep('history')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentStep === 'history' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Case History
              </button>
            </nav>
          </div>

          <div className="p-4 mt-auto border-t border-slate-800/50">
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shadow-inner">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-200 truncate">{doctorName}</p>
                <p className="text-xs text-slate-500 truncate">Pathologist</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto px-6 py-8 md:px-12 md:py-10">
          <div className="max-w-6xl mx-auto">
            
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {currentStep === 'dashboard' ? 'Overview' : currentStep === 'history' ? 'Case History' : 'Clinical Examination'}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  {currentStep === 'dashboard' ? 'Monitor system activity and recent patient reports.' : currentStep === 'history' ? 'Review securely archived pathology reports.' : 'Record, transcribe, and generate structured clinical reports.'}
                </p>
              </div>
              {currentStep === 'dashboard' && (
                <button 
                  onClick={() => setCurrentStep('record')}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-all duration-200 shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  New Examination
                </button>
              )}
            </header>

            {currentStep === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Primary Action Card - Spans 2 cols */}
                <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-8 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-100 transition-colors duration-500"></div>
                  <div className="relative z-10 max-w-md">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 mb-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      System Online
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Ready for Transcription</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Initialize a new audio session to dictate your pathology findings. Our AI will automatically structure the transcription into a standard clinical report format.
                    </p>
                    <button 
                      onClick={() => setCurrentStep('record')}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Start Recording
                    </button>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Your Total Reports</p>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{reportsHistory.length}</h3>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      Recorded in system
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Avg. Generation Time</p>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">2.4<span className="text-lg text-slate-400 font-medium ml-1">sec</span></h3>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      Optimal latency
                    </p>
                  </div>
                </div>

                {/* Recent Reports List */}
                <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-0 overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Recent Cases</h3>
                    <button onClick={() => setCurrentStep('history')} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">View All Archive</button>
                  </div>
                  <div className="flex-1 overflow-auto max-h-[300px]">
                    {isLoadingHistory ? (
                      <div className="flex justify-center items-center h-full py-12">
                         <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    ) : reportsHistory.slice(0, 4).length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {reportsHistory.slice(0, 4).map((item, i) => (
                          <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{item.id}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{item.date}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              Completed
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-sm font-medium">No recent cases found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'history' && (
              <div className="animate-fade-in space-y-6">
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 p-8 min-h-[500px]">
                  {isLoadingHistory ? (
                     <div className="flex justify-center items-center h-full py-24">
                       <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                     </div>
                  ) : reportsHistory.length === 0 ? (
                    <div className="text-center py-24">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Reports Found</h3>
                      <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">You haven't generated any reports in the system yet. Start a new examination to create one.</p>
                      <button 
                        onClick={() => setCurrentStep('record')}
                        className="mt-6 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Start Examination
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {reportsHistory.map((item, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                          <div className="flex justify-between items-start p-5 bg-slate-50/50 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold text-slate-900 tracking-tight">{item.id}</h4>
                                <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded bg-blue-100 text-blue-700">Finalized</span>
                              </div>
                              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {item.date} <span className="text-slate-300">•</span> {item.doctor}
                              </p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                          </div>
                          <div className="p-6 bg-white max-h-64 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">{item.report}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(currentStep === 'record' || currentStep === 'edit' || currentStep === 'report') && (
              <div className="animate-fade-in w-full max-w-4xl mx-auto">
                {/* Minimal Progress Stepper */}
                <div className="mb-8 flex items-center justify-between px-4 sm:px-12 relative">
                  <div className="absolute left-[10%] right-[10%] top-1/2 h-[2px] bg-slate-200 -translate-y-1/2 z-0"></div>
                  <div 
                    className="absolute left-[10%] h-[2px] bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out"
                    style={{ width: currentStep === 'record' ? '0%' : currentStep === 'edit' ? '40%' : '80%' }}
                  ></div>

                  {[
                    { id: 'record', label: 'Dictate', step: 1 },
                    { id: 'edit', label: 'Review', step: 2 },
                    { id: 'report', label: 'Finalize', step: 3 }
                  ].map((s) => {
                    const isActive = currentStep === s.id;
                    const isPast = (currentStep === 'edit' && s.id === 'record') || 
                                   (currentStep === 'report' && (s.id === 'record' || s.id === 'edit'));
                    return (
                      <div key={s.id} className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                          isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-50' : 
                          isPast ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                          {isPast ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : s.step}
                        </div>
                        <span className={`mt-2 text-xs font-bold tracking-wide uppercase ${isActive ? 'text-blue-600' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8 sm:p-10 min-h-[500px]">
                  {currentStep === 'record' && (
                    <RecordingButton onRecordingComplete={handleRecordingComplete} />
                  )}

                  {currentStep === 'edit' && (
                    <TranscriptionEditor
                      transcription={transcription}
                      onEdit={handleTranscriptionEdit}
                      onGenerateReport={handleGenerateReport}
                      onBack={() => setCurrentStep('record')}
                    />
                  )}

                  {currentStep === 'report' && (
                    <ReportDisplay
                      transcription={transcription}
                      onStartOver={handleStartOver}
                      onReportSaved={handleReportSaved}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
