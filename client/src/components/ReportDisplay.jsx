import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';

const ReportDisplay = ({ transcription, onStartOver, onReportSaved }) => {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => { generateReport(); }, []);

  useEffect(() => {
    if (report && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.rd-header', { y: -15, autoAlpha: 0, duration: 0.5, ease: 'power3.out' });
        gsap.from('.rd-report', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
        gsap.from('.rd-action', { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', delay: 0.35 });
        gsap.from('.rd-footer', { autoAlpha: 0, duration: 0.4, ease: 'power3.out', delay: 0.6 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [report]);

  const generateReport = async () => {
    setIsLoading(true); setError('');
    try {
      const response = await axios.post('/api/generate-report', { transcription });
      if (response.data.success && response.data.report) {
        const reportText = response.data.report;
        const refusalPhrases = ['cannot create', 'unable to create', 'cannot generate', 'unable to generate', 'impossible to determine', 'not enough information', 'insufficient', 'please provide a clearer'];
        if (refusalPhrases.some(phrase => reportText.toLowerCase().includes(phrase))) {
          setError('Your transcription didn\'t contain enough clinical detail. Try recording again with specific observations.');
          return;
        }
        setReport(reportText);
        if (onReportSaved) onReportSaved(reportText);
      } else setError('Failed to generate report. Please try again.');
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate report. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleCopyToClipboard = async () => {
    try { await navigator.clipboard.writeText(report); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 3000); }
    catch (err) { console.error('Failed to copy:', err); }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await axios.post('/api/generate-pdf', { report, filename: `clinical-report-${new Date().toISOString().split('T')[0]}.pdf` }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `clinical-report-${Date.now()}.pdf`);
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { console.error('PDF download error:', err); alert('Failed to generate PDF.'); }
    finally { setIsDownloadingPdf(false); }
  };

  const handleDownloadText = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.setAttribute('download', `clinical-report-${Date.now()}.txt`);
    document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-5">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-base font-medium text-white mb-1">Generating Report</p>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">Structuring your observations into a standardized clinical format.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <p className="text-base font-medium text-white mb-2">Generation Failed</p>
        <p className="text-sm text-neutral-500 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={generateReport} className="btn-primary text-sm">Retry</button>
          <button onClick={onStartOver} className="btn-secondary text-sm">Start Over</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="rd-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white tracking-tight">Clinical Report</h2>
          <p className="text-base text-neutral-500 mt-2">Review your structured findings.</p>
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase text-emerald-500">Verified</span>
      </div>

      <div className="rd-report bg-white/[0.015] border border-white/[0.04] rounded-lg p-6 sm:p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-neutral-300">{report}</pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={handleCopyToClipboard} className="rd-action btn-secondary text-base py-3.5">
          {copySuccess ? 'Copied' : 'Copy to Clipboard'}
        </button>
        <button onClick={handleDownloadText} className="rd-action btn-secondary text-base py-3.5">Download .TXT</button>
        <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="rd-action btn-primary sm:col-span-2 text-base py-3.5 flex items-center justify-center">
          {isDownloadingPdf && <div className="w-3.5 h-3.5 border-2 border-neutral-800/30 border-t-neutral-800 rounded-full animate-spin mr-2" />}
          {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="rd-footer pt-5 mt-3 border-t border-white/[0.04] flex justify-between items-center">
        <p className="text-xs text-neutral-600 max-w-xs">Saved to your session history.</p>
        <button onClick={onStartOver} className="text-sm font-medium text-neutral-500 hover:text-white transition-colors duration-200">
          New Examination &rarr;
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;
