import React, { useState } from 'react';
import {
  Page,
  Block,
  BlockTitle,
  List,
  ListItem,
  Toggle,
  Segmented,
  SegmentedButton,
  ListInput,
  Button
} from 'konsta/react';

/**
 * SettingsPage lets users configure application preferences such as
 * appearance, location ZIP code, and toggles for using web search.
 * This version stores preferences in local component state; in a real
 * application you would persist preferences to localStorage or Supabase.
 */
export default function SettingsPage() {
  const [appearance, setAppearance] = useState('system');
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [zip, setZip] = useState('');
  const [haptics, setHaptics] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Settings</BlockTitle>
        <List strong inset>
          <ListItem
            title="Use Web Search"
            after={<Toggle checked={useWebSearch} onChange={(e) => setUseWebSearch(e.target.checked)} />} />
          <ListItem
            title="Enable Haptics"
            after={<Toggle checked={haptics} onChange={(e) => setHaptics(e.target.checked)} />} />
          <ListItem
            title="Reduce Motion"
            after={<Toggle checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />} />
          <ListItem title="Appearance">
            <Segmented strong onChange={(e) => setAppearance(e.target.value)}>
              <SegmentedButton active={appearance === 'system'} value="system">System</SegmentedButton>
              <SegmentedButton active={appearance === 'light'} value="light">Light</SegmentedButton>
              <SegmentedButton active={appearance === 'dark'} value="dark">Dark</SegmentedButton>
            </Segmented>
          </ListItem>
          <ListItem title="ZIP Code">
            <div className="flex gap-2 w-full">
              <ListInput
                type="text"
                placeholder="Enter ZIP"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="flex-grow"
              />
              <Button small onClick={() => setZip('00000')}>Auto</Button>
            </div>
          </ListItem>
        </List>
      </Block>
    </Page>
  );
}