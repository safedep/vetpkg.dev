import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import Header from "@/components/app/header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "vet Open Source Packages",
  description:
    "vet Open Source Software (OSS) packages before using them in your projects. " +
    "Protect against malicious code, vulnerabilities, and licensing issues. ",
  icons: {
    icon: "/safedep.svg",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P8F0VCR11R"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P8F0VCR11R');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Theme>
          <Header />
          <main className="flex-grow">{children}</main>
          <Toaster />
        </Theme>
      </body>
    </html>
  );
}
