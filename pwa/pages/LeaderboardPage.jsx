import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Card,
  CardHeader,
  CardContent,
  Preloader,
  Button,
} from 'konsta/react';
import { useAppRouter } from '../hooks/useAppRouter';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import AppTabbar from '../components/AppTabbar';

export default function LeaderboardPage() {
  const router = useAppRouter();
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the public RPC function
      const { data, error: rpcError } = await supabase.rpc('get_public_leaderboard', {
        limit: 50,
      });

      if (rpcError) throw rpcError;
      setEntries(data || []);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path) => {
    router.navigate(path);
  };

  return (
    <Page>
      <Navbar title="Leaderboard" large transparent />
      
      <Block strong inset className="mt-4">
        <BlockTitle large>Top Recyclers</BlockTitle>
        <p className="text-opacity-60 mb-4">
          Top recyclers based on verified daily impact.
        </p>

        {!isAuthenticated && (
          <Card className="mb-4">
            <CardHeader>Sign in to appear on the leaderboard</CardHeader>
            <CardContent>
              <Button large onClick={() => navigate('/account')}>
                Go to Account
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Preloader size="w-8 h-8" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>Error</CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button outline onClick={loadLeaderboard} className="mt-2">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <CardHeader>No leaderboard data yet</CardHeader>
            <CardContent>
              <p>Sign in and start scanning to appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <List strong inset>
            {entries.map((entry, index) => (
              <ListItem
                key={entry.user_id || index}
                title={`#${index + 1} ${entry.display_name || 'Anonymous'}`}
                subtitle={`${entry.recyclable_count || 0} recyclable • ${entry.total_scans || 0} scans`}
                after={
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-500">
                      {entry.total_points || 0}
                    </div>
                    <div className="text-xs text-opacity-60">points</div>
                  </div>
                }
              />
            ))}
          </List>
        )}
      </Block>

      <AppTabbar activeTab="leaderboard" onNavigate={navigate} />
    </Page>
  );
}
