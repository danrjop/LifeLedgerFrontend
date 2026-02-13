import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { CookieConsentProvider } from "@/lib/cookie-consent-context";
import { AuthProvider } from "@/lib/auth-context";
import CookieConsent from "@/components/ui/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "LifeLedger",
  description: "Your personal document and expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-bg-primary text-fg-primary`}
      >
        <CookieConsentProvider>
          <CookieConsent />
          <AuthProvider>
            {children}
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
