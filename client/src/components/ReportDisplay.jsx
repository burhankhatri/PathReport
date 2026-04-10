import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportDisplay = ({ transcription, onStartOver, onReportSaved }) => {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-report', {
        transcription: transcription,
      });

      if (response.data.success && response.data.report) {
        setReport(response.data.report);
        if (onReportSaved) {
          onReportSaved(response.data.report);
        }
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await axios.post('/api/generate-pdf', {
        report: report,
        filename: `clinical-report-${new Date().toISOString().split('T')[0]}.pdf`,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clinical-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clinical-report-${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-[3px] border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-sm"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
               <svg className="w-3 h-3 text-blue-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Synthesizing Clinical Report</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">Our clinical AI is structuring your observations into a standardized medical format.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-red-800 font-bold mb-2 tracking-tight">Generation Failed</p>
          <p className="text-red-600/80 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={generateReport} className="btn-primary">Retry Generation</button>
            <button onClick={onStartOver} className="btn-secondary">Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Finalized Clinical Report</h2>
          <p className="text-sm text-slate-500 mt-1">Review your structured findings.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase bg-emerald-50 border border-emerald-100 text-emerald-700">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            Verified
          </span>
        </div>
      </div>

      {/* Report Display */}
      <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-8 max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
         <div className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-800">
          {report}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCopyToClipboard}
          className="btn-secondary group flex items-center justify-center"
        >
          <svg className="w-4 h-4 inline mr-2 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {copySuccess ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleDownloadText}
          className="btn-secondary group flex items-center justify-center"
        >
          <svg className="w-4 h-4 inline mr-2 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Download (.TXT)
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="btn-primary sm:col-span-2 flex items-center justify-center"
        >
          {isDownloadingPdf ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
          ) : (
             <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          )}
          {isDownloadingPdf ? 'Generating Secure PDF...' : 'Download Secure PDF'}
        </button>
      </div>

      {/* Start Over Button */}
      <div className="pt-6 mt-4 border-t border-slate-100 flex justify-between items-center">
        <p className="text-xs text-slate-400 font-medium max-w-xs">
          This report has been saved to your secure local session history.
        </p>
        <button
          onClick={onStartOver}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          New Examination
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;
