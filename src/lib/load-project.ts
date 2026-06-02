import { projects, projectsBySlug, type ProjectMeta } from "@/data/projects";

/**
 * 프로젝트 메타데이터 로더.
 *
 * 과거에는 상위 `portfolio_data/*.json`(GitLab 내보내기: 팀원 정보·MR·커밋 등)을
 * 읽어 상세 페이지에 노출했으나, 해당 섹션을 제거하면서 더 이상 사용하지 않는다.
 * 팀원 개인정보가 public 레포에 포함되는 것을 피하기 위해 JSON 의존을 완전히 제거하고
 * `src/data/projects.ts`의 큐레이션된 메타데이터만 사용한다.
 */
export async function loadProject(slug: string): Promise<ProjectMeta | null> {
  return projectsBySlug[slug] ?? null;
}

export async function loadAllProjects(): Promise<ProjectMeta[]> {
  return projects.slice().sort((a, b) => a.order - b.order);
}
