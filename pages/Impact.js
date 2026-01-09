import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { TrendingUp, Leaf, Droplets, Wind, TreePine, Factory } from '@/components/ui/icons';

export default function Impact() {
  const stats = [
    { icon: Leaf, value: '2,847,563', label: 'Kilograms Recycled', color: 'emerald' },
    { icon: TreePine, value: '14,238', label: 'Trees Saved', color: 'green' },
    { icon: Droplets, value: '8.5M', label: 'Liters Water Conserved', color: 'cyan' },
    { icon: Wind, value: '1,234', label: 'Tons CO₂ Prevented', color: 'blue' },
  ];

  const materials = [
    { name: 'Plastic', percentage: 35, color: 'from-blue-500 to-cyan-500', amount: '996,647 kg' },
    { name: 'Paper', percentage: 28, color: 'from-emerald-500 to-green-500', amount: '797,318 kg' },
    { name: 'Metal', percentage: 20, color: 'from-slate-400 to-slate-600', amount: '569,513 kg' },
    { name: 'Glass', percentage: 12, color: 'from-cyan-400 to-blue-400', amount: '341,708 kg' },
    { name: 'Electronics', percentage: 5, color: 'from-purple-500 to-indigo-500', amount: '142,378 kg' },
  ];

  const impacts = [
    {
      icon: Factory,
      title: 'Manufacturing Impact',
      description: 'Reduced demand for virgin material production',
      stat: '45% less energy used'
    },
    {
      icon: Droplets,
      title: 'Water Conservation',
      description: 'Millions of liters saved through recycling',
      stat: '8.5M liters saved'
    },
    {
      icon: Wind,
      title: 'Carbon Reduction',
      description: 'Greenhouse gas emissions prevented',
      stat: '1,234 tons CO₂'
    },
    {
      icon: TreePine,
      title: 'Forest Protection',
      description: 'Trees preserved by reducing paper demand',
      stat: '14,238 trees saved'
    }
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
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl" />
        
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
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/90 text-sm font-medium">Real-Time Impact</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Measuring </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Real Change
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Every kilogram matters. See the tangible environmental impact 
              our global community creates together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Breakdown */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Materials </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Breakdown
              </span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              See what materials our community is recycling most
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
            }}
          >
            {materials.map((material, index) => (
              <div key={material.name} className="mb-8 last:mb-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold text-lg">{material.name}</span>
                  <div className="text-right">
                    <div className="text-white font-bold">{material.percentage}%</div>
                    <div className="text-white/50 text-sm">{material.amount}</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${material.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${material.color} rounded-full`}
                    style={{
                      boxShadow: `0 0 20px ${material.color.includes('blue') ? 'rgba(59, 130, 246, 0.5)' : 
                                            material.color.includes('emerald') ? 'rgba(16, 185, 129, 0.5)' : 
                                            material.color.includes('slate') ? 'rgba(148, 163, 184, 0.5)' : 
                                            material.color.includes('cyan') ? 'rgba(6, 182, 212, 0.5)' : 
                                            'rgba(168, 85, 247, 0.5)'}`
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Impact Details */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Environmental </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Benefits
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impacts.map((impact, index) => (
              <motion.div
                key={impact.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/10"
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
                  <impact.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{impact.title}</h3>
                <p className="text-white/60 mb-4 leading-relaxed">{impact.description}</p>
                <div className="text-emerald-400 font-bold text-xl">{impact.stat}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
