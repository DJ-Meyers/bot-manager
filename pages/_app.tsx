import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { Page } from "../components/layout/Page";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session}>) {

  return (
    <>
      <Head>
        <title>Page title</title>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
          />
      </Head>

      <SessionProvider session={session}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "dark",
          }}
        >
          <Page>
            <Component {...pageProps} />
          </Page>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}
