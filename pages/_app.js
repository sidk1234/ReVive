import '../styles/globals.css';
// Import Konsta theme styles globally. The theme CSS must be imported
// from the Konsta React package (not `konsta/css`), otherwise Next.js
// cannot resolve the export. This import ensures that Konsta components
// render with the correct iOS/Material appearance.
// Import Konsta's CSS from the generic entrypoint. Using `konsta/css`
// ensures compatibility with Konsta v3 and avoids importing files
// that are not exported by the package (like `konsta/react/theme.css`).
import 'konsta/css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Instantiate a single QueryClient for the entire application. The client
// manages caching, deduplication and lifecycle of all queries and mutations.
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
