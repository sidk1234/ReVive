// A lightweight wrapper around Supabase to provide basic authentication
// and data access for the ReVive Earth demo. When Supabase is configured
// via environment variables, these methods will communicate with the
// Supabase Auth and database APIs. When not configured (for example
// during development without a backend), the code falls back to a simple
// in-memory mock user.

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Fallback demo user used when Supabase is not configured or the user is
// not authenticated. This ensures the app can still render pages and
// demonstrate features without connecting to a backend.
// When running without Supabase and without a logged-in user, `mockUser` is
// initialized as null. This causes isAuthenticated() to return false and
// prompts the UI to show the "Join ReVive" button. During runtime you
// can assign an object here to simulate a logged-in user if desired.
let mockUser = null;

export const base44 = {
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
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            return null;
          }
          // Merge the base profile with user_metadata. The metadata may
          // include fields like full_name and onboarding_completed.
          return {
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.phone || '',
            address: user.user_metadata?.address || '',
            bio: user.user_metadata?.bio || '',
            organization_name: user.user_metadata?.organization_name || '',
            user_type: user.user_metadata?.user_type || 'individual',
            total_recycled: user.user_metadata?.total_recycled || 0,
            onboarding_completed: Boolean(user.user_metadata?.onboarding_completed),
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
     * Initiates a login flow. When Supabase is configured this triggers
     * OAuth login with Google and returns (so Supabase will handle the
     * redirect). Otherwise it navigates to the fallback login page.
     */
    redirectToLogin: () => {
      if (isSupabaseConfigured) {
        // Redirect to Google sign-in using Supabase's built-in OAuth flow.
        // We pass the redirectTo option so that after sign-in the user
        // returns to the application root.
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
          },
        });
      } else if (typeof window !== 'undefined') {
        // In fallback mode, navigate to the placeholder login page
        window.location.href = '/login';
      }
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
      list: async (sort) => {
        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];
            const { data, error } = await supabase
              .from('recycling_activities')
              .select('id, material_type, weight, location, date, notes')
              .eq('user_id', user.id)
              .order('date', { ascending: false });
            if (error) {
              console.error('Supabase list error:', error);
              return [];
            }
            return data || [];
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
          },
          {
            id: '2',
            material_type: 'metal',
            weight: 1.2,
            location: 'Dallas',
            date: '2024-02-15',
            notes: 'Cans',
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
            };
            const { data: result, error } = await supabase
              .from('recycling_activities')
              .insert(insertData)
              .select('id, material_type, weight, location, date, notes')
              .single();
            if (error) throw error;
            // Also update the user's total_recycled in user metadata
            const newTotal = (user.user_metadata?.total_recycled || 0) + parseFloat(data.weight || 0);
            await supabase.auth.updateUser({ data: { total_recycled: newTotal } });
            return result;
          } catch (err) {
            console.error('Supabase create error:', err);
            return null;
          }
        }
        // Fallback: update the mock user
        const newActivity = { id: Date.now().toString(), ...data };
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
              .select('id, weight')
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
            // Update user's total_recycled
            const newTotal = Math.max(0, (user.user_metadata?.total_recycled || 0) - parseFloat(activity.weight || 0));
            await supabase.auth.updateUser({ data: { total_recycled: newTotal } });
          } catch (err) {
            console.error('Supabase delete error:', err);
          }
        }
        // In fallback mode we don't actually persist activities
      },
    },
  },
};