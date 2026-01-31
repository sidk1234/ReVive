import React from 'react';
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
        <link rel="manifest" href="/app/manifest.webmanifest" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      {/*
        Global theming and typography have been moved into the global
        stylesheet (styles/globals.css) to avoid hydration mismatches.  The
        inline <style> tag previously defined the Inter font import and
        colour variables directly here, but Next.js escapes single quotes in
        server-rendered HTML, causing a mismatch when the same string is
        rendered on the client.  By centralising these declarations in
        globals.css we ensure a consistent CSS payload on both server and
        client.
      */}
      {children}
    </div>
  );
}
