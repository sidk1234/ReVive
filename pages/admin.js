import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '@/api/supabaseApi';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Search, CheckCircle, XCircle, Pencil, User } from '@/components/ui/icons';
import { createUserImpactUrl, getUsernameFromEmail } from '@/utils';

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

const statusOptions = ['pending', 'approved', 'rejected'];

export default function Admin() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activityDraft, setActivityDraft] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const user = await supabaseApi.auth.me();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      if (user.role !== 'admin' && user.role !== 'owner') {
        window.location.href = '/';
        return;
      }
      setCurrentUser(user);
    };
    load();
  }, []);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => supabaseApi.admin.listUsers(search),
    enabled: !!currentUser,
  });

  const { data: pendingActivities = [] } = useQuery({
    queryKey: ['admin-pending-activities'],
    queryFn: () => supabaseApi.admin.listPendingActivities(),
    enabled: !!currentUser,
  });

  const { data: selectedUserActivities = [] } = useQuery({
    queryKey: ['admin-user-activities', selectedUser?.id],
    queryFn: () => supabaseApi.admin.listUserActivities(selectedUser?.id),
    enabled: !!selectedUser?.id,
  });

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => supabaseApi.admin.setUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['admin-users']);
      setStatusMessage('Role updated.');
    },
  });

  const profileMutation = useMutation({
    mutationFn: ({ userId, updates }) => supabaseApi.admin.updateUserProfile(userId, updates),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries(['admin-users']);
      if (result?.data) {
        setSelectedUser(result.data);
      }
      setStatusMessage('Profile updated.');
    },
  });

  const activityMutation = useMutation({
    mutationFn: ({ activityId, updates }) => supabaseApi.admin.updateActivity(activityId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['admin-pending-activities']);
      await queryClient.invalidateQueries(['admin-user-activities', selectedUser?.id]);
      await queryClient.invalidateQueries(['admin-users']);
      setEditingActivityId(null);
      setActivityDraft(null);
      setStatusMessage('Activity updated.');
    },
  });

  const startEditingActivity = (activity) => {
    setEditingActivityId(activity.id);
    setActivityDraft({
      material_type: activity.material_type,
      weight: activity.weight,
      location: activity.location || '',
      date: activity.date,
      notes: activity.notes || '',
      status: activity.status || 'pending',
    });
  };

  const startEditingProfile = (user) => {
    setProfileDraft({
      full_name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      organization_name: user.organization_name || '',
      user_type: user.user_type || 'individual',
    });
  };

  const saveProfile = async () => {
    if (!selectedUser || !profileDraft) return;
    profileMutation.mutate({ userId: selectedUser.id, updates: profileDraft });
  };

  const getUserDisplay = (user) => {
    if (!user) return '';
    return user.full_name || user.email || user.id;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 95, 0.3) 0%, rgba(10, 22, 40, 1) 50%, rgba(2, 6, 12, 1) 100%)',
      }}
    >
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-purple-300 uppercase tracking-[0.2em]">
                <Settings className="w-4 h-4" />
                Admin Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mt-2">Manage ReVive</h1>
              <p className="text-white/60">Review activity submissions and manage users.</p>
            </div>
            {statusMessage ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                {statusMessage}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div className="space-y-6">
              <div
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/10">
                    <Search className="w-4 h-4 text-white/70" />
                  </div>
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users by name or email"
                    className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {usersLoading ? (
                    <div className="text-white/50">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-white/50">No users found.</div>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setProfileDraft(null);
                        }}
                        className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${
                          selectedUser?.id === user.id
                            ? 'border-emerald-400/50 bg-emerald-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{getUserDisplay(user)}</div>
                            <div className="text-xs text-white/50">
                              {user.user_type || 'individual'} · {roleLabels[user.role] || 'Member'}
                            </div>
                          </div>
                          <div className="text-xs text-white/50">
                            {(user.total_recycled || 0).toFixed(1)} kg
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
                }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Inbox</h2>
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
                  {pendingActivities.length === 0 ? (
                    <div className="text-white/50">No pending submissions.</div>
                  ) : (
                    pendingActivities.map((activity) => {
                      const owner = usersById.get(activity.user_id);
                      return (
                        <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-sm text-white/80 mb-1">
                            {activity.material_type} · {activity.weight} kg
                          </div>
                          <div className="text-xs text-white/50">
                            {owner ? getUserDisplay(owner) : activity.user_id}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <LiquidGlassButton
                              size="sm"
                              onClick={() =>
                                activityMutation.mutate({
                                  activityId: activity.id,
                                  updates: { status: 'approved' },
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              className="!bg-transparent"
                              onClick={() =>
                                activityMutation.mutate({
                                  activityId: activity.id,
                                  updates: { status: 'rejected' },
                                })
                              }
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </LiquidGlassButton>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">User Details</h2>
                    <p className="text-white/50 text-sm">
                      {selectedUser ? getUserDisplay(selectedUser) : 'Select a user to view details'}
                    </p>
                  </div>
                  {selectedUser ? (
                    <a
                      href={createUserImpactUrl({
                        username: getUsernameFromEmail(selectedUser.email),
                        email: selectedUser.email,
                      })}
                      className="text-sm text-emerald-300 underline underline-offset-4"
                    >
                      View Impact
                    </a>
                  ) : null}
                </div>

                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <User className="w-4 h-4" />
                      {selectedUser.email || 'No email on record'}
                    </div>

                    {currentUser.role === 'owner' ? (
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Role</label>
                        <Select
                          value={selectedUser.role || 'member'}
                          onValueChange={(value) =>
                            roleMutation.mutate({ userId: selectedUser.id, role: value })
                          }
                        >
                          <SelectTrigger className="backdrop-blur-xl border-white/10 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-white/60 uppercase tracking-wide">Profile</label>
                        <button
                          type="button"
                          className="text-xs text-purple-300 flex items-center gap-1"
                          onClick={() => startEditingProfile(selectedUser)}
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                      {profileDraft ? (
                        <div className="mt-3 space-y-3">
                          <Input
                            value={profileDraft.full_name}
                            onChange={(event) =>
                              setProfileDraft({ ...profileDraft, full_name: event.target.value })
                            }
                            placeholder="Full name"
                            className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          />
                          <Input
                            value={profileDraft.organization_name}
                            onChange={(event) =>
                              setProfileDraft({
                                ...profileDraft,
                                organization_name: event.target.value,
                              })
                            }
                            placeholder="Organization name"
                            className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          />
                          <Input
                            value={profileDraft.phone}
                            onChange={(event) =>
                              setProfileDraft({ ...profileDraft, phone: event.target.value })
                            }
                            placeholder="Phone"
                            className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          />
                          <Input
                            value={profileDraft.address}
                            onChange={(event) =>
                              setProfileDraft({ ...profileDraft, address: event.target.value })
                            }
                            placeholder="Address"
                            className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          />
                          <Input
                            value={profileDraft.bio}
                            onChange={(event) =>
                              setProfileDraft({ ...profileDraft, bio: event.target.value })
                            }
                            placeholder="Bio"
                            className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          />
                          <Select
                            value={profileDraft.user_type}
                            onValueChange={(value) =>
                              setProfileDraft({ ...profileDraft, user_type: value })
                            }
                          >
                            <SelectTrigger className="backdrop-blur-xl border-white/10 bg-white/5 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="school">School</SelectItem>
                              <SelectItem value="organization">Organization</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <LiquidGlassButton size="sm" onClick={saveProfile}>
                              Save
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              className="!bg-transparent"
                              onClick={() => setProfileDraft(null)}
                            >
                              Cancel
                            </LiquidGlassButton>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-white/60">
                          {selectedUser.user_type || 'individual'} · {selectedUser.organization_name || 'No organization'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="backdrop-blur-xl rounded-3xl p-6 border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(10, 22, 40, 0.7) 100%)',
                }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Activities</h2>
                {selectedUser ? (
                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                    {selectedUserActivities.length === 0 ? (
                      <div className="text-white/50">No activities for this user.</div>
                    ) : (
                      selectedUserActivities.map((activity) => (
                        <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          {editingActivityId === activity.id && activityDraft ? (
                            <div className="space-y-3">
                              <Input
                                value={activityDraft.material_type}
                                onChange={(event) =>
                                  setActivityDraft({
                                    ...activityDraft,
                                    material_type: event.target.value,
                                  })
                                }
                                placeholder="Material type"
                                className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                              />
                              <Input
                                type="number"
                                step="0.1"
                                value={activityDraft.weight}
                                onChange={(event) =>
                                  setActivityDraft({
                                    ...activityDraft,
                                    weight: event.target.value,
                                  })
                                }
                                placeholder="Weight"
                                className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                              />
                              <Input
                                value={activityDraft.location}
                                onChange={(event) =>
                                  setActivityDraft({
                                    ...activityDraft,
                                    location: event.target.value,
                                  })
                                }
                                placeholder="Location"
                                className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                              />
                              <Input
                                type="date"
                                value={activityDraft.date}
                                onChange={(event) =>
                                  setActivityDraft({
                                    ...activityDraft,
                                    date: event.target.value,
                                  })
                                }
                                className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                              />
                              <Input
                                value={activityDraft.notes}
                                onChange={(event) =>
                                  setActivityDraft({
                                    ...activityDraft,
                                    notes: event.target.value,
                                  })
                                }
                                placeholder="Notes"
                                className="backdrop-blur-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                              />
                              <Select
                                value={activityDraft.status}
                                onValueChange={(value) =>
                                  setActivityDraft({ ...activityDraft, status: value })
                                }
                              >
                                <SelectTrigger className="backdrop-blur-xl border-white/10 bg-white/5 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <LiquidGlassButton
                                  size="sm"
                                  onClick={() =>
                                    activityMutation.mutate({
                                      activityId: activity.id,
                                      updates: {
                                        ...activityDraft,
                                        weight: parseFloat(activityDraft.weight || 0),
                                      },
                                    })
                                  }
                                >
                                  Save
                                </LiquidGlassButton>
                                <LiquidGlassButton
                                  size="sm"
                                  className="!bg-transparent"
                                  onClick={() => {
                                    setEditingActivityId(null);
                                    setActivityDraft(null);
                                  }}
                                >
                                  Cancel
                                </LiquidGlassButton>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-white capitalize">
                                  {activity.material_type}
                                </div>
                                <div className="text-xs text-white/50">
                                  {activity.weight} kg · {activity.status || 'pending'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => startEditingActivity(activity)}
                                className="text-purple-300 flex items-center gap-1 text-sm"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-white/50">Select a user to manage activities.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
