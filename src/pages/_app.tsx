import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NexAgent — AI Agents for Growing Businesses</title>
        <meta name="description" content="Custom AI support agents for e-commerce, restaurants, legal firms and education. Deployed in 3 days from $99/month. No IT team needed." />
        <meta name="keywords" content="AI agent, customer support automation, chatbot, e-commerce AI, small business AI, NexAgent" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#07070d" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nexagent-one.vercel.app" />
        <meta property="og:title" content="NexAgent — AI Agents for Growing Businesses" />
        <meta property="og:description" content="Custom AI support agents deployed in 3 days from $99/month. 94% ticket resolution. No IT needed." />
        <meta property="og:site_name" content="NexAgent" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NexAgent — AI Agents for Growing Businesses" />
        <meta name="twitter:description" content="Custom AI support agents deployed in 3 days from $99/month. 94% ticket resolution. No IT needed." />
        <link rel="icon" href="data:," />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
