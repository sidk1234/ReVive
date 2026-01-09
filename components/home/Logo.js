// Logo component
// Moved from the original `Components` folder. Renders the ReVive logo with optional text.

import React from 'react';
import { motion } from 'framer-motion';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 32, text: 'text-xl' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 56, text: 'text-4xl' }
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.02 }}
    >
      {/* Logo Icon - Stylized Earth with Recycling */}
      <div className="relative" style={{ width: icon, height: icon }}>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 blur-lg" />

        {/* Main circle (Earth) */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)',
            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.2)'
          }}
        >
          {/* Recycling arrows - simplified modern design */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full p-2"
            fill="none"
          >
            {/* Three curved arrows forming a cycle */}
            <path d="M50 20 L60 35 L50 32 L40 35 Z" fill="rgba(255,255,255,0.9)" />
            <path
              d="M50 20 Q70 25 72 50"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            <path d="M75 55 L68 70 L65 58 L72 48 Z" fill="rgba(255,255,255,0.9)" />
            <path
              d="M72 50 Q70 75 45 80"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            <path d="M35 75 L22 72 L32 62 L42 70 Z" fill="rgba(255,255,255,0.9)" />
            <path
              d="M45 80 Q20 75 28 50 Q32 35 50 20"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Orbital accent */}
        <motion.div
          className="absolute inset-[-4px] rounded-full border border-emerald-400/30"
          style={{ transform: 'rotateX(75deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`font-bold tracking-tight ${text}`}
          style={{
            background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 50%, #60A5FA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          ReVive
        </span>
      )}
    </motion.div>
  );
}