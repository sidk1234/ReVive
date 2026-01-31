import React from 'react';
// Import Framework7 core and React plugin. We only use the router parts of
// Framework7; no UI widgets are consumed. The lite bundle reduces
// footprint by excluding unused components.
import Framework7 from 'framework7/lite-bundle';
import Framework7React from 'framework7-react';
import { App as Framework7App, View as Framework7View } from 'framework7-react';

// Import Konsta UI provider. All visible UI components come from Konsta
// rather than Framework7, preserving native iOS/Material styling.
import { KonstaProvider } from 'konsta/react';

// Import global styles. Framework7 includes safe area handling and page
// transitions, while Konsta provides the native look and feel.
import 'framework7/css/bundle';
import 'konsta/css';

// Import routes for the PWA. These map paths to page components.
import routes from '../pwa/routes.js';

// Register the Framework7 React plugin.
Framework7.use(Framework7React);

export default function RevivePWA() {
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