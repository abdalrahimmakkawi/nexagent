import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NexAgent — AI Agents for Growing Businesses</title>
        <meta name="description" content="Custom AI agents for e-commerce and education businesses. Cut support costs 60%, capture leads 24/7. Deployed in under a week." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:," />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
