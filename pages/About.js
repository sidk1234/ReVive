import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { Target, Eye, Heart } from '@/components/ui/icons';

export default function About() {
  // Note: The original Base44 about page did not include a separate core values
  // section.  We removed the values array and the corresponding UI section to
  // match the design of the base site.
  const timeline = [
    { year: '2020', title: 'The Beginning', description: 'Founded with a vision to revolutionize recycling' },
    { year: '2021', title: 'First 100 Hubs', description: 'Expanded to 100 collection points across 5 countries' },
    { year: '2022', title: '1M Kilograms', description: 'Reached our first million kilograms recycled' },
    { year: '2023', title: 'Global Network', description: 'Connected 1,000+ locations worldwide' },
    { year: '2024', title: 'The Future', description: 'Aiming for 10M kg and expanding to new continents' }
  ];

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
              }}
            >
              <Heart className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/90 text-sm font-medium">Our Story</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Building a </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Circular Future
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              ReVive was born from a simple belief: every piece of waste has potential. 
              We're not just recycling—we're reimagining how humanity interacts with resources.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Target className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed">
                To create the world's most transparent and accessible recycling network, 
                empowering individuals and organizations to track their environmental impact in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Eye className="w-7 h-7 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-white/60 leading-relaxed">
                A world where waste doesn't exist—only resources in transition. 
                Where every person can see their contribution to planetary health, measured in real kilograms.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values section removed to match the original Base44 design */}
      {/* Timeline */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Our </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Journey
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-cyan-500/50 to-blue-500/50" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 z-10" />

                  {/* Content */}
                  <div className={`flex-1 ml-20 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                      }}
                    >
                      <div className="text-emerald-400 font-bold text-2xl mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/60">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
              Join Our Mission
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Be part of the movement reshaping how the world recycles.
            </p>
            <LiquidGlassButton size="lg">
              Get Started
            </LiquidGlassButton>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
