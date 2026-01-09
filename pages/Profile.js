import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
  Loader2,
  Save
} from '@/components/ui/icons';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    organization_name: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        bio: userData.bio || '',
        organization_name: userData.organization_name || ''
      });
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        organization_name: formData.organization_name
      });
      alert('Profile updated successfully!');
      await loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const userTypeLabels = {
    individual: 'Individual',
    school: 'School',
    organization: 'Organization'
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Your Profile
                </span>
              </h1>
              <p className="text-lg text-white/60">
                Manage your account information
              </p>
            </div>

            {/* Profile Card */}
            <div 
              className="backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              {/* User Type Badge */}
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                  }}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400/90 text-sm font-medium">
                    {userTypeLabels[user?.user_type] || 'Individual'}
                  </span>
                </div>

                <div className="text-sm text-white/50">
                  Member since {new Date(user?.created_date).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    Full Name
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    Email
                  </label>
                  <Input
                    value={formData.email}
                    disabled
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                </div>

                {/* Organization Name (if applicable) */}
                {(user?.user_type === 'school' || user?.user_type === 'organization') && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      {user?.user_type === 'school' ? 'School Name' : 'Organization Name'}
                    </label>
                    <Input
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      placeholder="Enter name..."
                      className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, city, state"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Bio
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself or your mission..."
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 min-h-[120px]"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex gap-4">
                <LiquidGlassButton 
                  size="lg" 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </LiquidGlassButton>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)'
                }}
              >
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {user?.total_recycled?.toFixed(1) || '0.0'} kg
                </div>
                <div className="text-white/50 text-sm">Total Recycled</div>
              </div>

              <div 
                className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)'
                }}
              >
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </div>
                <div className="text-white/50 text-sm">Account Type</div>
              </div>

              <div 
                className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)'
                }}
              >
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  Active
                </div>
                <div className="text-white/50 text-sm">Status</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
