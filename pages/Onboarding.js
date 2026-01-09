import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { User, GraduationCap, Building2, ArrowRight, Loader2 } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_type: '',
    organization_name: '',
    address: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const user = await base44.auth.me();
      if (user.onboarding_completed) {
        window.location.href = createPageUrl('MyImpact');
      }
    } catch (error) {
      window.location.href = '/';
    }
  };

  const userTypes = [
    {
      type: 'individual',
      icon: User,
      title: 'Individual',
      description: 'Track your personal recycling journey and grow your impact',
      color: 'emerald'
    },
    {
      type: 'school',
      icon: GraduationCap,
      title: 'School',
      description: 'Create a campus hub and compete between classes',
      color: 'cyan'
    },
    {
      type: 'organization',
      icon: Building2,
      title: 'Organization',
      description: 'Partner as a node and showcase your environmental commitment',
      color: 'blue'
    }
  ];

  const handleUserTypeSelect = (type) => {
    setFormData({ ...formData, user_type: type });
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({
        ...formData,
        onboarding_completed: true,
        total_recycled: 0
      });
      window.location.href = createPageUrl('MyImpact');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl w-full">
        {/* Step 1: Select User Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                <span className="text-white">Welcome to </span>
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ReVive
                </span>
              </h1>
              <p className="text-lg text-white/60">
                Let's set up your account. How will you use ReVive?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userTypes.map((userType, index) => (
                <motion.button
                  key={userType.type}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleUserTypeSelect(userType.type)}
                  className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-left group hover:border-emerald-500/30 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                  }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-${userType.color}-500/20`}>
                    <userType.icon className={`w-7 h-7 text-${userType.color}-400`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{userType.title}</h3>
                  <p className="text-white/60 leading-relaxed">{userType.description}</p>

                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-emerald-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Additional Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div 
              className="backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="mb-8">
                <button 
                  onClick={() => setStep(1)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-3xl font-bold text-white mb-2">Tell us more</h2>
                <p className="text-white/60">Help us personalize your experience</p>
              </div>

              <div className="space-y-6">
                {(formData.user_type === 'school' || formData.user_type === 'organization') && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {formData.user_type === 'school' ? 'School Name' : 'Organization Name'}
                    </label>
                    <Input
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      placeholder="Enter name..."
                      className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Address (Optional)
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, city, state"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Phone Number (Optional)
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Bio (Optional)
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself or your mission..."
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="mt-8">
                <LiquidGlassButton 
                  size="lg" 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </LiquidGlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
