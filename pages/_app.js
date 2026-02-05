import "../styles/globals.css";
import "framework7-icons/css/framework7-icons.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
// Use the repo's kitchen-sink Konsta implementation (confirmed working)
import { App as KonstaApp } from "../kitchen-sink/konsta-src/react/konsta-react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("ios");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    setTheme(isAndroid ? "material" : "ios");
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <KonstaApp theme={theme} safeAreas>
          <Component {...pageProps} />
        </KonstaApp>
      </QueryClientProvider>
    </>
  );
}
