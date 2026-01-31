import React, { useState, useEffect } from 'react';
import { Page } from 'framework7-react';
import {
  Navbar,
  List,
  ListItem,
  Card,
  CardHeader,
  CardContent,
  Button,
  Spinner,
} from 'konsta/react';
import AppTabbar from '../components/AppTabbar.jsx';
import { supabase } from '../supabaseClient.js';
import { useF7Router } from 'framework7-react';

/**
 * ImpactPage displays the user's recycling impact. When logged in
 * the user sees a list of their most recent scan results along with
 * points. Anonymous guests are prompted to sign in to access this
 * feature.
 */
export default function ImpactPage() {
  const router = useF7Router();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadEntries() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setUser(null);
          setEntries([]);
          setLoading(false);
          return;
        }
        setUser(session.user);
        const { data, error } = await supabase
          .from('impact_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('scanned_at', { ascending: false })
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
    loadEntries();
  }, []);

  const isGuest = !user;

  return (
    <Page>
      <Navbar large title="Impact" />
      {isGuest ? (
        <div className="p-4 space-y-4">
          <p>You need to sign in to view your impact history.</p>
          <Button large onClick={() => router.navigate('/account')}>
            Sign in
          </Button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-4">
          <Spinner />
        </div>
      ) : (
        <div className="p-4">
          {entries.length === 0 ? (
            <p>No entries yet. Start scanning to see your impact.</p>
          ) : (
            <List strong inset>
              {entries.map((entry) => (
                <ListItem
                  key={entry.id}
                  title={entry.item}
                  subtitle={`${new Date(entry.scanned_at).toLocaleString()}`}
                  after={`${entry.points || 0} pts`}
                />
              ))}
            </List>
          )}
        </div>
      )}
      <AppTabbar activeTab="impact" />
    </Page>
  );
}