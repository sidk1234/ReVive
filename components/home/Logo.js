// Logo component
// Moved from the original `Components` folder. Renders the ReVive logo with optional text.

import React from 'react';
import { motion } from 'framer-motion';
import reviveLogo from '../../media/ReViveLogo.png';

export default function Logo({ size = 'md', showText = false }) {
  const sizes = {
    sm: { height: 32, text: 'text-xl' },
    md: { height: 40, text: 'text-2xl' },
    lg: { height: 56, text: 'text-4xl' }
  };

  const { height, text } = sizes[size] || sizes.md;

  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.02 }}
    >
      <img
        src={reviveLogo.src}
        alt="ReVive"
        style={{ height, width: 'auto' }}
      />

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
