import "../styles/globals.css";
import "framework7-icons/css/framework7-icons.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { App as KonstaApp } from "konsta/react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <KonstaApp theme="ios">
          <Component {...pageProps} />
        </KonstaApp>
      </QueryClientProvider>
    </>
  );
}