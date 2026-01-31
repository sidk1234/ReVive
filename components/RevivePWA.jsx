import React from 'react';
import { useRouter } from 'next/router';
import {
  Tabbar,
  TabbarLink,
  Navbar,
  Icon
} from 'konsta/react';
import {
  Home as IconHome,
  Camera as IconCamera,
  ChartBar as IconChartBar,
  User as IconUser,
  Settings as IconSettings
} from 'framework7-icons/react';

// Import pages for each section of the PWA
import CapturePage from '../pwa/pages/CapturePage';
import ImpactPage from '../pwa/pages/ImpactPage';
import LeaderboardPage from '../pwa/pages/LeaderboardPage';
import SettingsPage from '../pwa/pages/SettingsPage';
import AccountPage from '../pwa/pages/AccountPage';
import AuthCallbackPage from '../pwa/pages/AuthCallbackPage';
import AuthResetPage from '../pwa/pages/AuthResetPage';
import OfflinePage from '../pwa/pages/OfflinePage';

/**
 * RevivePWA implements a simple client-side router on top of Next.js's
 * catch-all route. It renders a tab bar for navigation and the
 * corresponding page component for the current path. Framework7 is
 * used only for icons via `framework7-icons/react` and for transition
 * classes applied on page containers. Konsta UI components provide
 * styling and theming. Note: Only the core Konsta components are used; no
 * Framework7 router features are used.
 */
export default function RevivePWA() {
  const router = useRouter();
  // slug is an array of path segments after /app
  const { view } = router.query;
  const slug = Array.isArray(view) ? view : [];
  const currentPage = slug[0] || 'capture';

  // Determine which page to render
  let PageComponent;
  switch (currentPage) {
    case 'capture':
      PageComponent = CapturePage;
      break;
    case 'impact':
      PageComponent = ImpactPage;
      break;
    case 'leaderboard':
      PageComponent = LeaderboardPage;
      break;
    case 'settings':
      PageComponent = SettingsPage;
      break;
    case 'account':
      PageComponent = AccountPage;
      break;
    case 'auth':
      // /app/auth/callback and /app/auth/reset
      if (slug[1] === 'callback') PageComponent = AuthCallbackPage;
      else if (slug[1] === 'reset') PageComponent = AuthResetPage;
      else PageComponent = CapturePage;
      break;
    case 'offline':
      PageComponent = OfflinePage;
      break;
    default:
      PageComponent = CapturePage;
  }

  // Handler to navigate to a tab route
  const navigate = (path) => {
    router.push(`/app/${path}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top navbar with large title and back button if needed */}
      <Navbar title="ReVive" large transparent />
      {/* Render the current page */}
      <div className="flex-1 overflow-y-auto">
        <PageComponent />
      </div>
      {/* Tab bar for navigation */}
      <Tabbar labels className="safe-area-bottom">
        <TabbarLink
          active={currentPage === 'capture'}
          onClick={() => navigate('capture')}
          icon={<Icon ios={<IconCamera />} material={<IconCamera />} />}
          label="Capture"
        />
        <TabbarLink
          active={currentPage === 'impact'}
          onClick={() => navigate('impact')}
          icon={<Icon ios={<IconChartBar />} material={<IconChartBar />} />}
          label="Impact"
        />
        <TabbarLink
          active={currentPage === 'leaderboard'}
          onClick={() => navigate('leaderboard')}
          icon={<Icon ios={<IconHome />} material={<IconHome />} />}
          label="Leaderboard"
        />
        <TabbarLink
          active={currentPage === 'settings'}
          onClick={() => navigate('settings')}
          icon={<Icon ios={<IconSettings />} material={<IconSettings />} />}
          label="Settings"
        />
        <TabbarLink
          active={currentPage === 'account'}
          onClick={() => navigate('account')}
          icon={<Icon ios={<IconUser />} material={<IconUser />} />}
          label="Account"
        />
      </Tabbar>
    </div>
  );
}