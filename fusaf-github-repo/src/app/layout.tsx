import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу",
  description: "Офіційний сайт Федерації України зі Спортивної Аеробіки і Фітнесу (fusaf.org.ua). Реєстрація учасників за ролями, створення змагань, курси підготовки тренерів та суддів.",
  keywords: "спортивна аеробіка, фітнес, ФУСАФ, федерація, змагання, спортсмени, тренери, судді, fusaf.org.ua",
  authors: [{ name: "ФУСАФ" }],
  openGraph: {
    title: "ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу",
    description: "Офіційний сайт Федерації України зі Спортивної Аеробіки і Фітнесу",
    url: "https://fusaf.org.ua",
    siteName: "ФУСАФ",
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу",
    description: "Офіційний сайт Федерації України зі Спортивної Аеробіки і Фітнесу",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          <ClientBody>{children}</ClientBody>
        </Providers>
      </body>
    </html>
  );
}
