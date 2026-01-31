import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";

// Instantiate a single QueryClient for the entire application. The client
// manages caching, deduplication and lifecycle of all queries and mutations.
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/app/manifest.webmanifest" />
        <meta name="theme-color" content="#10B981" />
        
        {/* iOS PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ReVive" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon-512.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
