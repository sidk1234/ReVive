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

export default function ImpactPage() {
  const router = useAppRouter();
  const { user, session, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    recyclableCount: 0,
    impactScore: 0,
  });

  useEffect(() => {
    if (isAuthenticated && session) {
      loadImpact();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, session]);

  const loadImpact = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('impact_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(60);

      if (error) throw error;

      const scoredEntries = (data || []).filter((e) => e.source === 'photo');
      const totalScans = scoredEntries.reduce((sum, e) => sum + (e.scan_count || 1), 0);
      const recyclableCount = scoredEntries.filter((e) => e.recyclable).length;
      const impactScore = recyclableCount;

      setEntries(data || []);
      setStats({ totalScans, recyclableCount, impactScore });
    } catch (error) {
      console.error('Error loading impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path) => {
    router.navigate(path);
  };

  return (
    <Page>
      <Navbar title="Impact" large transparent />
      
      <Block strong inset className="mt-4">
        <BlockTitle large>Your Impact</BlockTitle>
        
        {!isAuthenticated ? (
          <Card>
            <CardHeader>Sign in to track your impact</CardHeader>
            <CardContent>
              <p className="mb-4">
                Track your scans, see your impact, and sync your progress.
              </p>
              <Button large onClick={() => navigate('/account')}>
                Go to Account
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <Preloader size="w-8 h-8" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardHeader>No impact yet</CardHeader>
            <CardContent>
              <p>Scan an item from the camera tab and it will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card nested>
                <CardContent>
                  <div className="text-sm text-opacity-60 mb-1">SCANS</div>
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
                </CardContent>
              </Card>
              <Card nested>
                <CardContent>
                  <div className="text-sm text-opacity-60 mb-1">RECYCLABLE</div>
                  <div className="text-2xl font-bold">{stats.recyclableCount}</div>
                </CardContent>
              </Card>
              <Card nested>
                <CardContent>
                  <div className="text-sm text-opacity-60 mb-1">IMPACT</div>
                  <div className="text-2xl font-bold">{stats.impactScore}</div>
                </CardContent>
              </Card>
            </div>

            <List strong inset>
              {entries.map((entry) => (
                <ListItem
                  key={entry.id}
                  title={entry.item}
                  subtitle={`${entry.material} • ${entry.bin}`}
                  after={
                    <div className="text-right">
                      <div className={entry.recyclable ? 'text-green-500' : 'text-red-500'}>
                        {entry.recyclable ? 'Recyclable' : 'Not recyclable'}
                      </div>
                      {entry.source === 'text' && (
                        <div className="text-xs text-opacity-60 mt-1">Manual</div>
                      )}
                    </div>
                  }
                />
              ))}
            </List>
          </>
        )}
      </Block>

      <AppTabbar activeTab="impact" onNavigate={navigate} />
    </Page>
  );
}
