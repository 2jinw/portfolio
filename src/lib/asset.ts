// public/ 의 정적 자산 경로에 basePath(예: /portfolio)를 붙여준다.
// GitHub Pages 프로젝트 사이트처럼 서브경로로 배포될 때 이미지가 404 나지 않도록 한다.
// 로컬(basePath 없음)에서는 경로를 그대로 반환한다.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path) return path;
  // 외부 URL(data:, http 등)은 그대로 둔다.
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${normalized}`;
}
