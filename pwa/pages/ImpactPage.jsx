import React from 'react';
import { Page, Block, BlockTitle, List, ListItem, Card, CardHeader, CardContent } from 'konsta/react';

/**
 * ImpactPage shows a placeholder history/impact view. In a real app this
 * would retrieve the user's recycling history and statistics from the
 * database. Here we simply display a static list.
 */
export default function ImpactPage() {
  const fakeHistory = [
    { id: 1, item: 'Water Bottle', recyclable: true, date: '2026-01-01' },
    { id: 2, item: 'Paper Cup', recyclable: false, date: '2026-01-02' },
  ];
  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Your Impact</BlockTitle>
        <List strong inset>
          {fakeHistory.map((h) => (
            <ListItem key={h.id} title={h.item} after={h.recyclable ? '♻️' : '🗑️'} subtitle={h.date} />
          ))}
        </List>
      </Block>
    </Page>
  );
}