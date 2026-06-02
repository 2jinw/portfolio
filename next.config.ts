import type { NextConfig } from "next";

// GitHub Pages 프로젝트 사이트(/portfolio)로 배포할 때만 basePath 적용.
// 로컬 dev/빌드는 환경변수 없이 루트(/)로 동작.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // public/ 자산을 <Image src>로 참조할 때 basePath를 직접 붙이기 위해 클라이언트에 노출
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
