import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedEarth from '../components/home/AnimatedEarth';
import RecyclingCounter from '../components/home/RecyclingCounter';
import ServiceCard from '../components/home/ServiceCard';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { ArrowDown, Leaf, Globe2, Users } from '@/components/ui/icons';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -100]);

  const services = [
    {
      type: 'individuals',
      title: 'Individuals',
      description: 'Set up your personal ReVive ID. Track every kilogram you drop off and watch your personal counter grow alongside Earth\'s. Great for households and roommates.',
      buttonText: 'Create ID'
    },
    {
      type: 'schools',
      title: 'Schools',
      description: 'Launch a campus ReVive hub. Turn recycling into a living science project. Run competitions between classes and stream your live counter in the hallway.',
      buttonText: 'Start a hub'
    },
    {
      type: 'organizations',
      title: 'Organizations',
      description: 'Partner as a ReVive node. Plug your business into our logistics map, host a collection point, and showcase certified impact to your team and customers.',
      buttonText: 'Partner with ReVive'
    }
  ];

  const stats = [
    { icon: Leaf, value: '2.8M+', label: 'Kilograms Recycled' },
    { icon: Globe2, value: '1,200+', label: 'Drop-off Locations' },
    { icon: Users, value: '50K+', label: 'Active Members' }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-slate-950 text-white overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      {/* Animated Earth Background */}
      <AnimatedEarth />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-xl border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400/90 text-sm font-medium">Global Recycling Network</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">Give Earth a</span>
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 50%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Second Chance
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Join the movement reshaping how the world recycles. Track your impact, 
            connect with your community, and watch the change unfold in real-time.
          </motion.p>

          {/* Counter */}
          <RecyclingCounter targetValue={2847563} />

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <LiquidGlassButton size="lg">
              Start Recycling
            </LiquidGlassButton>
            <LiquidGlassButton size="lg" className="!bg-transparent">
              Find a Location
            </LiquidGlassButton>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <stat.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-white">How will </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                you
              </span>
              <span className="text-white"> make an impact?</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Whether you're an individual, school, or organization — there's a place for you in the ReVive ecosystem.
            </p>
          </motion.div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.type}
                {...service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div 
            className="relative rounded-3xl p-12 md:p-16 backdrop-blur-2xl border border-white/10 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
              boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.5), 0 0 80px rgba(16, 185, 129, 0.1)'
            }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to make a difference?
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                Every piece of waste diverted from landfills is a victory for our planet. 
                Start your journey with ReVive today.
              </p>
              <LiquidGlassButton size="lg">
                Join the Movement
              </LiquidGlassButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
