import Head from "next/head";
import { useMemo } from "react";
import { ReVivePWA } from "../../components/pwa/ReVivePWA";

function slugToTab(slugArr) {
  const slug = (slugArr && slugArr.length ? slugArr[0] : "scan").toLowerCase();
  if (slug === "settings") return "settings";
  if (slug === "impact") return "impact";
  if (slug === "leaderboard") return "leaderboard";
  if (slug === "account") return "account";
  return "scan";
}

export default function ReViveAppCatchAll({ slug }) {
  const initialTab = useMemo(() => slugToTab(slug), [slug]);
  return (
    <>
      <Head>
        <title>ReVive — App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="manifest" href="/app/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/app/icons/icon-192.png" />
      </Head>
      <ReVivePWA initialTab={initialTab} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      slug: params.slug || [],
    },
  };
}
