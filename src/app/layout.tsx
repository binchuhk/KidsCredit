import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KidsCredit 小朋友积分",
  description: "家长加分、孩子申请兑换的家庭积分系统",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dff3ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${fredoka.variable} ${nunito.variable}`}
        style={
          {
            ["--font-display" as string]: "var(--font-fredoka), sans-serif",
            ["--font-body" as string]: "var(--font-nunito), system-ui, sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
