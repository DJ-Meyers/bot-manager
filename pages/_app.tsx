import { AppProps } from "next/app";
import Head from "next/head";
import { Loader, MantineProvider } from "@mantine/core";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { Page } from "../components/layout/Page";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { ReactElement } from "react";
import { NextComponentType, NextPageContext } from "next";
import { AuthEnabledComponentConfig } from "../utils/auth";

interface children {
  children: ReactElement
}

type NextComponentWithAuth = NextComponentType<NextPageContext, any, {}> &
  Partial<AuthEnabledComponentConfig>;

type AppAuthProps = AppProps & {
  Component: NextComponentWithAuth;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppAuthProps) {

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
          <ModalsProvider>
            <NotificationsProvider position="top-right">
              {Component.authenticationEnabled ? (
                <Auth>
                  <Page>
                    <Component {...pageProps} />
                  </Page>
                </Auth>
              ) : (
                <Page>
                  <Component {...pageProps} />
                </Page>    
              )}
              
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}

const Auth = ({ children }: children) => {
  const { status } = useSession({ required: true });

  if (status === "loading") {
    return <Loader />
  }

  return children;
}
