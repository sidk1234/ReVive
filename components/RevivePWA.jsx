import React from 'react';
// Import Framework7 core and React plugin. We only use the router parts of
// Framework7; no UI widgets are consumed. The lite bundle reduces
// footprint by excluding unused components.
// We load Framework7 and its React bindings dynamically on the client to avoid
// Next.js build errors related to package exports. Dynamic import ensures
// these modules are only resolved in the browser and not during the build.
import { useState, useEffect } from 'react';

// Import Konsta UI provider. All visible UI components come from Konsta
// rather than Framework7, preserving native iOS/Material styling.
import { KonstaProvider } from 'konsta/react';

// Import global styles. Framework7 includes safe area handling and page
// transitions, while Konsta provides the native look and feel.
// We avoid statically importing Framework7's CSS here because it triggers
// Next.js export resolution errors in modern builds. Instead, we will
// dynamically import the CSS once the component mounts.
// Import Konsta theme styles. The generic `konsta/css` path is not exported in
// Konsta v5; instead import the theme stylesheet from the React build. See
// https://konstaui.com/react/installation for details.
import 'konsta/react/theme.css';

// Import routes for the PWA. These map paths to page components.
import routes from '../pwa/routes.js';

// We will register the Framework7 React plugin once both modules are loaded.

export default function RevivePWA() {
  // Hold loaded Framework7 components in state. Initially null until
  // modules load on the client.
  const [f7Components, setF7Components] = useState(null);

  useEffect(() => {
    // Run only on client
    let cancelled = false;
    async function loadFramework7() {
      try {
        // Dynamically import Framework7 core and its React plugin.
        const { default: Framework7 } = await import(
          /* webpackChunkName: "framework7-core" */ 'framework7/lite-bundle'
        );
        const {
          default: Framework7React,
          App: Framework7App,
          View: Framework7View,
        } = await import(
          /* webpackChunkName: "framework7-react" */ 'framework7-react'
        );
        // Register the React plugin with Framework7 core.
        Framework7.use(Framework7React);
        // Dynamically import Framework7's CSS bundle.
        await import(
          /* webpackChunkName: "framework7-css" */ 'framework7/css/bundle'
        );
        if (!cancelled) {
          setF7Components({ Framework7App, Framework7View });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load Framework7 modules', e);
      }
    }
    loadFramework7();
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing until Framework7 is loaded on the client.
  if (!f7Components) return null;

  const { Framework7App, Framework7View } = f7Components;
  return (
    <KonstaProvider theme="ios" safeAreas>
      {/* Framework7 App initialises the router; the `routes` array is
         defined in a separate file. The app name is ReVive to ensure
         correct identification in platform app lists. */}
      <Framework7App name="ReVive" theme="ios" routes={routes}>
        {/* A single main view holds the page stack. The initial URL is
             relative to the `/app/` base configured by Next.js routing. */}
        <Framework7View id="main-view" main url="/capture" />
      </Framework7App>
    </KonstaProvider>
  );
}