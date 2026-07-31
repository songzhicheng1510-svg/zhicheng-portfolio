/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhicheng portfolio",
  description:
    "Selected work across spatial intelligence, generative workflows, Rhino automation, and AIGC visualization.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Zhicheng portfolio",
    description:
      "Selected work across spatial intelligence, generative workflows, Rhino automation, and AIGC visualization.",
  },
  twitter: {
    card: "summary",
    title: "Zhicheng portfolio",
    description:
      "Selected work across spatial intelligence, generative workflows, Rhino automation, and AIGC visualization.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
