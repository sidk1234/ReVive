// Animated counter for displaying the total weight recycled.
//
// This component animates from zero to a target value when it comes into view.
// It imports its icon from the central icon registry instead of directly
// referencing `lucide-react`.  The implementation is identical to the
// original Base44 component.

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp } from '@/components/ui/icons';

export default function RecyclingCounter({ targetValue = 2847563 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);
  const isInView = useInView(counterRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    setHasAnimated(true);

    const duration = 2500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(targetValue * eased);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, hasAnimated, targetValue]);

  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  return (
    <motion.div
      ref={counterRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Glass container */}
      <div
        className="relative backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 80px rgba(16, 185, 129, 0.1)`
        }}
      >
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Label */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400/80 text-sm md:text-base font-medium tracking-widest uppercase">
            Total Weight Recycled
          </span>
        </div>

        {/* Counter display */}
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span
            className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight tabular-nums"
            style={{
              background:
                'linear-gradient(180deg, #34D399 0%, #06B6D4 50%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(52, 211, 153, 0.5)'
            }}
          >
            {formatNumber(displayValue)}
          </span>
          {/* Unit */}
          <span className="text-2xl md:text-4xl lg:text-5xl font-light text-white/60 ml-2 md:ml-4">kg</span>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="text-center text-white/50 text-sm md:text-base mt-4"
        >
          and counting, thanks to our global community
        </motion.p>

        {/* Animated pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl border border-emerald-500/20"
          animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}