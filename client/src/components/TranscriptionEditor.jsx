import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const TranscriptionEditor = ({ transcription, onEdit, onGenerateReport, onBack }) => {
  const [editedText, setEditedText] = useState(transcription);
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => { setEditedText(transcription); }, [transcription]);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.te-header', { y: -15, autoAlpha: 0, duration: 0.5, ease: 'power3.out' });
        gsap.from('.te-editor', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
        gsap.from('.te-actions', { y: 15, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 });
        gsap.from('.te-tips', { y: 15, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.45 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setEditedText(newText);
    setHasChanges(newText !== transcription);
    onEdit(newText);
  };

  const handleReset = () => { setEditedText(transcription); setHasChanges(false); onEdit(transcription); };

  const handleGenerate = () => {
    if (editedText.trim().length === 0) { alert('Please provide some text to generate a report.'); return; }
    gsap.to(containerRef.current, { autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in', onComplete: onGenerateReport });
  };

  const wordCount = editedText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="te-header flex items-center justify-between border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white tracking-tight">Review Transcription</h2>
          <p className="text-base text-neutral-500 mt-2">Verify the transcribed text for accuracy.</p>
        </div>
        {hasChanges && (
          <span className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded">
            Edited
          </span>
        )}
      </div>

      <div className="te-editor space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="transcription-editor" className="text-sm font-medium text-neutral-400">Raw Transcription</label>
          <span className="text-xs text-neutral-600">{wordCount} words</span>
        </div>
        <textarea
          id="transcription-editor"
          value={editedText}
          onChange={handleTextChange}
          className="textarea-field min-h-[300px]"
          placeholder="Your transcription will appear here..."
          autoFocus
        />
      </div>

      <div className="te-actions flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1 sm:flex-initial text-base">
          &larr; Discard
        </button>
        {hasChanges && (
          <button onClick={handleReset} className="btn-secondary flex-1 sm:flex-initial text-base">Reset</button>
        )}
        <button onClick={handleGenerate} disabled={editedText.trim().length === 0} className="btn-primary flex-1 sm:ml-auto text-base">
          Generate Report
        </button>
      </div>

      <div className="te-tips border border-white/[0.04] rounded-lg p-4 mt-4">
        <p className="text-sm font-medium text-neutral-400 mb-2">Editing guidelines</p>
        <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside">
          <li>Verify spelling of anatomical and pathological terminology.</li>
          <li>Ensure numeric values and measurement units are accurate.</li>
          <li>AI handles formatting and sectioning in the next step.</li>
        </ul>
      </div>
    </div>
  );
};

export default TranscriptionEditor;
