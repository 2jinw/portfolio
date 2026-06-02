export const profile = {
  name: { ko: "이진원", en: "Lee Jinwon" },
  title: "Full-stack Engineer · Mobile · Backend · Embedded Sim",
  motto: {
    en: "Build end-to-end. Bridge the gaps. Ship as one.",
    ko: "끝에서 끝까지, 사이를 잇고, 하나로 보낸다.",
  },
  about: {
    summary:
      "Flutter 앱부터 Spring/Django 백엔드, Isaac Lab 시뮬레이션과 라즈베리파이 디바이스 통합까지 — 한 프로젝트의 끝에서 끝까지 책임지는 풀스택 엔지니어를 지향합니다.",
    keywords: ["풀스택 통합", "디바이스-서버-앱 연동", "RL 시뮬레이션", "인프라 자동화"],
    role: "Full-stack Engineer 지향",
    interest: "End-to-end product delivery, Cross-layer integration, Reinforcement learning sims",
  },
  contact: {
    email: "ljin2091@naver.com",
    gitlab: "https://lab.ssafy.com/ljin2091",
    // SSAFY 사내 GitLab은 외부에서 로그인 없이 열람이 어렵습니다.
    // 외부 공개용 GitHub 프로필 — 채워지면 홈/상세 페이지에 GitHub 버튼이
    // 자동으로 노출됩니다. (비어 있으면 숨김)
    github: "https://github.com/2jinw",
  },
} as const;

/** SSAFY 사내 GitLab 접근 안내 — MR 링크 옆에 표기되는 공통 문구. */
export const GITLAB_ACCESS_NOTE =
  "SSAFY 사내 GitLab · 열람에 로그인이 필요할 수 있습니다";

export type Award = {
  year: string;
  scope: string;
  project: string;
  result?: string;
};

export const awards: Award[] = [
  {
    year: "2026",
    scope: "SSAFY 14기 공통PJT",
    project: "itda — AI 영상 제작 협업 플랫폼",
    result: "우수상 (1등)",
  },
];

export type ExperienceItem = {
  period: string;
  org: string;
  role: string;
  activities: string[];
};

export const experience: ExperienceItem[] = [
  {
    period: "2025.12 ~ 2026.05",
    org: "SSAFY 14기",
    role: "교육생 · 4개 프로젝트 완수",
    activities: [
      "관통PJT — 영화 커뮤니티 (마이페이지·한줄평·추천)",
      "공통PJT itda — 화상 협업 학습 플랫폼 (WebRTC·UI 통합)",
      "특화PJT AMR Sim — 다중 AMR 자율주행 시뮬레이션 (Isaac Lab/RL·인프라)",
      "자율PJT IMO — 스마트 글래스 운동 코치 (Flutter·백엔드·라즈베리파이 통합)",
    ],
  },
  // 인턴/외부 활동 있으면 위에 추가
];

export type EducationItem = {
  type: "Education" | "Certification";
  title: string;
  detail: string;
  status: string;
};

export const education: EducationItem[] = [
  {
    type: "Education",
    title: "SSAFY 14기 (Samsung SW Academy For Youth)",
    detail: "2025.07 – 2026.05 수료 예정",
    status: "수료 예정",
  },
  // 학력 / 자격증 정보가 더 있다면 여기 추가
  // { type: "Education", title: "○○대학교 ○○학과", detail: "20XX – 20XX", status: "졸업" },
  // { type: "Certification", title: "정보처리기사", detail: "", status: "취득" },
];
