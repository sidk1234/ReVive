import React from "react";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import LiquidGlassButton from "../components/ui/LiquidGlassButton";

export default function DemoPage() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)",
      }}
    >
      <Navbar />

      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
                ReVive App Demo
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-bold">
                See ReVive in action
              </h1>
              <p className="mt-4 text-white/70 leading-relaxed">
                The ReVive PWA matches the native iOS experience with Konsta UI, Framework7 routing,
                and the same recycling intelligence flows. Use the demo previews below or jump
                directly into the app.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a href="/app">
                  <LiquidGlassButton size="lg">Get Started</LiquidGlassButton>
                </a>
                <a href="/app">
                  <LiquidGlassButton size="lg" className="!bg-transparent">
                    Open App
                  </LiquidGlassButton>
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Capture + Select",
                  "Impact Timeline",
                  "Leaderboard",
                  "Settings",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-white/80"
                  >
                    <div className="h-28 rounded-xl bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent" />
                    <div className="mt-3 font-medium text-white">{label}</div>
                    <div className="text-xs text-white/60">
                      Preview coming from production PWA.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Installable PWA",
              copy: "Runs full-screen on iOS and Android with offline protection.",
            },
            {
              title: "Local Rules",
              copy: "ZIP-aware web search ensures decisions match your municipality.",
            },
            {
              title: "Shared Impact",
              copy: "Public leaderboard highlights community recycling progress.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-white/70 leading-relaxed">{card.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
