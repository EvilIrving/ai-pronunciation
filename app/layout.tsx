import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;
const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl;
const metadataBase = appUrl ? new URL(appUrl) : undefined;
const siteName = "Words";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteName} - AI Pronunciation Assistant`,
    template: `%s | ${siteName}`,
  },
  description:
    "Words turns any English word into a Google Cloud Text-to-Speech audio clip so learners and speakers can refine pronunciation instantly.",
  keywords: [
    "AI pronunciation",
    "text to speech",
    "English dictionary audio",
    "Google Cloud Text-to-Speech",
    "language learning",
    "accent training",
  ],
  applicationName: siteName,
  category: "education",
  generator: "Next.js 15",
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} - AI Pronunciation Assistant`,
    description:
      "Enter a word and hear natural-sounding, studio-grade pronunciation in seconds with Google Cloud Text-to-Speech.",
    url: appUrl,
    siteName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Words - AI Pronunciation Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - AI Pronunciation Assistant`,
    description:
      "Hear how any English word should sound with instantly generated Google Cloud Text-to-Speech audio.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  themeColor: "#020617",
  colorScheme: "dark",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

const structuredData: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  description:
    "Words is an AI pronunciation helper that streams Google Cloud Text-to-Speech audio for any English word in seconds.",
  applicationCategory: "EducationApplication",
  operatingSystem: "Any",
};

if (appUrl) {
  structuredData.url = appUrl;
  structuredData.potentialAction = {
    "@type": "SearchAction",
    target: `${appUrl}/api/speak?word={search_term_string}`,
    "query-input": "required name=search_term_string",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-white`}
      >
        {children}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>
      </body>
    </html>
  );
}
