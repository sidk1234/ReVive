import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const fetchRoleForUser = async (supabaseAdmin, userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data?.role || null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server not configured for admin API.' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing auth token.' });
    return;
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Invalid auth token.' });
    return;
  }

  const role = await fetchRoleForUser(supabaseAdmin, userData.user.id);
  if (role !== 'admin' && role !== 'owner') {
    res.status(403).json({ error: 'Not authorized.' });
    return;
  }

  const { action, search, userId, updates, activityId } = req.body || {};

  try {
    if (action === 'listUsers') {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, phone, address, bio, organization_name, user_type, role, total_recycled');
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query.order('full_name', { ascending: true });
      if (error) throw error;
      res.status(200).json({ data: data || [] });
      return;
    }

    if (action === 'listPendingActivities') {
      const { data, error } = await supabaseAdmin
        .from('recycling_activities')
        .select('id, material_type, weight, location, date, notes, status, user_id')
        .eq('status', 'pending')
        .order('date', { ascending: false });
      if (error) throw error;
      res.status(200).json({ data: data || [] });
      return;
    }

    if (action === 'listUserActivities') {
      if (!userId) {
        res.status(400).json({ error: 'Missing userId.' });
        return;
      }
      const { data, error } = await supabaseAdmin
        .from('recycling_activities')
        .select('id, material_type, weight, location, date, notes, status, user_id')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      res.status(200).json({ data: data || [] });
      return;
    }

    if (action === 'updateActivity') {
      if (!activityId || !updates) {
        res.status(400).json({ error: 'Missing activityId or updates.' });
        return;
      }
      const { data: current, error: currentError } = await supabaseAdmin
        .from('recycling_activities')
        .select('id, user_id, weight, status')
        .eq('id', activityId)
        .single();
      if (currentError || !current) {
        res.status(404).json({ error: 'Activity not found.' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('recycling_activities')
        .update(updates)
        .eq('id', activityId)
        .select('id, material_type, weight, location, date, notes, status, user_id')
        .single();
      if (error) throw error;

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
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, total_recycled')
          .eq('id', current.user_id)
          .single();
        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ total_recycled: Math.max(0, (profile.total_recycled || 0) + delta) })
            .eq('id', current.user_id);
        }
      }

      res.status(200).json({ data });
      return;
    }

    if (action === 'updateUserProfile') {
      if (!userId || !updates) {
        res.status(400).json({ error: 'Missing userId or updates.' });
        return;
      }
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('id, email, full_name, phone, address, bio, organization_name, user_type, role, total_recycled')
        .single();
      if (error) throw error;
      res.status(200).json({ data });
      return;
    }

    if (action === 'setUserRole') {
      if (!userId || !updates?.role) {
        res.status(400).json({ error: 'Missing userId or role.' });
        return;
      }
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ role: updates.role })
        .eq('id', userId)
        .select('id, role')
        .single();
      if (error) throw error;
      res.status(200).json({ data });
      return;
    }

    res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Admin API error.' });
  }
}
