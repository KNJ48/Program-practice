import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb-mono",
  display: "swap",
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CodeBase — プログラミング学習プラットフォーム",
  description:
    "HTML / CSS / JavaScript / TypeScript / Python をブラウザ上で学べる学習プラットフォーム。チュートリアル形式のレッスンと、自由にファイルを作って実行できるフリースペースを備えています。",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${jbMono.variable} ${notoJp.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
