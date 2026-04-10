import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onGetStarted }) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroCTARef = useRef(null);
  const badgeRef = useRef(null);
  const problemRef = useRef(null);
  const stepsRef = useRef(null);
  const solutionRef = useRef(null);
  const ctaRef = useRef(null);
  const footerRef = useRef(null);
  const cursorGlowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cursor glow follow
      const glowEl = cursorGlowRef.current;
      const handleMouseMove = (e) => {
        gsap.to(glowEl, { x: e.clientX - 400, y: e.clientY - 400, duration: 1, ease: 'power2.out' });
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Subtle floating orbs
      gsap.to('.orb-1', { x: 60, y: -40, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.orb-2', { x: -50, y: 30, duration: 16, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      // Nav
      gsap.from(navRef.current, { y: -20, autoAlpha: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });

      // Badge
      gsap.from(badgeRef.current, { autoAlpha: 0, y: 10, duration: 0.6, ease: 'power3.out', delay: 0.3 });

      // Hero title lines
      const titleLines = heroTitleRef.current.querySelectorAll('.hero-line');
      gsap.from(titleLines, {
        y: 60, autoAlpha: 0,
        duration: 1, stagger: 0.12, ease: 'power4.out', delay: 0.4
      });

      // Subtitle
      gsap.from(heroSubRef.current, { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out', delay: 0.9 });

      // CTA
      gsap.from(heroCTARef.current.children, {
        y: 15, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 1.1
      });

      // Scroll sections
      gsap.from(problemRef.current, {
        scrollTrigger: { trigger: problemRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out'
      });

      gsap.from(stepsRef.current.querySelector('.steps-header'), {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out'
      });

      const stepCards = stepsRef.current.querySelectorAll('.step-card');
      gsap.from(stepCards, {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 72%', toggleActions: 'play none none reverse' },
        y: 50, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out'
      });

      gsap.from(solutionRef.current, {
        scrollTrigger: { trigger: solutionRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out'
      });

      const featureItems = solutionRef.current.querySelectorAll('.feature-item');
      gsap.from(featureItems, {
        scrollTrigger: { trigger: solutionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
        y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
      });

      gsap.from(ctaRef.current, {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out'
      });

      gsap.from(footerRef.current, {
        scrollTrigger: { trigger: footerRef.current, start: 'top 95%', toggleActions: 'play none none reverse' },
        y: 15, autoAlpha: 0, duration: 0.6, ease: 'power3.out'
      });

      // Parallax orbs
      gsap.to('.orb-1', {
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
        y: -150
      });
      gsap.to('.orb-2', {
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
        y: -200
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A0A] relative overflow-x-hidden noise-overlay">
      {/* Cursor glow */}
      <div ref={cursorGlowRef} className="fixed w-[800px] h-[800px] rounded-full pointer-events-none z-0 hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      {/* Orbs — very muted */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-1 absolute w-[600px] h-[600px] bg-white/[0.02] top-[-15%] left-[-10%]" />
        <div className="orb orb-2 absolute w-[500px] h-[500px] bg-white/[0.015] top-[40%] right-[-12%]" />
      </div>

      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />

      {/* Nav */}
      <nav ref={navRef} className="relative z-20 px-8 py-8 md:px-20 flex items-center justify-between max-w-[1400px] mx-auto">
        <span className="text-xl font-semibold text-white tracking-tight">PathReport</span>
        <button onClick={onGetStarted} className="text-base font-medium text-neutral-400 hover:text-white transition-colors duration-200">
          Get Started &rarr;
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-8 md:px-20 pt-32 pb-44 max-w-[1400px] mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <div ref={badgeRef} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-neutral-400 mb-14">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            AI-Powered Pathology Reporting
          </div>

          <div ref={heroTitleRef}>
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tight leading-[1.02] mb-10">
              <span className="hero-line block text-white">Speak what you see.</span>
              <span className="hero-line block text-neutral-400">Get the report instantly.</span>
            </h1>
          </div>

          <p ref={heroSubRef} className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-14">
            Dictate your findings while looking through the microscope. PathReport transcribes and structures them into a clinical report automatically.
          </p>

          <div ref={heroCTARef} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button onClick={onGetStarted} className="bg-white text-[#0A0A0A] px-10 py-4.5 rounded-lg font-medium text-base hover:bg-neutral-200 transition-colors duration-200">
              Start Reporting
            </button>
            <a href="#how-it-works" className="text-neutral-500 font-medium text-base hover:text-neutral-300 transition-colors duration-200">
              How it works &darr;
            </a>
          </div>
        </div>

        <div className="mt-44 mx-auto max-w-3xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* The Problem */}
      <section ref={problemRef} className="relative z-10 px-8 md:px-20 py-32 max-w-[1400px] mx-auto">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-8">The Problem</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white tracking-tight leading-snug mb-8">
            Critical findings slip between the microscope and the keyboard.
          </h2>
          <p className="text-neutral-400 leading-relaxed text-lg max-w-3xl">
            When examining a specimen, you mentally catalog dozens of findings — cell morphology, staining patterns, abnormalities. Then you look away and start writing. By the time you're typing, subtle details slip. You go back and forth, microscope to keyboard, trying to reconstruct what you just saw.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section ref={stepsRef} id="how-it-works" className="relative z-10 px-8 md:px-20 py-32 max-w-[1400px] mx-auto">
        <div className="steps-header max-w-4xl mx-auto mb-20">
          <p className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-8">How It Works</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white tracking-tight leading-snug">
            Three steps. Eyes never leave the specimen.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {[
            { num: '01', title: 'Dictate', desc: 'Speak your observations while looking through the microscope. Describe what you see naturally.' },
            { num: '02', title: 'Transcribe', desc: 'A medical-grade speech model trained on clinical terminology converts your dictation to text.' },
            { num: '03', title: 'Generate', desc: 'AI structures your observations into a formatted pathology report — sectioned, precise, ready to use.' },
          ].map((step) => (
            <div key={step.num} className="step-card">
              <p className="text-sm font-medium text-neutral-600 tracking-widest mb-5">{step.num}</p>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{step.title}</h3>
              <p className="text-base text-neutral-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-3xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* The Solution */}
      <section ref={solutionRef} className="relative z-10 px-8 md:px-20 py-32 max-w-[1400px] mx-auto">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-8">The Result</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white tracking-tight leading-snug mb-8">
            No context switching. No forgotten findings.
          </h2>
          <p className="text-neutral-400 leading-relaxed text-lg mb-16 max-w-3xl">
            Eyes stay on the specimen, observations go straight into the report. PathReport eliminates the gap between what you see and what you document.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-14">
            {[
              { title: 'Real-time', desc: 'Reports generated in seconds' },
              { title: 'Medical-grade', desc: 'Trained on clinical terminology' },
              { title: 'Editable', desc: 'Review and refine before finalizing' },
            ].map((f) => (
              <div key={f.title} className="feature-item">
                <p className="text-lg font-semibold text-white mb-1">{f.title}</p>
                <p className="text-sm text-neutral-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative z-10 px-8 md:px-20 py-36 max-w-[1400px] mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-7">Ready to try it?</h2>
          <p className="text-neutral-500 text-lg mb-12">No sign-up required. Enter your name and start dictating.</p>
          <button onClick={onGetStarted} className="bg-white text-[#0A0A0A] px-12 py-5 rounded-lg font-medium text-lg hover:bg-neutral-200 transition-colors duration-200">
            Start Reporting
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="relative z-10 px-8 md:px-20 py-12 border-t border-white/[0.04] max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-600">PathReport</span>
          <p className="text-sm text-neutral-600">Powered by Deepgram & Claude</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
