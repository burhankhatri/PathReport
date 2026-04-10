import React, { useState, useEffect } from 'react';
import RecordingButton from './components/RecordingButton';
import TranscriptionEditor from './components/TranscriptionEditor';
import ReportDisplay from './components/ReportDisplay';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const [doctorName, setDoctorName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const [currentStep, setCurrentStep] = useState('dashboard'); // dashboard, record, edit, report, history
  const [transcription, setTranscription] = useState('');
  const [report, setReport] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportsHistory, setReportsHistory] = useState([]);

  useEffect(() => {
    const storedName = localStorage.getItem('doctorName');
    if (storedName) {
      setDoctorName(storedName);
      setIsNameSet(true);
    }
    const storedHistory = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
    setReportsHistory(storedHistory);
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (doctorName.trim()) {
      localStorage.setItem('doctorName', doctorName.trim());
      setIsNameSet(true);
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

  const handleReportSaved = (newReportData) => {
    const newReport = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      report: newReportData,
      doctor: doctorName
    };
    const history = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
    const updatedHistory = [newReport, ...history];
    localStorage.setItem('reportsHistory', JSON.stringify(updatedHistory));
    setReportsHistory(updatedHistory);
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
  };

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sidebar-bg p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Pathology Examining Tool</h1>
            <p className="text-slate-500 mt-2 text-sm">Please enter your name to continue</p>
          </div>
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Reynolds"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
              Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-sidebar-bg p-4 sm:p-8 relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex w-full max-w-[1600px] h-[90vh] bg-sidebar-bg rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* Sidebar */}
        <aside className="w-[280px] bg-sidebar-bg text-white p-8 flex flex-col shrink-0 hidden md:flex">
          <div className="flex items-center gap-3 text-xl font-bold mb-12 text-indigo-50">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            PathologyOS
          </div>
          
          <div className="flex-1">
            <p className="text-xs font-semibold text-sidebar-muted tracking-wider mb-4">NAVIGATION</p>
            <nav className="space-y-2">
              <button 
                onClick={() => setCurrentStep('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${currentStep === 'dashboard' ? 'bg-sidebar-active text-white font-medium' : 'text-indigo-100/70 hover:bg-sidebar-active hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentStep('record')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${(currentStep === 'record' || currentStep === 'edit' || currentStep === 'report') ? 'bg-sidebar-active text-white font-medium' : 'text-indigo-100/70 hover:bg-sidebar-active hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                New Examination
              </button>
              <button 
                onClick={() => setCurrentStep('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${currentStep === 'history' ? 'bg-sidebar-active text-white font-medium' : 'text-indigo-100/70 hover:bg-sidebar-active hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Reports History
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-indigo-100/70 hover:bg-sidebar-active hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </nav>
          </div>

          <div className="mt-auto">
            <p className="text-xs font-semibold text-sidebar-muted tracking-wider mb-4">USER ACCOUNT</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-50">{doctorName}</p>
                <p className="text-xs text-sidebar-muted">Pathologist</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50/95 backdrop-blur-3xl rounded-l-[32px] sm:rounded-l-[40px] p-6 sm:p-10 overflow-y-auto w-full relative shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
          
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {currentStep === 'dashboard' ? 'Overview' : currentStep === 'history' ? 'Reports History' : 'Examination'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 'dashboard' ? 'Monitor system stats and recent records' : currentStep === 'history' ? 'Review past pathology reports' : 'Record, transcribe, and generate professional reports'}
              </p>
            </div>
            {currentStep === 'dashboard' && (
              <button 
                onClick={() => setCurrentStep('record')}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Exam
              </button>
            )}
          </header>

          {currentStep === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Stat Cards */}
              <div className="card flex flex-col justify-between">
                <p className="text-sm text-gray-500 font-medium mb-2">Total Transcriptions</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{reportsHistory.length > 0 ? reportsHistory.length + 1248 : 1248}</h3>
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  +{reportsHistory.length} recently
                </p>
              </div>
              <div className="card flex flex-col justify-between">
                <p className="text-sm text-gray-500 font-medium mb-2">Avg. Processing Time</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">2.4<span className="text-xl text-gray-400 font-normal ml-1">sec</span></h3>
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  0.3s faster than avg
                </p>
              </div>
              <div className="card flex flex-col justify-between">
                <p className="text-sm text-gray-500 font-medium mb-2">System Accuracy</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">99.2<span className="text-xl text-gray-400 font-normal ml-1">%</span></h3>
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  0.1% from last month
                </p>
              </div>

              {/* Big Donut/Status Card */}
              <div className="card col-span-1 lg:col-span-2 relative overflow-hidden bg-white border-none shadow-sm ring-1 ring-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Examinations</h3>
                  <button onClick={() => setCurrentStep('history')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
                </div>
                <div className="space-y-4">
                  {reportsHistory.slice(0, 3).length > 0 ? reportsHistory.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.id}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        Completed
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-gray-500">No recent reports yet.</div>
                  )}
                </div>
              </div>

              {/* Action Banner */}
              <div className="card bg-gradient-to-br from-indigo-500 to-blue-700 text-white border-none shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[250px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/20 rounded-full blur-xl translate-y-1/4 -translate-x-1/4"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-4 text-indigo-50">
                    <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                    System Active
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Ready to Record</h2>
                  <p className="text-indigo-100 text-sm mb-6">Start a new audio transcription to generate an AI-powered pathology report.</p>
                  <button 
                    onClick={() => setCurrentStep('record')}
                    className="w-full bg-white text-indigo-900 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    Start New Examination
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'history' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                {reportsHistory.length === 0 ? (
                  <div className="text-center py-20">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                    <p className="text-gray-500 mt-2">You haven't generated any reports yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {reportsHistory.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-indigo-900">{item.id}</h4>
                            <p className="text-sm text-gray-500">{item.date} • Created by {item.doctor}</p>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">Completed</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{item.report}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(currentStep === 'record' || currentStep === 'edit' || currentStep === 'report') && (
            <div className="max-w-4xl mx-auto w-full animate-fade-in">
              {/* Progress Stepper */}
              <div className="mb-12">
                <div className="flex items-center justify-center max-w-2xl mx-auto">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300
                      ${currentStep === 'record' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                      1
                    </div>
                    <span className={`mt-3 text-sm font-semibold ${currentStep === 'record' ? 'text-indigo-700' : 'text-gray-400'}`}>Record</span>
                  </div>
                  
                  <div className="flex-1 h-[2px] mx-4 bg-gray-200 relative top-[-14px]">
                    <div className={`h-full bg-indigo-500 transition-all duration-500 ${currentStep === 'edit' || currentStep === 'report' ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300
                      ${currentStep === 'edit' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : (currentStep === 'report' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border-2 border-gray-200')}`}>
                      {currentStep === 'report' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '2'}
                    </div>
                    <span className={`mt-3 text-sm font-semibold ${currentStep === 'edit' || currentStep === 'report' ? 'text-indigo-700' : 'text-gray-400'}`}>Review</span>
                  </div>
                  
                  <div className="flex-1 h-[2px] mx-4 bg-gray-200 relative top-[-14px]">
                    <div className={`h-full bg-indigo-500 transition-all duration-500 ${currentStep === 'report' ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300
                      ${currentStep === 'report' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                      3
                    </div>
                    <span className={`mt-3 text-sm font-semibold ${currentStep === 'report' ? 'text-indigo-700' : 'text-gray-400'}`}>Report</span>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
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
        </main>
      </div>
    </div>
  );
}

export default App;
