// Framework7 route definitions for the ReVive Progressive Web App.
// Each route maps a path to a React component. All components are
// written using Konsta UI elements with Framework7 providing only
// routing and page stack management.

import CapturePage from './pages/CapturePage.jsx';
import ImpactPage from './pages/ImpactPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AuthCallbackPage from './pages/AuthCallbackPage.jsx';
import AuthResetPage from './pages/AuthResetPage.jsx';
import OfflinePage from './pages/OfflinePage.jsx';

const routes = [
  {
    path: '/capture',
    component: CapturePage,
  },
  {
    path: '/impact',
    component: ImpactPage,
  },
  {
    path: '/leaderboard',
    component: LeaderboardPage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
  {
    path: '/account',
    component: AccountPage,
  },
  {
    path: '/auth/callback',
    component: AuthCallbackPage,
  },
  {
    path: '/auth/reset',
    component: AuthResetPage,
  },
  {
    path: '/offline',
    component: OfflinePage,
  },
  // Default fallback route. When the user navigates to an undefined path
  // the Capture page is shown.
  {
    path: '(.*)',
    component: CapturePage,
  },
];

export default routes;