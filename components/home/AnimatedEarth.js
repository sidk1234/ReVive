// AnimatedEarth component
// This component renders an animated earth with orbiting rings and continental patterns.
// It has been moved from the original `Components` folder into the lower‑case `components` directory
// so that imports are case‑consistent on case‑sensitive file systems.

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function AnimatedEarth() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Earth moves up and slightly rotates as you scroll
  const y = useTransform(scrollY, [0, windowHeight * 2], [0, -300]);
  const rotate = useTransform(scrollY, [0, windowHeight * 3], [0, 45]);
  const scale = useTransform(scrollY, [0, windowHeight], [1, 1.2]);
  const opacity = useTransform(scrollY, [windowHeight * 1.5, windowHeight * 2.5], [1, 0.3]);

  return (
    <motion.div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
      style={{ y, rotate, scale, opacity }}
    >
      {/* Earth Container */}
      <div className="relative w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px]">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-blue-600/20 blur-3xl animate-pulse" />

        {/* Main Earth sphere */}
        <div
          className="absolute inset-8 md:inset-12 lg:inset-16 rounded-full overflow-hidden"
          style={{
            background: `\
              radial-gradient(circle at 30% 30%, 
                rgba(16, 185, 129, 0.9) 0%,
                rgba(6, 182, 212, 0.7) 25%,
                rgba(30, 64, 175, 0.8) 50%,
                rgba(15, 23, 42, 0.95) 100%)
            `,
            boxShadow: `\
              inset -30px -30px 60px rgba(0, 0, 0, 0.5),
              inset 20px 20px 40px rgba(52, 211, 153, 0.3),
              0 0 100px rgba(16, 185, 129, 0.3),
              0 0 200px rgba(6, 182, 212, 0.2)
            `
          }}
        >
          {/* Continental patterns - stylized */}
          <div className="absolute inset-0">
            {/* North America */}
            <div
              className="absolute top-[15%] left-[10%] w-[30%] h-[25%] rounded-full bg-emerald-400/40 blur-xl"
              style={{ clipPath: 'polygon(20% 0%, 80% 10%, 100% 60%, 70% 100%, 10% 80%)' }}
            />

            {/* South America */}
            <div
              className="absolute top-[45%] left-[20%] w-[15%] h-[35%] rounded-full bg-emerald-500/35 blur-lg"
              style={{ clipPath: 'polygon(30% 0%, 70% 5%, 60% 100%, 20% 90%)' }}
            />

            {/* Europe/Africa */}
            <div className="absolute top-[20%] left-[45%] w-[20%] h-[50%] rounded-full bg-teal-400/40 blur-xl" />

            {/* Asia */}
            <div
              className="absolute top-[10%] right-[10%] w-[35%] h-[40%] rounded-full bg-cyan-400/35 blur-xl"
              style={{ clipPath: 'polygon(0% 20%, 40% 0%, 100% 30%, 80% 100%, 20% 80%)' }}
            />

            {/* Australia */}
            <div className="absolute bottom-[20%] right-[15%] w-[15%] h-[15%] rounded-full bg-emerald-400/40 blur-lg" />
          </div>

          {/* Recycling symbol overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg viewBox="0 0 100 100" className="w-1/2 h-1/2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M50 15 L65 40 L50 35 L35 40 Z" />
              <path d="M75 60 L55 75 L60 60 L50 45 Z" />
              <path d="M25 60 L45 75 L40 60 L50 45 Z" />
            </svg>
          </div>

          {/* Atmosphere glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}
          />
        </div>

        {/* Orbital ring 1 */}
        <motion.div
          className="absolute inset-4 md:inset-6 rounded-full border border-emerald-500/20"
          style={{ transform: 'rotateX(75deg) rotateZ(15deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
        </motion.div>

        {/* Orbital ring 2 */}
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/15"
          style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50" />
        </motion.div>
      </div>
    </motion.div>
  );
}