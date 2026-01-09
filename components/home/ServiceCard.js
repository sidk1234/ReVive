// Service card component for the home page.
//
// Displays a card with an icon, title, description and a call‑to‑action
// button.  Uses icons imported from the centralized icon registry instead of
// directly referencing `lucide-react`.

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import LiquidGlassButton from '../ui/LiquidGlassButton';
import { User, GraduationCap, Building2 } from '@/components/ui/icons';

const icons = {
  individuals: User,
  schools: GraduationCap,
  organizations: Building2
};

export default function ServiceCard({ type, title, description, buttonText, index = 0 }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const Icon = icons[type] || User;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative"
    >
      {/* Card */}
      <div
        className="relative h-full rounded-3xl p-8 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)`,
          boxShadow: isHovering
            ? `0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.15)`
            : '0 15px 40px -10px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Dynamic hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.1) 30%, transparent 60%)`
          }}
        />

        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Icon */}
        <motion.div
          className="relative mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="w-7 h-7 text-emerald-400" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>

        {/* Description */}
        <p className="text-white/60 leading-relaxed mb-8 text-sm md:text-base">{description}</p>

        {/* Button */}
        <LiquidGlassButton size="md">{buttonText}</LiquidGlassButton>

        {/* Corner accent */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 blur-2xl group-hover:scale-150 transition-transform duration-700" />
      </div>
    </motion.div>
  );
}