import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chizunashi.example.com"),
  title: "チズナシ！ | チズナシ!",
  description:
    "地図を使わずに目的地の方向と距離だけで旅を楽しむ、モバイル特化のPWAコンパス。",
  applicationName: "チズナシ！",
  authors: [
    {
      name: "Trift合同会社",
      url: "https://www.trift3.com",
    },
  ],
  keywords: [
    "コンパス",
    "ナビゲーション",
    "PWA",
    "Next.js 16",
    "地図なし",
    "旅行",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSans.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
