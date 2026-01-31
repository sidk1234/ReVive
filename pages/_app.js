import "../styles/globals.css";
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
