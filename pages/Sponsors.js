import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { Check } from '@/components/ui/icons';

// Sponsorship tier definitions. Each tier contains a name, price and a list of
// benefits. This data drives the cards rendered on the page. Prices and
// benefits mirror those shown on the original Base44 site.
const tiers = [
  {
    name: 'Bronze Partner',
    price: '$5,000/year',
    benefits: [
      'Logo on website footer',
      'Recognition in monthly newsletter',
      'Social media mention (quarterly)',
      'Certificate of partnership'
    ]
  },
  {
    name: 'Silver Partner',
    price: '$15,000/year',
    benefits: [
      'All Bronze benefits',
      'Logo on homepage',
      'Featured in annual impact report',
      'Social media mentions (monthly)',
      'Branded recycling hub at your location',
      'Quarterly impact reports'
    ]
  },
  {
    name: 'Gold Partner',
    price: '$50,000/year',
    mostPopular: true,
    benefits: [
      'All Silver benefits',
      'Premium homepage placement',
      'Speaking opportunities at events',
      'Co‑branded marketing campaigns',
      'Multiple branded recycling hubs',
      'Dedicated account manager',
      'Custom impact dashboard',
      'Press release for partnership'
    ]
  },
  {
    name: 'Platinum Partner',
    price: 'Custom',
    benefits: [
      'All Gold benefits',
      'Title sponsorship opportunities',
      'Board advisory position',
      'Custom sustainability programs',
      'Regional network of branded hubs',
      'Joint research initiatives',
      'Executive sustainability workshops',
      'Global impact partnership recognition'
    ]
  }
];

// Partner logos and levels. These are simple text representations rather than
// actual images to keep the bundle lightweight. In a real application you
// would replace these with SVG logos or image assets.
const partners = [
  { name: 'TechCorp Global', level: 'Gold' },
  { name: 'Green Solutions Inc.', level: 'Platinum' },
  { name: 'EcoBank', level: 'Silver' },
  { name: 'Future Foods', level: 'Gold' },
  { name: 'Clean Energy Co.', level: 'Silver' },
  { name: 'Sustainable Fashion', level: 'Bronze' }
];

export default function Sponsors() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Tagline */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl border border-white/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/90 text-sm font-medium">Partner with Us</span>
            </div>
            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Become a </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                ReVive Sponsor
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Partner with the world’s leading recycling network and showcase your commitment to environmental sustainability to millions globally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              {tier.mostPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs uppercase font-medium px-3 py-1 rounded-full bg-emerald-500 text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-3">{tier.name}</h3>
              <div className="text-xl text-emerald-400 font-semibold mb-4">{tier.price}</div>
              <ul className="space-y-3 mb-6">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-white/60">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <LiquidGlassButton size="md">Get Started</LiquidGlassButton>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Partners */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            <span className="text-white">Our </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Partners
            </span>
          </motion.h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Companies leading the way in environmental responsibility
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              {/* Placeholder circle for logo */}
              <div
                className="w-12 h-12 mb-4 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' }}
              >
                <span className="text-emerald-400 font-bold text-lg">
                  {partner.name.charAt(0)}
                </span>
              </div>
              <div className="font-semibold text-white mb-1">{partner.name}</div>
              <div
                className={`text-sm font-medium ${
                  partner.level === 'Platinum'
                    ? 'text-purple-400'
                    : partner.level === 'Gold'
                    ? 'text-yellow-400'
                    : partner.level === 'Silver'
                    ? 'text-slate-400'
                    : 'text-emerald-400'
                }`}
              >
                {partner.level}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div
            className="relative rounded-3xl p-12 md:p-16 backdrop-blur-2xl border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
            }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Contact us to discuss a custom sponsorship package that aligns with your sustainability goals.
            </p>
            <LiquidGlassButton size="lg">Contact Us</LiquidGlassButton>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}