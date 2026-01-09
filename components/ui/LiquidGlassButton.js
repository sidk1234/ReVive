// LiquidGlassButton component
//
// A custom button used throughout the ReVive site.  It adds a subtle
// parallax “liquid glass” effect on hover and adapts its size based on
// the `size` prop (sm/md/lg).  This component was originally defined in
// the uppercase `Components` directory; it has been brought into the
// lower‑case `components/ui` folder so that all imports refer to a single
// source of truth.

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function LiquidGlassButton({ children, onClick, className = '', size = 'md' }) {
  const buttonRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        relative overflow-hidden rounded-2xl font-medium
        backdrop-blur-xl border border-white/20
        transition-all duration-300 ease-out
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: isHovering
          ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(16, 185, 129, 0.4) 0%,
              rgba(6, 182, 212, 0.3) 30%,
              rgba(30, 58, 95, 0.6) 70%,
              rgba(10, 22, 40, 0.8) 100%)`
          : 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
        boxShadow: isHovering
          ? `0 0 30px rgba(16, 185, 129, 0.3),
             0 0 60px rgba(6, 182, 212, 0.2),
             inset 0 1px 1px rgba(255, 255, 255, 0.1)`
          : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Liquid glass shine effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovering ? 0.6 : 0,
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(52, 211, 153, 0.5) 0%,
            transparent 50%)`
        }}
      />

      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Content */}
      <span className="relative z-10 text-white/90 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}