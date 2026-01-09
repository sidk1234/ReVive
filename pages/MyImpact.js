import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import LiquidGlassButton from '../components/ui/LiquidGlassButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Plus,
  Leaf,
  Calendar,
  MapPin,
  Trash2,
  Loader2,
  Award,
  Target
} from '@/components/ui/icons';
import { format } from 'date-fns';

export default function MyImpact() {
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    material_type: 'plastic',
    weight: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      if (!userData.onboarding_completed) {
        // Redirect to the capitalized Onboarding route to match the file name
        window.location.href = '/Onboarding';
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '/';
    }
  };

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.RecyclingActivity.list('-created_date'),
    enabled: !!user
  });

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.RecyclingActivity.create(data),
    onSuccess: async (newActivity) => {
      queryClient.invalidateQueries(['activities']);
      
      // Update user's total
      const newTotal = (user.total_recycled || 0) + parseFloat(newActivity.weight);
      await base44.auth.updateMe({ total_recycled: newTotal });
      await loadUser();
      
      setShowAddForm(false);
      setFormData({
        material_type: 'plastic',
        weight: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id) => base44.entities.RecyclingActivity.delete(id),
    onSuccess: async (_, deletedId) => {
      const deletedActivity = activities.find(a => a.id === deletedId);
      if (deletedActivity) {
        const newTotal = Math.max(0, (user.total_recycled || 0) - parseFloat(deletedActivity.weight));
        await base44.auth.updateMe({ total_recycled: newTotal });
        await loadUser();
      }
      queryClient.invalidateQueries(['activities']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }
    createActivityMutation.mutate({
      ...formData,
      weight: parseFloat(formData.weight)
    });
  };

  // Calculate material breakdown
  const materialBreakdown = activities.reduce((acc, activity) => {
    const type = activity.material_type;
    acc[type] = (acc[type] || 0) + parseFloat(activity.weight || 0);
    return acc;
  }, {});

  const totalWeight = Object.values(materialBreakdown).reduce((sum, weight) => sum + weight, 0);

  const materialColors = {
    plastic: { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    paper: { color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    metal: { color: 'from-slate-400 to-slate-600', bg: 'bg-slate-400/20', text: 'text-slate-400' },
    glass: { color: 'from-cyan-400 to-blue-400', bg: 'bg-cyan-400/20', text: 'text-cyan-400' },
    electronics: { color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
    textiles: { color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20', text: 'text-pink-400' }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)'
      }}
    >
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-white">Your </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Impact
              </span>
            </h1>
            <p className="text-lg text-white/60">
              Track your recycling journey and watch your impact grow
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-sm text-white/60">Total Recycled</div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {(user.total_recycled || 0).toFixed(1)} kg
              </div>
              <div className="text-emerald-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Keep it up!
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/20">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-sm text-white/60">Activities</div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {activities.length}
              </div>
              <div className="text-white/40 text-sm">
                Drop-offs recorded
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/20">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm text-white/60">Badge</div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {user.total_recycled >= 1000 ? '💎' : 
                 user.total_recycled >= 500 ? '🏆' : 
                 user.total_recycled >= 100 ? '⭐' : '🌱'}
              </div>
              <div className="text-white/40 text-sm">
                {user.total_recycled >= 1000 ? 'Diamond' : 
                 user.total_recycled >= 500 ? 'Platinum' : 
                 user.total_recycled >= 100 ? 'Gold' : 'Beginner'}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Material Breakdown */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Material Breakdown</h2>
                
                {Object.keys(materialBreakdown).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(materialBreakdown).map(([material, weight]) => {
                      const percentage = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
                      const colors = materialColors[material] || materialColors.plastic;
                      
                      return (
                        <div key={material}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium capitalize">{material}</span>
                            <div className="text-right">
                              <div className="text-white font-bold">{percentage.toFixed(1)}%</div>
                              <div className="text-white/50 text-sm">{weight.toFixed(1)} kg</div>
                            </div>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${colors.color} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No recycling activities yet. Start tracking your impact!</p>
                  </div>
                )}
              </motion.div>

              {/* Activities List */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
                  <LiquidGlassButton size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </LiquidGlassButton>
                </div>

                {showAddForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Material Type</label>
                        <Select
                          value={formData.material_type}
                          onValueChange={(value) => setFormData({ ...formData, material_type: value })}
                        >
                          <SelectTrigger className="backdrop-blur-xl border-white/10 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plastic">Plastic</SelectItem>
                            <SelectItem value="paper">Paper</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="glass">Glass</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="textiles">Textiles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-2">Weight (kg)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="0.0"
                          className="backdrop-blur-xl border-white/10 bg-white/5 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-2">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Drop-off location"
                          className="backdrop-blur-xl border-white/10 bg-white/5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-2">Date</label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="backdrop-blur-xl border-white/10 bg-white/5 text-white"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-white/60 mb-2">Notes (Optional)</label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any notes..."
                        className="backdrop-blur-xl border-white/10 bg-white/5 text-white"
                      />
                    </div>

                    <div className="flex gap-3">
                      <LiquidGlassButton type="submit" disabled={createActivityMutation.isPending}>
                        {createActivityMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                        ) : (
                          'Add Activity'
                        )}
                      </LiquidGlassButton>
                      <LiquidGlassButton 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="!bg-transparent"
                      >
                        Cancel
                      </LiquidGlassButton>
                    </div>
                  </motion.form>
                )}

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No activities recorded yet</p>
                    </div>
                  ) : (
                    activities.map((activity) => {
                      const colors = materialColors[activity.material_type] || materialColors.plastic;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${colors.bg}`}>
                              <Leaf className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-white capitalize">{activity.material_type}</div>
                              <div className="text-sm text-white/50 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(activity.date), 'MMM d, yyyy')}
                                </span>
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {activity.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">{activity.weight} kg</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Delete this activity?')) {
                                deleteActivityMutation.mutate(activity.id);
                              }
                            }}
                            className="ml-4 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Stats Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10 sticky top-24"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-6">Your Impact</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-emerald-400 text-sm mb-1">Trees Saved</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.floor((user.total_recycled || 0) * 0.005)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-cyan-400 text-sm mb-1">Water Conserved</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.floor((user.total_recycled || 0) * 3)} L
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-blue-400 text-sm mb-1">CO₂ Prevented</div>
                    <div className="text-2xl font-bold text-white">
                      {((user.total_recycled || 0) * 0.5).toFixed(1)} kg
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-white/60 text-sm mb-2">Next Milestone</div>
                  <div className="text-white font-semibold mb-2">
                    {user.total_recycled >= 1000 ? 'You\'ve reached the top!' : 
                     user.total_recycled >= 500 ? '💎 Diamond (1000 kg)' : 
                     user.total_recycled >= 100 ? '🏆 Platinum (500 kg)' : 
                     '⭐ Gold (100 kg)'}
                  </div>
                  {user.total_recycled < 1000 && (
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        style={{ 
                          width: `${((user.total_recycled || 0) / (user.total_recycled >= 500 ? 1000 : user.total_recycled >= 100 ? 500 : 100)) * 100}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
