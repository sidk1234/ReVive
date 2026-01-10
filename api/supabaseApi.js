// A lightweight wrapper around Supabase to provide basic authentication
// and data access for the ReVive Earth demo. When Supabase is configured
// via environment variables, these methods will communicate with the
// Supabase Auth and database APIs. When not configured (for example
// during development without a backend), the code falls back to a simple
// in-memory mock user.

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getUsernameFromEmail } from '@/utils';

// Fallback demo user used when Supabase is not configured or the user is
// not authenticated. This ensures the app can still render pages and
// demonstrate features without connecting to a backend.
// When running without Supabase and without a logged-in user, `mockUser` is
// initialized as null. This causes isAuthenticated() to return false and
// prompts the UI to show the "Join ReVive" button. During runtime you
// can assign an object here to simulate a logged-in user if desired.
let mockUser = null;

const resolveAuthRedirectUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '');
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

const resolveRoleFromAllowlist = (email) => {
  if (!email) return null;
  const adminList = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  const ownerList = process.env.NEXT_PUBLIC_OWNER_EMAILS || '';
  const normalizedEmail = email.toLowerCase();
  const ownerMatch = ownerList
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedEmail);
  if (ownerMatch) return 'owner';
  const adminMatch = adminList
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedEmail);
  return adminMatch ? 'admin' : null;
};

const resolveRole = ({ profile, user }) => {
  const directRole = profile?.role || user?.user_metadata?.role || user?.app_metadata?.role;
  if (directRole) {
    return directRole.toString().trim().toLowerCase();
  }
  const allowlisted = resolveRoleFromAllowlist(user?.email);
  return allowlisted || 'member';
};

const ensureProfile = async (user) => {
  if (!user?.id || !user?.email) return null;
  try {
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single();
    if (existing && !existingError) return existing;
  } catch (err) {
    // Continue to attempt creation when select fails.
  }

  try {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User';
    const insertData = {
      id: user.id,
      email: user.email,
      full_name: fullName,
      user_type: 'individual',
      role: resolveRoleFromAllowlist(user.email) || 'member',
      onboarding_completed: false,
      total_recycled: 0,
    };
    const { data, error } = await supabase
      .from('profiles')
      .upsert(insertData, { onConflict: 'id' })
      .select('id, email')
      .single();
    if (error) {
      console.error('Supabase profile create error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase profile create exception:', err);
    return null;
  }
};

const syncUserProfileByEmail = async (user) => {
  if (!user?.id) return user;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'full_name, phone, address, bio, organization_name, user_type, total_recycled, onboarding_completed, role',
      )
      .eq('id', user.id)
      .single();
    if (error || !profile) return user;

    const current = user.user_metadata || {};
    const update = {};
    const maybeSet = (key, value) => {
      if (value === null || value === undefined) return;
      if (typeof value === 'string' && value.trim() === '') return;
      if (current[key] !== value) {
        update[key] = value;
      }
    };

    maybeSet('full_name', profile.full_name);
    maybeSet('phone', profile.phone);
    maybeSet('address', profile.address);
    maybeSet('bio', profile.bio);
    maybeSet('organization_name', profile.organization_name);
    maybeSet('user_type', profile.user_type);
    maybeSet('total_recycled', profile.total_recycled);
    maybeSet('onboarding_completed', profile.onboarding_completed);
    maybeSet('role', profile.role);

    if (Object.keys(update).length === 0) return user;

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: update,
    });
    if (updateError || !updateData?.user) return user;
    return updateData.user;
  } catch (err) {
    console.error('Supabase profile sync error:', err);
    return user;
  }
};

const fetchProfileById = async (userId, email) => {
  if (!userId) return null;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'full_name, phone, address, bio, organization_name, user_type, total_recycled, onboarding_completed, role, email',
      )
      .eq('id', userId)
      .single();
    if (!error && profile) {
      return profile;
    }
  } catch (err) {
    console.error('Supabase profile fetch error:', err);
  }

  if (!email) return null;
  try {
    const { data: fallbackProfile, error: fallbackError } = await supabase
      .from('profiles')
      .select(
        'full_name, phone, address, bio, organization_name, user_type, total_recycled, onboarding_completed, role, email',
      )
      .eq('email', email)
      .single();
    if (fallbackError) return null;
    return fallbackProfile || null;
  } catch (err) {
    console.error('Supabase profile fetch error:', err);
    return null;
  }
};

export const supabaseApi = {
  auth: {
    /**
     * Returns whether the current user is authenticated. When Supabase is
     * configured this checks for an active session; otherwise it returns
     * true if the mock user has been set.
     * @returns {Promise<boolean>}
     */
    isAuthenticated: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            return false;
          }
          return Boolean(data?.session);
        } catch {
          return false;
        }
      }
      // When not using Supabase, treat the mock user as authenticated if it exists
      return Boolean(mockUser);
    },
    /**
     * Returns the currently authenticated user. When using Supabase this
     * extracts the user and their metadata; otherwise it returns the mock user.
     * @returns {Promise<object|null>}
     */
    me: async () => {
      if (isSupabaseConfigured) {
        try {
          let user = null;
          let error = null;
          try {
            const refreshResult = await supabase.auth.refreshSession();
            if (refreshResult?.data?.user) {
              user = refreshResult.data.user;
            }
          } catch (refreshError) {
            // Ignore refresh errors and fall back to getUser.
          }

          if (!user) {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            user = userData?.user || null;
            error = userError;
          }
          if (error || !user) {
            return null;
          }
          await ensureProfile(user);
          await syncUserProfileByEmail(user);
          const profile = await fetchProfileById(user.id, user.email);
          const userForProfile = user;
          // Merge the base profile with user_metadata. The metadata may
          // include fields like full_name and onboarding_completed.
          return {
            id: userForProfile.id,
            username: userForProfile.user_metadata?.username || getUsernameFromEmail(userForProfile.email),
            full_name:
              profile?.full_name ||
              userForProfile.user_metadata?.full_name ||
              userForProfile.email?.split('@')[0] ||
              'User',
            email: profile?.email || userForProfile.email,
            phone: profile?.phone || userForProfile.user_metadata?.phone || '',
            address: profile?.address || userForProfile.user_metadata?.address || '',
            bio: profile?.bio || userForProfile.user_metadata?.bio || '',
            organization_name:
              profile?.organization_name || userForProfile.user_metadata?.organization_name || '',
            user_type: profile?.user_type || userForProfile.user_metadata?.user_type || 'individual',
            total_recycled: profile?.total_recycled || userForProfile.user_metadata?.total_recycled || 0,
            onboarding_completed:
              profile?.onboarding_completed ?? Boolean(userForProfile.user_metadata?.onboarding_completed),
            created_date: userForProfile.created_at,
            role: resolveRole({ profile, user: userForProfile }),
          };
        } catch {
          return null;
        }
      }
      // Return the fallback user
      return mockUser;
    },
    /**
     * Updates the currently authenticated user's metadata. When Supabase is
     * configured this merges the provided data into the user's metadata via
     * supabase.auth.updateUser(). Otherwise it merges into the mock user.
     * @param {object} data - Data to update
     * @returns {Promise<object|null>}
     */
    updateMe: async (data) => {
      if (isSupabaseConfigured) {
        try {
          const { data: updateData, error } = await supabase.auth.updateUser({ data });
          if (error) {
            console.error('Supabase update error:', error);
            return null;
          }
          return updateData;
        } catch (err) {
          console.error('Supabase update exception:', err);
          return null;
        }
      }
      // Update the mock user in fallback mode
      mockUser = { ...mockUser, ...data };
      return mockUser;
    },
    /**
     * Logs out the current user. When using Supabase this signs out via
     * supabase.auth.signOut(). Otherwise it clears the mock user.
     */
    logout: async () => {
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Supabase signOut error:', err);
        }
      }
      // Reset the mock user
      mockUser = null;
    },
    /**
     * Navigates to the login page so the user can choose an auth method.
     */
    redirectToLogin: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    /**
     * Starts Google OAuth sign-in using Supabase.
     */
    signInWithGoogle: () => {
      if (!isSupabaseConfigured) return;
      const redirectBase = resolveAuthRedirectUrl();
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectBase ? `${redirectBase}/` : '/',
        },
      });
    },
    /**
     * Sends a password reset email.
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    sendPasswordReset: async (email) => {
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase is not configured.') };
      }
      try {
        const redirectBase = resolveAuthRedirectUrl();
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectBase ? `${redirectBase}/reset-password` : undefined,
        });
        if (error) {
          return { error };
        }
        return { data };
      } catch (err) {
        return { error: err };
      }
    },
    /**
     * Updates the current user's password.
     * @param {string} password
     * @returns {Promise<object|null>}
     */
    updatePassword: async (password) => {
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase is not configured.') };
      }
      try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) {
          return { error };
        }
        return { data };
      } catch (err) {
        return { error: err };
      }
    },
    /**
     * Signs in a user with email and password.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<object|null>}
     */
    signInWithEmail: async (email, password) => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            return { error };
          }
          return { data };
        } catch (err) {
          return { error: err };
        }
      }
      mockUser = {
        id: 'demo-user',
        username: getUsernameFromEmail(email),
        full_name: email?.split('@')[0] || 'User',
        email,
        total_recycled: 0,
        role: 'member',
      };
      return { data: { user: mockUser } };
    },
    /**
     * Signs up a new user with email and password.
     * @param {object} payload
     * @returns {Promise<object|null>}
     */
    signUpWithEmail: async ({ email, password, fullName }) => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || '',
              },
            },
          });
          if (error) {
            return { error };
          }
          return { data };
        } catch (err) {
          return { error: err };
        }
      }
      mockUser = {
        id: 'demo-user',
        username: getUsernameFromEmail(email),
        full_name: fullName || email?.split('@')[0] || 'User',
        email,
        total_recycled: 0,
        role: 'member',
      };
      return { data: { user: mockUser } };
    },
    /**
     * Returns the resolved role for the current user.
     * @returns {Promise<string|null>}
     */
    getRole: async () => {
      const user = await supabaseApi.auth.me();
      return user?.role || null;
    },
  },
  entities: {
    RecyclingActivity: {
      /**
       * Returns a list of recycling activities for the current user. When
       * Supabase is configured this queries the `recycling_activities` table,
       * filtering by the authenticated user's ID. Otherwise it returns a
       * static array of example activities.
       * @param {string} sort - Sort order (ignored in demo)
       * @returns {Promise<object[]>}
       */
      list: async (sort, options = {}) => {
        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user && !options.userId) return [];
            const { data, error } = await supabase
              .from('recycling_activities')
              .select('id, material_type, weight, location, date, notes, status, user_id')
              .eq('user_id', options.userId || user.id)
              .order('date', { ascending: false });
            if (error) {
              console.error('Supabase list error:', error);
              return [];
            }
            let results = data || [];
            if (options.status) {
              results = results.filter((item) => item.status === options.status);
            }
            return results;
          } catch (err) {
            console.error('Supabase list exception:', err);
            return [];
          }
        }
        // Fallback static activities
        if (!mockUser) return [];
        return [
          {
            id: '1',
            material_type: 'plastic',
            weight: 2.5,
            location: 'McKinney',
            date: '2024-01-10',
            notes: 'Bottles and containers',
            status: 'approved',
            user_id: mockUser?.id || 'demo-user',
          },
          {
            id: '2',
            material_type: 'metal',
            weight: 1.2,
            location: 'Dallas',
            date: '2024-02-15',
            notes: 'Cans',
            status: 'approved',
            user_id: mockUser?.id || 'demo-user',
          },
        ];
      },
      /**
       * Creates a new recycling activity. When Supabase is configured this
       * inserts a new row into the `recycling_activities` table and updates
       * the user's total. Otherwise it simply returns a new activity object
       * and updates the mock user's total.
       * @param {object} data - Data for the new activity
       * @returns {Promise<object>}
       */
      create: async (data) => {
        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            const insertData = {
              user_id: user.id,
              material_type: data.material_type,
              weight: parseFloat(data.weight),
              location: data.location,
              date: data.date,
              notes: data.notes,
              status: 'pending',
            };
            const { data: result, error } = await supabase
              .from('recycling_activities')
              .insert(insertData)
              .select('id, material_type, weight, location, date, notes, status, user_id')
              .single();
            if (error) throw error;
            return result;
          } catch (err) {
            console.error('Supabase create error:', err);
            return null;
          }
        }
        // Fallback: update the mock user
        const newActivity = { id: Date.now().toString(), status: 'approved', user_id: mockUser?.id || 'demo-user', ...data };
        if (mockUser) {
          mockUser.total_recycled =
            (mockUser.total_recycled || 0) + parseFloat(data.weight || 0);
        }
        return newActivity;
      },
      /**
       * Deletes a recycling activity by ID. When Supabase is configured
       * this deletes the row and updates the user's total. Otherwise it is
       * a no-op for the demo.
       * @param {string} id - ID of the activity to delete
       */
      delete: async (id) => {
        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            // Fetch the activity to subtract its weight from the total
            const { data: activity, error: fetchError } = await supabase
              .from('recycling_activities')
              .select('id, weight, status')
              .eq('id', id)
              .eq('user_id', user.id)
              .single();
            if (fetchError) throw fetchError;
            const { error: deleteError } = await supabase
              .from('recycling_activities')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);
            if (deleteError) throw deleteError;
            // Update user's total_recycled for approved activities only
            if (activity?.status === 'approved') {
              const newTotal = Math.max(0, (user.user_metadata?.total_recycled || 0) - parseFloat(activity.weight || 0));
              await supabase.auth.updateUser({ data: { total_recycled: newTotal } });
            }
          } catch (err) {
            console.error('Supabase delete error:', err);
          }
        }
        // In fallback mode we don't actually persist activities
      },
    },
  },
  admin: {
    listUsers: async (search = '') => {
      if (!isSupabaseConfigured) {
        return mockUser ? [mockUser] : [];
      }
      try {
        let query = supabase
          .from('profiles')
          .select('id, email, full_name, phone, address, bio, organization_name, user_type, role, total_recycled');
        if (search) {
          query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        const { data, error } = await query.order('full_name', { ascending: true });
        if (error) {
          console.error('Supabase listUsers error:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Supabase listUsers exception:', err);
        return [];
      }
    },
    updateUserProfile: async (userId, updates) => {
      if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured.') };
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select('id, email, full_name, phone, address, bio, organization_name, user_type, role, total_recycled')
          .single();
        if (error) return { error };
        return { data };
      } catch (err) {
        return { error: err };
      }
    },
    setUserRole: async (userId, role) => {
      if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured.') };
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', userId)
          .select('id, role')
          .single();
        if (error) return { error };
        return { data };
      } catch (err) {
        return { error: err };
      }
    },
    listPendingActivities: async () => {
      if (!isSupabaseConfigured) return [];
      try {
        const { data, error } = await supabase
          .from('recycling_activities')
          .select('id, material_type, weight, location, date, notes, status, user_id')
          .eq('status', 'pending')
          .order('date', { ascending: false });
        if (error) {
          console.error('Supabase listPendingActivities error:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Supabase listPendingActivities exception:', err);
        return [];
      }
    },
    listUserActivities: async (userId) => {
      if (!isSupabaseConfigured || !userId) return [];
      try {
        const { data, error } = await supabase
          .from('recycling_activities')
          .select('id, material_type, weight, location, date, notes, status, user_id')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        if (error) {
          console.error('Supabase listUserActivities error:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Supabase listUserActivities exception:', err);
        return [];
      }
    },
    updateActivity: async (activityId, updates) => {
      if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured.') };
      try {
        const { data: current, error: currentError } = await supabase
          .from('recycling_activities')
          .select('id, user_id, weight, status')
          .eq('id', activityId)
          .single();
        if (currentError || !current) return { error: currentError || new Error('Activity not found') };

        const { data, error } = await supabase
          .from('recycling_activities')
          .update(updates)
          .eq('id', activityId)
          .select('id, material_type, weight, location, date, notes, status, user_id')
          .single();
        if (error) return { error };

        const previousStatus = current.status;
        const nextStatus = updates.status || current.status;
        const previousWeight = parseFloat(current.weight || 0);
        const nextWeight = parseFloat(data.weight || previousWeight);
        let delta = 0;

        if (previousStatus === 'approved' && nextStatus === 'approved') {
          delta = nextWeight - previousWeight;
        } else if (previousStatus !== 'approved' && nextStatus === 'approved') {
          delta = nextWeight;
        } else if (previousStatus === 'approved' && nextStatus !== 'approved') {
          delta = -previousWeight;
        }

        if (delta !== 0) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, total_recycled')
            .eq('id', current.user_id)
            .single();
          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_recycled: Math.max(0, (profile.total_recycled || 0) + delta) })
              .eq('id', current.user_id);
          }
        }

        return { data };
      } catch (err) {
        return { error: err };
      }
    },
  },
};
