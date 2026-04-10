import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0f172a]">
      {/* Dynamic Data Flow Lines */}
      <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Animated paths simulating data flow */}
        <g className="data-flow-paths">
          <path d="M-100 200 C 300 100, 600 400, 1500 200" fill="none" stroke="url(#flowGrad1)" strokeWidth="3" className="animate-flow-1" strokeDasharray="150 1500" />
          <path d="M-100 400 C 400 500, 500 100, 1500 300" fill="none" stroke="url(#flowGrad2)" strokeWidth="2" className="animate-flow-2" strokeDasharray="200 2000" />
          <path d="M-100 600 C 200 400, 800 600, 1500 500" fill="none" stroke="url(#flowGrad1)" strokeWidth="4" className="animate-flow-3" strokeDasharray="100 1800" />
          <path d="M-100 100 C 500 300, 700 50, 1500 400" fill="none" stroke="url(#flowGrad2)" strokeWidth="1.5" className="animate-flow-4" strokeDasharray="250 2500" />
        </g>
      </svg>
      
      {/* Floating particles */}
      <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-indigo-400 animate-float-slow opacity-40 blur-[1px]"></div>
      <div className="absolute top-[60%] left-[80%] w-3 h-3 rounded-full bg-indigo-300 animate-float-medium opacity-50 blur-[2px]"></div>
      <div className="absolute top-[80%] left-[30%] w-4 h-4 rounded-full bg-indigo-200 animate-float-fast opacity-30 blur-[3px]"></div>
      <div className="absolute top-[30%] left-[60%] w-1.5 h-1.5 rounded-full bg-indigo-200 animate-float-slow opacity-60"></div>
    </div>
  );
};

export default AnimatedBackground;
