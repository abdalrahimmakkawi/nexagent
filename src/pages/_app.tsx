import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NexAgent — AI Agents for Growing Businesses</title>
        <meta name="description" content="Custom AI support agents for e-commerce, restaurants, legal firms and education businesses. Deployed in 3 days from $99/month. No IT team needed." />
        <meta name="keywords" content="AI agent, customer support automation, chatbot, e-commerce AI, small business AI, NexAgent" />
        <meta name="author" content="NexAgent" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph — for LinkedIn, Facebook previews */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nexagent-one.vercel.app" />
        <meta property="og:title" content="NexAgent — AI Agents for Growing Businesses" />
        <meta property="og:description" content="Custom AI support agents deployed in 3 days from $99/month. 94% ticket resolution rate. No IT team needed." />
        <meta property="og:image" content="https://nexagent-one.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="NexAgent" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nexagent" />
        <meta name="twitter:title" content="NexAgent — AI Agents for Growing Businesses" />
        <meta name="twitter:description" content="Custom AI support agents deployed in 3 days from $99/month. 94% ticket resolution rate. No IT needed." />
        <meta name="twitter:image" content="https://nexagent-one.vercel.app/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07070d" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
