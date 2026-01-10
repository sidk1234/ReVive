import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

export default function Policy() {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
              ReVive Privacy Policy
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold">ReVive Privacy Policy</h1>
            <p className="mt-2 text-white/60">Last updated: January 2026</p>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <p className="text-white/70 leading-relaxed">
                ReVive is a nonprofit organization dedicated to environmental sustainability. We provide
                digital tools that allow volunteers, schools, and community members to track recycling
                activity and participate in environmental programs.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                This Privacy Policy explains how ReVive collects, uses, and protects information when
                you sign in to ReVive using Google.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-white/70 mb-4">When you sign in with Google, ReVive receives only:</p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your Google profile picture (optional)</li>
              </ul>
              <p className="mt-4 text-white/70">
                We do not access your Google Drive, Gmail, contacts, calendar, or any other Google services.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-white/70 mb-4">We use your information only to:</p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Create and manage your ReVive account</li>
                <li>Identify you when you sign in</li>
                <li>Display your name or profile photo</li>
                <li>Associate your activity with your account</li>
              </ul>
              <p className="mt-4 text-white/70">We do not use your data for advertising or marketing.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Google API & Limited Use Compliance</h2>
              <p className="text-white/70 leading-relaxed">
                ReVive&#39;s use of information received from Google APIs complies with the Google API
                Services User Data Policy, including Limited Use requirements.
              </p>
              <p className="mt-4 text-white/70">
                Your data is used only to provide ReVive&#39;s functionality and is not transferred to third
                parties.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Data Storage & Security</h2>
              <p className="text-white/70 leading-relaxed">
                Your data is stored securely using industry-standard safeguards. We do not sell, share, or
                rent your data.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Data Deletion</h2>
              <p className="text-white/70 leading-relaxed">
                You may request deletion of your account and all associated data at any time by contacting:
              </p>
              <p className="mt-4 text-emerald-300">reviveearthnonprofit@googlegroups.com</p>
              <p className="mt-2 text-white/70">Your data will be permanently deleted.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Children&#39;s Privacy</h2>
              <p className="text-white/70">ReVive does not knowingly collect data from children under 13.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-white/70">For questions, contact:</p>
              <p className="mt-4 text-emerald-300">reviveearthnonprofit@googlegroups.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
