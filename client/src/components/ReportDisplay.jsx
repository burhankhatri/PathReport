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
        filename: `pathology-report-${new Date().toISOString().split('T')[0]}.pdf`,
      }, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pathology-report-${Date.now()}.pdf`);
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
    link.setAttribute('download', `pathology-report-${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-indigo-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" 
              />
              <path 
                fillRule="evenodd" 
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Generating Your Report
          </p>
          <p className="text-sm text-gray-600">
            AI is formatting your observations into a professional medical report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-red-700 font-semibold mb-2">{error}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateReport} className="btn-primary flex-1">
            Try Again
          </button>
          <button onClick={onStartOver} className="btn-secondary flex-1">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Medical Report</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <svg 
              className="w-4 h-4 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            Generated
          </span>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">Report generated successfully!</span>
          <br />
          Review the formatted report below and download or copy as needed.
        </p>
      </div>

      {/* Report Display */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
          {report}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleCopyToClipboard}
          className="btn-secondary"
        >
          <svg 
            className="w-5 h-5 inline mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleDownloadText}
          className="btn-secondary"
        >
          <svg 
            className="w-5 h-5 inline mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Download as Text
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="btn-primary sm:col-span-2"
        >
          <svg 
            className="w-5 h-5 inline mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
          {isDownloadingPdf ? 'Generating PDF...' : 'Download as PDF'}
        </button>
      </div>

      {/* Start Over Button */}
      <div className="pt-4 border-t-2 border-gray-200">
        <button
          onClick={onStartOver}
          className="btn-secondary w-full"
        >
          <svg 
            className="w-5 h-5 inline mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Create New Report
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <p className="text-xs text-indigo-900">
          <span className="font-semibold">Note:</span> This report is generated for immediate use and is not stored on our servers. 
          Make sure to save a copy before creating a new report.
        </p>
      </div>
    </div>
  );
};

export default ReportDisplay;

