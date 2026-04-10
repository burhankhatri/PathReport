import React, { useState, useEffect } from 'react';

const TranscriptionEditor = ({ transcription, onEdit, onGenerateReport, onBack }) => {
  const [editedText, setEditedText] = useState(transcription);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedText(transcription);
  }, [transcription]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setEditedText(newText);
    setHasChanges(newText !== transcription);
    onEdit(newText);
  };

  const handleReset = () => {
    setEditedText(transcription);
    setHasChanges(false);
    onEdit(transcription);
  };

  const handleGenerate = () => {
    if (editedText.trim().length === 0) {
      alert('Please provide some text to generate a report.');
      return;
    }
    onGenerateReport();
  };

  const wordCount = editedText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Transcription</h2>
          <p className="text-sm text-slate-500 mt-1">Please verify the transcribed text for accuracy.</p>
        </div>
        {hasChanges && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200/50">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="transcription-editor" className="block text-sm font-semibold text-slate-700">
            Raw Transcription Data
          </label>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            {wordCount} words
          </span>
        </div>
        
        <textarea
          id="transcription-editor"
          value={editedText}
          onChange={handleTextChange}
          className="textarea-field min-h-[300px] font-mono text-sm leading-relaxed"
          placeholder="Your transcription will appear here..."
          autoFocus
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onBack}
          className="btn-secondary flex-1 sm:flex-initial"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Discard & Rerecord
        </button>

        {hasChanges && (
          <button
            onClick={handleReset}
            className="btn-secondary flex-1 sm:flex-initial"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </button>
        )}

        <button
          onClick={handleGenerate}
          disabled={editedText.trim().length === 0}
          className="btn-primary flex-1 sm:ml-auto"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Generate Structured Report
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-4">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-semibold text-blue-900 text-sm mb-1">Clinical Editing Guidelines</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Verify correct spelling of complex anatomical and pathological terminology.</li>
            <li>Ensure numeric values and specific measurement units are accurate.</li>
            <li>The AI will automatically handle formatting and sectioning in the next step.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionEditor;
