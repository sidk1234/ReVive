import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

export default function Terms() {
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
              ReVive Terms of Service
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold">ReVive Terms of Service</h1>
            <p className="mt-2 text-white/60">Last updated: January 2026</p>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <p className="text-white/70 leading-relaxed">
                By using ReVive, you agree to these Terms of Service.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
              <p className="text-white/70 leading-relaxed">
                ReVive provides an online platform that allows users to log in with Google and participate
                in environmental programs, including tracking recycling and sustainability activities.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Accounts</h2>
              <p className="text-white/70 leading-relaxed">
                You must sign in using a Google account to use ReVive. You are responsible for all
                activity under your account.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <p className="text-white/70 mb-4">You agree not to:</p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Abuse or attempt to break the service</li>
                <li>Use ReVive for illegal purposes</li>
                <li>Interfere with other users</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Data &amp; Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                Your use of ReVive is governed by our Privacy Policy. We only collect limited Google
                account data needed to provide the service. See the Privacy Policy for more details.
              </p>
            </div>

            {/* Public leaderboard disclosure */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Public Leaderboard</h2>
              <p className="text-white/70 leading-relaxed">
                ReVive displays a public leaderboard showing each participant’s display name and aggregated recycling statistics (such as total points, number of scans and recyclable count). By using ReVive you consent to the publication of this information.  If you wish to opt&#45;out you may change your display name or delete your account at any time.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">No Warranty</h2>
              <p className="text-white/70 leading-relaxed">
                ReVive is provided "as is" without warranties of any kind.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-white/70 leading-relaxed">
                We may suspend or terminate accounts that violate these terms.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-white/70">For questions:</p>
              <p className="mt-4 text-emerald-300">reviveearthnonprofit@googlegroups.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
