import type { Metadata } from "next";
import { vazirmatn } from "@/lib/fonts";
import "./fonts.css";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "HS6Tools",
  description: "Premium industrial and woodworking tools manufacturer.",
  keywords: "industrial tools, woodworking tools, diamond discs, cutters, clamps, manufacturing tools",
  authors: [{ name: "HS6Tools" }],
  creator: "HS6Tools",
  publisher: "HS6Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://hs6tools.com"),
  openGraph: {
    title: "HS6Tools",
    description: "Premium industrial and woodworking tools manufacturer",
    url: "https://hs6tools.com",
    siteName: "HS6Tools",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/favicon-512.png",
        width: 1200,
        height: 630,
        alt: "HS6Tools Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HS6Tools",
    description: "Premium industrial and woodworking tools manufacturer",
    images: ["/favicon-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
