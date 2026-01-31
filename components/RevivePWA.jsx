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
// Note: the Konsta theme CSS is imported globally in `pages/_app.js`. Do not
// import it here, as global CSS imports are only permitted in the custom
// app component in Next.js.

// Import routes for the PWA. These map paths to page components.
import routes from '../pwa/routes.js';

// We will register the Framework7 React plugin once both modules are loaded.

export default function RevivePWA() {
  // Hold loaded Framework7 components in state. Initially null until
  // modules load on the client.
  const [f7Components, setF7Components] = useState(null);

  useEffect(() => {
    // Only run in the browser. Framework7 and its React bindings must not
    // execute during server-side rendering. By constructing the module
    // identifiers as variables and using the `webpackIgnore` directive, we
    // prevent Next.js from attempting to resolve these modules at build
    // time. The CSS bundle is also loaded dynamically.
    let cancelled = false;
    async function loadFramework7() {
      try {
        const f7CoreModule = 'framework7/lite-bundle';
        const f7ReactModule = 'framework7-react';
        const f7CssModule = 'framework7/css/bundle';
        const { default: Framework7 } = await import(
          /* webpackIgnore: true */ f7CoreModule
        );
        const {
          default: Framework7React,
          App: Framework7App,
          View: Framework7View,
        } = await import(
          /* webpackIgnore: true */ f7ReactModule
        );
        Framework7.use(Framework7React);
        await import(
          /* webpackIgnore: true */ f7CssModule
        );
        if (!cancelled) {
          setF7Components({ Framework7App, Framework7View });
        }
      } catch (e) {
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