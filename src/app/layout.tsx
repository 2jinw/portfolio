import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { FloatingShapes } from "@/components/floating-shapes";
import { Splash } from "@/components/splash";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// 배포 후 실제 도메인을 채우면 OG 이미지·canonical URL이 절대경로로 생성됩니다.
// 예: const SITE_URL = "https://jinwon.dev";
// const SITE_URL = "https://<your-domain>";

const SITE_DESCRIPTION =
  "Flutter 앱 · Spring/Django 백엔드 · Isaac Lab 시뮬레이션 · 라즈베리파이까지 — 끝에서 끝까지 책임지는 풀스택 엔지니어 이진원의 포트폴리오.";

export const metadata: Metadata = {
  // metadataBase: new URL(SITE_URL), // 배포 도메인이 정해지면 주석 해제
  title: {
    default: "이진원 · Full-stack Engineer Portfolio",
    template: "%s · 이진원 Portfolio",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "이진원",
    "포트폴리오",
    "풀스택 엔지니어",
    "Full-stack Engineer",
    "Flutter",
    "Spring Boot",
    "Django",
    "Isaac Lab",
    "WebRTC",
    "SSAFY",
  ],
  authors: [{ name: "이진원 (Lee Jinwon)" }],
  creator: "이진원 (Lee Jinwon)",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "이진원 · Portfolio",
    title: "이진원 · Full-stack Engineer Portfolio",
    description: SITE_DESCRIPTION,
    // url: SITE_URL,
    // images: ["/og.png"], // 1200×630 OG 이미지를 public/에 두고 metadataBase 설정 후 활성화
  },
  twitter: {
    card: "summary_large_image",
    title: "이진원 · Full-stack Engineer Portfolio",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link">
          본문 바로가기
        </a>
        {/*
          스플래시 깜빡임(FOUC) 방지 게이트. beforeInteractive 전략은 초기 HTML의
          <head>에 주입되어 하이드레이션 전에 실행되므로, 첫 페인트 전에
          splash-pending 클래스를 붙일 수 있다. (raw <script>는 Next 16에서 경고)
        */}
        <Script id="splash-gate" strategy="beforeInteractive">
          {`(function(){try{if(sessionStorage.getItem('splash-seen-v1')!=='1'){document.documentElement.classList.add('splash-pending');}}catch(e){}})();`}
        </Script>
        <Splash />
        <FloatingShapes />
        <div className="splash-stage flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
