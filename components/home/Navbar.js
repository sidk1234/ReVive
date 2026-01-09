// Navigation bar component
//
// This implementation is adapted from the original Base44 project.  It has
// been moved into the lower‑case `components` directory and updated to
// import its icons from the local icon collection.  The navigation links
// preserve their original casing (e.g. "/About"), and a new "Sponsors"
// item has been added to mirror the original site's menu.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import Link from 'next/link';
import Logo from './Logo';
import LiquidGlassButton from '../ui/LiquidGlassButton';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown
} from '@/components/ui/icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    // After logout, refresh the auth state
    setIsAuthenticated(false);
    setUser(null);
  };

  // List of top‑level navigation items.  The order and names here
  // determine both the desktop and mobile menus.  Adding "Sponsors"
  // ensures the sponsor page is reachable from the header.
  const navItems = ['About', 'Impact', 'Locations', 'Community', 'Sponsors'];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`relative flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500 ${
              scrolled ? 'backdrop-blur-2xl' : 'backdrop-blur-sm'
            }`}
            style={{
              background: scrolled
                ? 'linear-gradient(135deg, rgba(30, 58, 95, 0.8) 0%, rgba(10, 22, 40, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 0.4) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: scrolled ? '0 10px 40px rgba(0, 0, 0, 0.3)' : 'none'
            }}
          >
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

            {/* Logo */}
            {/* Wrap the logo in a Link so clicking it navigates to the home page. */}
            <Link href={createPageUrl('Home')} className="flex items-center">
              <Logo size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.a
                  key={item}
                  href={createPageUrl(item)}
                  className="text-white/70 hover:text-white text-sm font-medium transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="text-white text-sm">{user.full_name || 'User'}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/60 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden z-50"
                        style={{
                          background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%)'
                        }}
                      >
                        <div className="p-4 border-b border-white/10">
                          <div className="font-semibold text-white">{user.full_name}</div>
                          <div className="text-xs text-white/50">{user.email}</div>
                          <div className="text-xs text-emerald-400 mt-1">
                            {(user.total_recycled || 0).toFixed(1)} kg recycled
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href={createPageUrl('MyImpact')}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="text-sm">My Impact</span>
                          </Link>
                          <Link
                            href={createPageUrl('Profile')}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span className="text-sm">Profile</span>
                          </Link>
                        </div>

                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <LiquidGlassButton size="sm" onClick={() => base44.auth.redirectToLogin()}>
                  Join ReVive
                </LiquidGlassButton>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white/70 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-24 left-6 right-6 z-40 md:hidden"
      >
        <div
          className="rounded-2xl p-6 backdrop-blur-2xl border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%)'
          }}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item}
                href={createPageUrl(item)}
                className="text-white/70 hover:text-white text-lg font-medium py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10">
              {isAuthenticated && user ? (
                <>
                  <div className="mb-4 p-4 rounded-xl bg-white/5">
                    <div className="font-semibold text-white">{user.full_name}</div>
                    <div className="text-xs text-white/50">{user.email}</div>
                    <div className="text-xs text-emerald-400 mt-1">
                      {(user.total_recycled || 0).toFixed(1)} kg recycled
                    </div>
                  </div>
                  <Link
                    href={createPageUrl('MyImpact')}
                    className="block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LiquidGlassButton size="md" className="w-full">
                      <LayoutDashboard className="w-4 h-4" />
                      My Impact
                    </LiquidGlassButton>
                  </Link>
                  <Link
                    href={createPageUrl('Profile')}
                    className="block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LiquidGlassButton size="md" className="w-full !bg-transparent">
                      <User className="w-4 h-4" />
                      Profile
                    </LiquidGlassButton>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-6 py-3 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <LiquidGlassButton size="md" className="w-full" onClick={() => base44.auth.redirectToLogin()}>
                  Join ReVive
                </LiquidGlassButton>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}