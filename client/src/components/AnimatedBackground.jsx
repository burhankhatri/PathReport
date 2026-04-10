import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimatedBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.bg-orb-1', { x: 60, y: -30, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.bg-orb-2', { x: -40, y: 40, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="bg-orb-1 absolute w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[120px] top-[-10%] left-[-5%]" />
      <div className="bg-orb-2 absolute w-[500px] h-[500px] rounded-full bg-white/[0.01] blur-[100px] bottom-[-10%] right-[-8%]" />
      <div className="absolute inset-0 grid-pattern" />
    </div>
  );
};

export default AnimatedBackground;
