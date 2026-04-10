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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Review Transcription</h2>
        {hasChanges && (
          <span className="text-sm text-amber-600 font-medium">
            • Unsaved changes
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">Review and edit your transcription</span>
          <br />
          Correct any errors or add additional details before generating the final report.
        </p>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="transcription-editor" className="block text-sm font-medium text-gray-700">
            Transcription
          </label>
          <span className="text-xs text-gray-500">
            {wordCount} words
          </span>
        </div>
        
        <textarea
          id="transcription-editor"
          value={editedText}
          onChange={handleTextChange}
          className="textarea-field min-h-[300px] font-mono text-sm"
          placeholder="Your transcription will appear here..."
          autoFocus
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="btn-secondary flex-1 sm:flex-initial"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Recording
        </button>

        {hasChanges && (
          <button
            onClick={handleReset}
            className="btn-secondary flex-1 sm:flex-initial"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Reset Changes
          </button>
        )}

        <button
          onClick={handleGenerate}
          disabled={editedText.trim().length === 0}
          className="btn-primary flex-1"
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Generate Medical Report
        </button>
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <h3 className="font-semibold text-indigo-900 mb-2 text-sm">Editing Tips:</h3>
        <ul className="text-xs text-indigo-800 space-y-1 list-disc list-inside">
          <li>Check for any misheard medical terms</li>
          <li>Ensure percentages and measurements are accurate</li>
          <li>Add any observations you may have forgotten to mention</li>
          <li>Remove any filler words or irrelevant content</li>
        </ul>
      </div>
    </div>
  );
};

export default TranscriptionEditor;

