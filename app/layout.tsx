import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/instrument-serif-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-instrument-serif",
  fallback: ["Georgia", "serif"],
});

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
    <html lang="en" className={instrumentSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
