import React from 'react';
import { Tabbar, TabbarLink, Icon } from 'konsta/react';
import {
  Settings as IconSettings,
  Person as IconPerson,
  Camera as IconCamera,
  ChartBar as IconChartBar,
  Trophy as IconTrophy,
} from 'framework7-icons/react';

/**
 * AppTabbar renders the bottom navigation bar matching the Swift app structure:
 * Settings, Account, Capture, Impact, Leaderboard (Ranks)
 */
export default function AppTabbar({ activeTab, onNavigate }) {
  const tabs = [
    { id: 'settings', path: '/settings', label: 'Settings', icon: IconSettings },
    { id: 'account', path: '/account', label: 'Account', icon: IconPerson },
    { id: 'capture', path: '/capture', label: 'Capture', icon: IconCamera },
    { id: 'impact', path: '/impact', label: 'Impact', icon: IconChartBar },
    { id: 'leaderboard', path: '/leaderboard', label: 'Ranks', icon: IconTrophy },
  ];

  return (
    <Tabbar labels className="k-safe-area-inset-bottom" translucent>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <TabbarLink
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onNavigate && onNavigate(tab.path)}
            icon={<Icon ios={<IconComponent />} material={<IconComponent />} />}
            label={tab.label}
          />
        );
      })}
    </Tabbar>
  );
}
