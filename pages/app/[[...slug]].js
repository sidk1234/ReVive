import dynamic from 'next/dynamic';

// Dynamically import the PWA shell to disable server‑side rendering. The
// Konsta UI and Framework7 components require browser APIs and must
// render only on the client. Setting `ssr: false` tells Next.js to
// defer rendering until after hydration.
const RevivePWA = dynamic(() => import('../../components/RevivePWA'), {
  ssr: false,
});

export default function ReviveAppPage() {
  return <RevivePWA />;
}