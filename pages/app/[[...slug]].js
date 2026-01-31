import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';
import RevivePWA from '../../components/RevivePWA';

// Dynamically import pages to reduce bundle size
const CapturePage = dynamic(() => import('../../pwa/pages/CapturePage'), { ssr: false });
const ImpactPage = dynamic(() => import('../../pwa/pages/ImpactPage'), { ssr: false });
const LeaderboardPage = dynamic(() => import('../../pwa/pages/LeaderboardPage'), { ssr: false });
const SettingsPage = dynamic(() => import('../../pwa/pages/SettingsPage'), { ssr: false });
const AccountPage = dynamic(() => import('../../pwa/pages/AccountPage'), { ssr: false });
const AuthCallbackPage = dynamic(() => import('../../pwa/pages/AuthCallbackPage'), { ssr: false });
const AuthResetPage = dynamic(() => import('../../pwa/pages/AuthResetPage'), { ssr: false });
const OfflinePage = dynamic(() => import('../../pwa/pages/OfflinePage'), { ssr: false });

export default function ReviveAppPage() {
  const router = useRouter();
  const slug = router.query.slug || [];
  const page = slug[0] || 'capture';
  const subPage = slug[1];
  const isRoot = slug.length === 0;

  // Determine which page to render
  let PageComponent = CapturePage;
  if (page === 'impact') PageComponent = ImpactPage;
  else if (page === 'leaderboard') PageComponent = LeaderboardPage;
  else if (page === 'settings') PageComponent = SettingsPage;
  else if (page === 'account') PageComponent = AccountPage;
  else if (page === 'auth') {
    if (subPage === 'callback') PageComponent = AuthCallbackPage;
    else if (subPage === 'reset') PageComponent = AuthResetPage;
  } else if (page === 'offline') PageComponent = OfflinePage;

  // Add head tags for PWA
  return (
    <>
      <Head>
        <title>ReVive - Intelligent Recycling Assistant</title>
        <meta name="description" content="AI-powered recycling assistant with location-specific guidance" />
        <meta name="apple-mobile-web-app-title" content="ReVive" />
      </Head>
      <RevivePWA isRoot={isRoot}>
        <PageComponent />
      </RevivePWA>
    </>
  );
}