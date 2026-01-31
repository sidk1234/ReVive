import React, { useState, useEffect } from 'react';
import { Page } from 'framework7-react';
import { Navbar, List, ListItem, Spinner } from 'konsta/react';
import { supabase } from '../supabaseClient.js';
import AppTabbar from '../components/AppTabbar.jsx';

/**
 * LeaderboardPage displays the top recycling performers. It queries
 * the `impact_leaderboard` view/table from Supabase which returns
 * users sorted by total points and total scans. Everyone can view
 * the leaderboard even if not signed in.
 */
export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('impact_leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(20);
        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error(err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <Page>
      <Navbar large title="Ranks" />
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <List strong inset>
            {entries.map((item, index) => (
              <ListItem
                key={item.user_id}
                title={`${index + 1}. ${item.display_name || 'Anonymous'}`}
                after={`${item.total_points || 0} pts`}
                subtitle={`${item.total_scans || 0} scans`}
              />
            ))}
          </List>
        )}
      </div>
      <AppTabbar activeTab="leaderboard" />
    </Page>
  );
}