import { promises as fs } from "fs";
import path from "path";
import { projects, projectsBySlug, type ProjectMeta } from "@/data/projects";

export type GitlabMR = {
  iid: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  merged_at: string | null;
  source_branch: string;
  target_branch: string;
  labels: string[];
  files: string[];
  file_count: number;
  reviewers: string[];
  comment_count: number;
  web_url: string;
};

export type GitlabExport = {
  project_name: string;
  gitlab_name: string;
  description: string | null;
  web_url: string;
  created_at: string;
  last_activity_at: string;
  team_members: { username: string; name: string; access_level: number }[];
  merge_requests: GitlabMR[];
};

export type ProjectData = {
  meta: ProjectMeta;
  raw: GitlabExport;
  notableMRs: GitlabMR[];
};

const TRIVIAL_TITLE_RE =
  /^(merge( branch| remote-tracking branch)?|initial commit|wip|fix:? typo)\b/i;

function pickNotableMRs(mrs: GitlabMR[], max = 8): GitlabMR[] {
  return mrs
    .filter((m) => m.state === "merged" && !TRIVIAL_TITLE_RE.test(m.title))
    .sort((a, b) => b.file_count - a.file_count)
    .slice(0, max);
}

const DATA_DIR = path.resolve(process.cwd(), "..", "portfolio_data");

async function readJson(file: string): Promise<GitlabExport> {
  const buf = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(buf) as GitlabExport;
}

export async function loadProject(slug: string): Promise<ProjectData | null> {
  const meta = projectsBySlug[slug];
  if (!meta) return null;
  const raw = await readJson(meta.jsonFile);
  return {
    meta,
    raw,
    notableMRs: pickNotableMRs(raw.merge_requests),
  };
}

export async function loadAllProjects(): Promise<ProjectData[]> {
  const list = await Promise.all(
    projects
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(async (meta) => ({
        meta,
        raw: await readJson(meta.jsonFile),
      }))
  );
  return list.map(({ meta, raw }) => ({
    meta,
    raw,
    notableMRs: pickNotableMRs(raw.merge_requests),
  }));
}
