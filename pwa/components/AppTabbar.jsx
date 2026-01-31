import React from 'react';
import { Tabbar, TabbarLink, Icon } from 'konsta/react';

/**
 * AppTabbar
 * Native-style bottom tab bar using Konsta UI + Framework7 Icons
 */
export default function AppTabbar({ activeTab, onNavigate }) {
  const tabs = [
    { id: 'settings', path: '/settings', label: 'Settings', icon: 'gear_alt' },
    { id: 'account', path: '/account', label: 'Account', icon: 'person' },
    { id: 'capture', path: '/capture', label: 'Capture', icon: 'camera' },
    { id: 'impact', path: '/impact', label: 'Impact', icon: 'chart_bar' },
    { id: 'leaderboard', path: '/leaderboard', label: 'Ranks', icon: 'trophy' },
  ];

  return (
    <Tabbar
      labels
      translucent
      className="
        k-safe-area-inset-bottom
        border-t border-black/10 dark:border-white/10
        bg-white/80 dark:bg-black/60
        backdrop-blur-md
      "
    >
      {tabs.map((tab) => (
        <TabbarLink
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onNavigate?.(tab.path)}
          icon={<Icon icon={tab.icon} />}
          label={tab.label}
        />
      ))}
    </Tabbar>
  );
}