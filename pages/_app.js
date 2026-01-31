import '../styles/globals.css';
// Import Konsta theme styles globally. The theme CSS must be imported
// from the Konsta React package (not `konsta/css`), otherwise Next.js
// cannot resolve the export. This import ensures that Konsta components
// render with the correct iOS/Material appearance.
import 'konsta/react/theme.css';
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
