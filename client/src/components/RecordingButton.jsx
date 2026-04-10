import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';

const WAVEFORM_BAR_COUNT = 32;

const RecordingButton = ({ onRecordingComplete, onUseSample }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [waveformData, setWaveformData] = useState(new Array(WAVEFORM_BAR_COUNT).fill(0));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.rec-btn-main', { scale: 0, duration: 0.6, ease: 'back.out(1.4)', delay: 0.15 });
        gsap.from('.rec-instructions', { y: 15, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.4 });
        gsap.from('.rec-extras', { y: 20, autoAlpha: 0, duration: 0.5, ease: 'power3.out', delay: 0.6 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Pulse rings during recording
  useEffect(() => {
    if (isRecording) {
      gsap.to('.pulse-ring-1', { scale: 1.6, autoAlpha: 0, duration: 2, repeat: -1, ease: 'power2.out' });
      gsap.to('.pulse-ring-2', { scale: 1.8, autoAlpha: 0, duration: 2.5, repeat: -1, ease: 'power2.out', delay: 0.4 });
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 128;
      visualizeAudio();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
      };
      mediaRecorderRef.current.start();
      gsap.fromTo(buttonRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const visualizeAudio = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      analyserRef.current.getByteFrequencyData(dataArray);
      const step = Math.floor(bufferLength / WAVEFORM_BAR_COUNT);
      const bars = [];
      for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
        bars.push(sum / step / 255);
      }
      setWaveformData(bars);
    };
    animate();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setWaveformData(new Array(WAVEFORM_BAR_COUNT).fill(0));
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const response = await axios.post('/api/transcribe', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success && response.data.transcript) onRecordingComplete(response.data.transcript);
      else setError('Transcription failed. Please try again.');
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err.response?.data?.error || 'Failed to transcribe audio. Please try again.');
    } finally { setIsProcessing(false); setRecordingTime(0); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center py-12">
      {/* Waveform */}
      {isRecording && (
        <div className="flex items-center justify-center gap-[3px] h-20 mb-6 px-4">
          {waveformData.map((value, i) => (
            <div key={i} className="w-[2px] rounded-full bg-white/40 transition-all duration-75"
              style={{ height: `${Math.max(3, value * 64)}px`, opacity: 0.3 + value * 0.7 }} />
          ))}
        </div>
      )}

      {/* Button */}
      <div className="relative mb-8">
        {isRecording && (
          <>
            <div className="pulse-ring-1 absolute w-56 h-56 rounded-full border border-white/10" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <div className="pulse-ring-2 absolute w-56 h-56 rounded-full border border-white/5" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </>
        )}

        <button
          ref={buttonRef}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`rec-btn-main relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-300 will-change-transform border-2
            ${isRecording ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_100px_-10px_rgba(239,68,68,0.4)]' : 'bg-white/[0.05] border-white/15 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-[0_0_100px_-10px_rgba(255,255,255,0.25)]'}
            ${isProcessing ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
          `}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 border-[3px] border-white/10 border-t-white rounded-full animate-spin" />
              <p className="text-neutral-400 mt-4 text-sm">Processing...</p>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500 rounded-2xl" />
              <p className="text-white mt-4 font-mono text-2xl tabular-nums">{formatTime(recordingTime)}</p>
            </div>
          ) : (
            <svg className="w-28 h-28 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="rec-instructions text-center max-w-lg">
        {isRecording ? (
          <>
            <p className="text-xl font-medium text-white">Recording in progress</p>
            <p className="text-base text-neutral-500 mt-2">Speak clearly. Tap again to stop.</p>
          </>
        ) : isProcessing ? (
          <>
            <p className="text-xl font-medium text-white">Transcribing audio</p>
            <p className="text-base text-neutral-500 mt-2">This may take a few moments.</p>
          </>
        ) : (
          <>
            <p className="text-xl font-medium text-white">Tap to record</p>
            <p className="text-base text-neutral-500 mt-2">Begin dictating your observations.</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 border border-red-500/20 rounded-lg max-w-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!isRecording && !isProcessing && (
        <div className="rec-extras mt-10 space-y-5 w-full max-w-lg">
          <button onClick={onUseSample} className="w-full px-6 py-4 rounded-lg border border-dashed border-white/[0.08] text-neutral-500 text-base hover:bg-white/[0.02] hover:border-white/[0.12] transition-colors duration-200">
            Try with a sample transcription
          </button>
          <div className="p-6 border border-white/[0.04] rounded-lg">
            <p className="text-base font-medium text-neutral-400 mb-3">Tips for best results</p>
            <ul className="text-sm text-neutral-600 space-y-2 list-disc list-inside">
              <li>Speak in a quiet environment</li>
              <li>Use medical terminology naturally</li>
              <li>Speak at a normal, steady pace</li>
              <li>Hold your microphone 6-8 inches away</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingButton;
