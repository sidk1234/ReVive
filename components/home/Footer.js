// Footer component
// This is the extended footer used across the site. It has been moved from the
// original `Components` folder into the lower‑case `components` directory and
// updated to import icons from the local icon collection.

import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { Mail, MapPin, Phone, ArrowUpRight } from '@/components/ui/icons';

export default function Footer() {
  const links = {
    company: ['About Us', 'Our Mission', 'Impact Report', 'Careers'],
    resources: ['How It Works', 'Drop-off Locations', 'Materials Guide', 'FAQs'],
    connect: ['Contact', 'Partner With Us', 'Press Kit', 'Blog']
  };

  return (
    <footer className="relative mt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Logo and description */}
          <div className="lg:col-span-4">
            <Logo size="md" />
            <p className="mt-6 text-white/50 leading-relaxed max-w-sm">
              Building a circular economy, one kilogram at a time. Join our global network of recyclers making real impact.
            </p>

            <div className="mt-8 space-y-3">
              <a href="#" className="flex items-center gap-3 text-white/50 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">hello@revive.earth</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-white/50 hover:text-emerald-400 transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">1,200+ locations worldwide</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                      >
                        {item}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-white/40 text-sm">
            © 2024 ReVive. Building tomorrow's world, today.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}