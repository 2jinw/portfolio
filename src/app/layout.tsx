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

// GitHub Pages 배포 주소. metadataBase로 OG 이미지·canonical이 절대경로로 생성됨.
const SITE_ORIGIN = "https://2jinw.github.io";
const SITE_URL = "https://2jinw.github.io/portfolio/";

const SITE_DESCRIPTION =
  "Flutter 앱 · Spring/Django 백엔드 · Isaac Lab 시뮬레이션 · 라즈베리파이까지 — 끝에서 끝까지 책임지는 풀스택 엔지니어 이진원의 포트폴리오.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
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
    url: SITE_URL,
    // basePath(/portfolio) 때문에 메타 이미지 경로는 전체 절대 URL로 직접 지정해야
    // 미리보기가 정상 노출됨. (Next 메타 라우트가 basePath를 안 붙이는 이슈 회피)
    images: [
      {
        url: `${SITE_URL}og.png`,
        width: 1200,
        height: 630,
        alt: "이진원 · Full-stack Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "이진원 · Full-stack Engineer Portfolio",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}og.png`],
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
