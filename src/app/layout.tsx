import type { Metadata } from "next";
import { vazirmatn } from "@/lib/fonts";
import "./fonts.css";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "HS6Tools - Industrial E-Commerce Platform",
  description: "Premium industrial and woodworking tools manufacturer. High-quality diamond discs, cutters, clamps, and accessories.",
  keywords: "industrial tools, woodworking tools, diamond discs, cutters, clamps, manufacturing tools",
  authors: [{ name: "HS6Tools" }],
  creator: "HS6Tools",
  publisher: "HS6Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "HS6Tools - Industrial E-Commerce Platform",
    description: "Premium industrial and woodworking tools manufacturer",
    url: "http://localhost:3000",
    siteName: "HS6Tools",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HS6Tools - Industrial E-Commerce Platform",
    description: "Premium industrial and woodworking tools manufacturer",
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
