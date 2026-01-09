import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { Users, Trophy, Heart, MessageSquare, Star, Award } from '@/components/ui/icons';

export default function Community() {
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', amount: '3,456 kg', badge: 'Diamond', avatar: '🌟' },
    { rank: 2, name: 'Marcus Johnson', amount: '2,890 kg', badge: 'Platinum', avatar: '🔥' },
    { rank: 3, name: 'Elena Rodriguez', amount: '2,234 kg', badge: 'Gold', avatar: '✨' },
    { rank: 4, name: 'Green Valley High', amount: '1,987 kg', badge: 'Gold', avatar: '🏫' },
    { rank: 5, name: 'Tech Corp Inc.', amount: '1,654 kg', badge: 'Silver', avatar: '🏢' }
  ];

  const stories = [
    {
      author: 'Community Leader',
      name: 'The Martinez Family',
      story: 'Started with just household recycling, now running a neighborhood hub that processes 500kg monthly.',
      impact: '6,234 kg recycled',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      author: 'School Champion',
      name: 'Lincoln High School',
      story: 'Turned recycling into a school-wide competition. Now they\'re the top educational hub in their state.',
      impact: '12,456 kg recycled',
      icon: '🎓'
    },
    {
      author: 'Business Partner',
      name: 'EcoTech Solutions',
      story: 'Integrated ReVive into their office culture. Employees compete monthly for the "Green Champion" title.',
      impact: '8,932 kg recycled',
      icon: '💼'
    }
  ];

  const achievements = [
    { icon: Trophy, name: 'First Drop', description: 'Complete your first recycling drop-off' },
    { icon: Star, name: '100 Club', description: 'Recycle 100 kilograms' },
    { icon: Award, name: 'Streak Master', description: 'Drop off for 30 consecutive days' },
    { icon: Heart, name: 'Community Hero', description: 'Refer 10 new members' }
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
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/90 text-sm font-medium">50,000+ Active Members</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Join the </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Movement
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Connect with recyclers worldwide, share your journey, and celebrate collective impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '50,000+', label: 'Active Members', icon: Users },
              { value: '1,200+', label: 'Community Hubs', icon: MessageSquare },
              { value: '2.8M kg', label: 'Together Recycled', icon: Trophy }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <stat.icon className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
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
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Top Recyclers
              </span>
            </h2>
            <p className="text-white/60">This month's champions leading by example</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
            }}
          >
            {leaderboard.map((entry, index) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-4 rounded-2xl mb-3 last:mb-0 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 
                      entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                      'bg-white/10 text-white/60'}
                  `}>
                    {entry.rank <= 3 ? entry.rank : entry.avatar}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white">{entry.name}</div>
                    <div className="text-sm text-white/50">{entry.amount}</div>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30">
                  {entry.badge}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Success </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Stories
              </span>
            </h2>
            <p className="text-white/60">Real people, real impact</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <div className="text-4xl mb-4">{story.icon}</div>
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">{story.author}</div>
                <h3 className="text-xl font-bold text-white mb-3">{story.name}</h3>
                <p className="text-white/60 leading-relaxed mb-4">{story.story}</p>
                <div className="text-emerald-400 font-semibold">{story.impact}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Unlock </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Achievements
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <achievement.icon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{achievement.name}</h3>
                <p className="text-sm text-white/50">{achievement.description}</p>
              </motion.div>
            ))}
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
              Start Your Journey
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Create your ReVive ID and become part of our global community today.
            </p>
            <LiquidGlassButton size="lg">
              Join the Community
            </LiquidGlassButton>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
