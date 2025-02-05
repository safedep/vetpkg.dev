import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Toaster } from "@/components/ui/toaster";

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
  title: "SafeDep | Open Source Software Supply Chain Security Platform",
  description:
    "Welcome to SafeDep. Onboard to SafeDep cloud, generate authentication credentials and access platform APIs",
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
      <UserProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
          <Theme>
            <main className="flex-grow">{children}</main>
            <Toaster />
          </Theme>
        </body>
      </UserProvider>
    </html>
  );
}
