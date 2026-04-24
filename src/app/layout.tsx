import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "성장일기",
  description: "아이의 성장 과정을 기록한 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}