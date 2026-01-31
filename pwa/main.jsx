import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Framework7 core and React plugin. We only use the router parts of
// Framework7; no UI widgets are consumed. The lite bundle reduces
// footprint by excluding unused components.
import Framework7 from 'framework7/lite-bundle';
import { App as Framework7App, View as Framework7View } from 'framework7-react';

// Import Konsta UI provider. All visible UI components come from Konsta
// rather than Framework7, preserving native iOS/Material styling.
import { KonstaProvider } from 'konsta/react';

// Import global styles. Framework7 includes safe area handling and page
// transitions, while Konsta provides the native look and feel.
import 'framework7/css/bundle';
import 'konsta/css';

import routes from './routes.js';

// Register the Framework7 React plugin.
Framework7.use(Framework7React);

// Create the root of the application. The Framework7 <App> and <View>
// components orchestrate page routing and transitions. KonstaProvider
// provides theming and safe area management.
ReactDOM.createRoot(document.getElementById('app')).render(
  <KonstaProvider theme="ios" safeAreas>
    {/* Framework7 App initialises the router; the `routes` array is
         defined in a separate file. */}
    <Framework7App name="ReVive" theme="ios" routes={routes}>
      {/* A single main view holds the page stack. The initial URL is
           relative to the `/app/` base configured in vite.config.js. */}
      <Framework7View id="main-view" main url="/capture" />
    </Framework7App>
  </KonstaProvider>
);