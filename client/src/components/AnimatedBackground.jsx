import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
      {/* Very subtle, elegant gradient blurs for a clean clinical look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-50/40 blur-[100px] animate-float-slow"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-sky-100/40 blur-[100px] animate-float-medium"></div>
    </div>
  );
};

export default AnimatedBackground;
