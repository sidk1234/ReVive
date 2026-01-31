import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import Link from 'next/link';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';

export default function Demo() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)',
      }}
    >
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
              ReVive PWA Demo
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold">Experience ReVive</h1>
            <p className="mt-2 text-white/60">
              Try our Progressive Web App - install it on your device for the best experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">📱 Installable PWA</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                ReVive works as a native app on iOS and Android. Install it to your home screen
                for a seamless, app-like experience.
              </p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Works offline</li>
                <li>Fast and responsive</li>
                <li>Native-feeling navigation</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">🤖 AI-Powered Recycling</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Use our intelligent assistant to identify items and get location-specific
                recycling guidance.
              </p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Photo or text input</li>
                <li>Local recycling rules</li>
                <li>Instant results</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">📊 Track Your Impact</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Monitor your recycling activity, see your environmental impact, and compete
                on the leaderboard.
              </p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Personal statistics</li>
                <li>Public leaderboard</li>
                <li>Badge system</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">🌍 Make a Difference</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Join thousands of users making a positive environmental impact through
                smarter recycling.
              </p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Community-driven</li>
                <li>Data-driven insights</li>
                <li>Real-world impact</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link href="/app">
              <LiquidGlassButton size="lg" className="text-lg px-8 py-4">
                Get Started
              </LiquidGlassButton>
            </Link>
            <p className="mt-4 text-white/60">
              Open the app to start scanning and tracking your recycling impact
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

