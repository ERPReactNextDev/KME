import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InstallPrompt from "./install-prompt";

const inter = Inter({
  weight: "100",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KME - Know My Employee",
  description: "Created in NextJs Developed By Fluxx Tech Solutions",
  icons: {
    icon: "/s.png",
  },
  manifest: "/manifest.json",
  // themeColor removed from metadata to avoid warning
};

// Optional: define viewport if needed
export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  minimumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* theme-color is directly in head, compliant sa Next.js 14+ */}
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className={`${inter.variable} font-sans antialiased relative`}>
        <ToastContainer />
        {children}

        {/* InstallPrompt with fixed position and high z-index */}
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <InstallPrompt />
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
