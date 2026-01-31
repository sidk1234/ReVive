import React from 'react';
import { Tabbar, TabbarLink } from 'konsta/react';
import { useF7Router } from 'framework7-react';

/**
 * AppTabbar renders the bottom navigation bar. Each tab corresponds to
 * a major section of the app. Clicking a tab uses the Framework7
 * router to navigate to the associated path.
 *
 * The active tab is determined via the `activeTab` prop. When
 * implementing pages you can derive the active tab by examining the
 * current route's path.
 */
export default function AppTabbar({ activeTab }) {
  const router = useF7Router();

  function go(path) {
    router.navigate(path);
  }

  return (
    <Tabbar labels className="k-safe-area-inset-bottom">
      <TabbarLink
        active={activeTab === 'settings'}
        onClick={() => go('/settings')}
        label="Settings"
        icon="⚙️"
      />
      <TabbarLink
        active={activeTab === 'account'}
        onClick={() => go('/account')}
        label="Account"
        icon="👤"
      />
      <TabbarLink
        active={activeTab === 'capture'}
        onClick={() => go('/capture')}
        label="Capture"
        icon="📷"
      />
      <TabbarLink
        active={activeTab === 'impact'}
        onClick={() => go('/impact')}
        label="Impact"
        icon="📊"
      />
      <TabbarLink
        active={activeTab === 'leaderboard'}
        onClick={() => go('/leaderboard')}
        label="Ranks"
        icon="🏆"
      />
    </Tabbar>
  );
}