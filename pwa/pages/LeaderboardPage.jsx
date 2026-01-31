import React from 'react';
import { Page, Block, BlockTitle, List, ListItem } from 'konsta/react';

/**
 * LeaderboardPage shows a public leaderboard with dummy data. Replace
 * this with actual data from your Supabase view via the `get_public_leaderboard`
 * RPC or similar. Each list item displays a user and their total points.
 */
export default function LeaderboardPage() {
  const leaderboard = [
    { id: 1, name: 'Alice', points: 42 },
    { id: 2, name: 'Bob', points: 35 },
    { id: 3, name: 'Charlie', points: 27 },
  ];
  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Leaderboard</BlockTitle>
        <List strong inset>
          {leaderboard.map((row, index) => (
            <ListItem key={row.id} title={`${index + 1}. ${row.name}`} after={`${row.points} pts`} />
          ))}
        </List>
      </Block>
    </Page>
  );
}