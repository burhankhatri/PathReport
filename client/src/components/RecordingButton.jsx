import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const RecordingButton = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      visualizeAudio();

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

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
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average);
    };

    animate();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.transcript) {
        onRecordingComplete(response.data.transcript);
      } else {
        setError('Transcription failed. Please try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err.response?.data?.error || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Recording Visualization */}
      <div className="relative mb-8">
        {/* Outer pulsing rings */}
        {isRecording && (
          <>
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-48 h-48 rounded-full bg-red-500"></div>
            </div>
            <div className="absolute inset-0 animate-pulse opacity-40">
              <div className="w-48 h-48 rounded-full bg-red-400"></div>
            </div>
          </>
        )}

        {/* Main button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative w-48 h-48 rounded-full flex items-center justify-center
            transform transition-all duration-300 shadow-2xl
            ${isRecording 
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 scale-100' 
              : 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:scale-105'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          `}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white mt-4 font-medium">Processing...</p>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-lg"></div>
              <p className="text-white mt-4 font-bold text-2xl">{formatTime(recordingTime)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg 
                className="w-20 h-20 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                  clipRule="evenodd" 
                />
              </svg>
              <p className="text-white mt-2 font-medium">Tap to Record</p>
            </div>
          )}
        </button>

        {/* Audio level indicator */}
        {isRecording && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-100"
                style={{ width: `${Math.min((audioLevel / 128) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Recording in progress...
            </p>
            <p className="text-sm text-gray-600">
              Speak your observations clearly. Tap the button again to stop.
            </p>
          </div>
        ) : isProcessing ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Transcribing your audio...
            </p>
            <p className="text-sm text-gray-600">
              This may take a few moments.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Ready to record
            </p>
            <p className="text-sm text-gray-600">
              Tap the microphone to start recording your observations.
              Speak clearly and naturally.
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl max-w-md">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tips */}
      {!isRecording && !isProcessing && (
        <div className="mt-8 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl max-w-md">
          <h3 className="font-semibold text-indigo-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Speak in a quiet environment</li>
            <li>Use medical terminology naturally</li>
            <li>Speak at a normal, steady pace</li>
            <li>Hold your microphone 6-8 inches from your mouth</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecordingButton;

