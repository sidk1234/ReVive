import dynamic from "next/dynamic";
import Head from "next/head";
const ReVivePWA = dynamic(() => import("../../components/pwa/ReVivePWA"), { ssr: false });

export default function ReViveAppPage() {
  return (
    <>
      <Head>
        <title>ReVive - App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="manifest" href="/app/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/app/icons/icon-192.png" />
      </Head>
      <ReVivePWA initialTab="scan" />
    </>
  );
}
