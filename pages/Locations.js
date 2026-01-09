import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { MapPin, Search, Clock, Phone, Navigation } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState('');

  const locations = [
    {
      name: 'ReVive Central Hub',
      address: '123 Green Street, San Francisco, CA 94102',
      hours: 'Mon-Sat: 8AM-8PM, Sun: 9AM-6PM',
      phone: '+1 (555) 123-4567',
      materials: ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics'],
      featured: true
    },
    {
      name: 'Downtown Collection Point',
      address: '456 Eco Avenue, New York, NY 10001',
      hours: 'Mon-Fri: 9AM-7PM, Sat-Sun: 10AM-5PM',
      phone: '+1 (555) 234-5678',
      materials: ['Plastic', 'Paper', 'Metal', 'Glass']
    },
    {
      name: 'East Side Recycling Center',
      address: '789 Sustainability Blvd, Austin, TX 78701',
      hours: 'Mon-Sun: 7AM-9PM',
      phone: '+1 (555) 345-6789',
      materials: ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics', 'Textiles']
    },
    {
      name: 'University Campus Hub',
      address: '321 College Road, Boston, MA 02115',
      hours: 'Mon-Fri: 8AM-10PM, Sat-Sun: 9AM-8PM',
      phone: '+1 (555) 456-7890',
      materials: ['Plastic', 'Paper', 'Electronics']
    },
    {
      name: 'Westside Green Station',
      address: '654 Ocean Drive, Los Angeles, CA 90001',
      hours: 'Daily: 8AM-8PM',
      phone: '+1 (555) 567-8901',
      materials: ['Plastic', 'Paper', 'Metal', 'Glass']
    },
    {
      name: 'North Point Collection',
      address: '987 Mountain View, Seattle, WA 98101',
      hours: 'Mon-Sat: 9AM-7PM',
      phone: '+1 (555) 678-9012',
      materials: ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics']
    }
  ];

  const regions = [
    { name: 'North America', count: 542 },
    { name: 'Europe', count: 387 },
    { name: 'Asia', count: 215 },
    { name: 'South America', count: 68 },
    { name: 'Africa', count: 34 },
    { name: 'Oceania', count: 24 }
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/90 text-sm font-medium">1,200+ Locations</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Find Your Nearest </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Drop-off Point
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-8">
              Join our global network of recycling hubs. Find a location near you and start making an impact today.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search by city, zip code, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 rounded-2xl backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Regional Stats */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)'
                }}
              >
                <div className="text-2xl font-bold text-white mb-1">{region.count}</div>
                <div className="text-white/50 text-sm">{region.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations List */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Featured Locations
              </span>
            </h2>
            <p className="text-white/60">Drop-off centers accepting materials near you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative backdrop-blur-xl rounded-3xl p-6 border border-white/10 group hover:border-emerald-500/30 transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                {location.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Featured
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-4 pr-20">{location.name}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-white/60">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm">{location.address}</span>
                  </div>
                  
                  <div className="flex items-start gap-3 text-white/60">
                    <Clock className="w-4 h-4 mt-1 flex-shrink-0 text-cyan-400" />
                    <span className="text-sm">{location.hours}</span>
                  </div>
                  
                  <div className="flex items-start gap-3 text-white/60">
                    <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-blue-400" />
                    <span className="text-sm">{location.phone}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Accepts</div>
                  <div className="flex flex-wrap gap-2">
                    {location.materials.map((material) => (
                      <span
                        key={material}
                        className="px-2 py-1 rounded-lg text-xs bg-white/5 text-white/70 border border-white/10"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                <LiquidGlassButton size="sm" className="w-full">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </LiquidGlassButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
              minHeight: '400px'
            }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            
            <div className="relative z-10">
              <MapPin className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">Interactive Map Coming Soon</h3>
              <p className="text-white/60 max-w-xl mx-auto mb-8">
                We're building an interactive map to help you find the perfect drop-off location. 
                Stay tuned for real-time availability and navigation.
              </p>
              <LiquidGlassButton size="lg">
                Request a New Location
              </LiquidGlassButton>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
