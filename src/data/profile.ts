export const profile = {
  name: { ko: "이진원", en: "Lee Jinwon" },
  title: "Full-stack Engineer · Mobile · Backend · Simulation",
  motto: {
    en: "Build end-to-end. Bridge the gaps. Ship as one.",
    ko: "끝에서 끝까지, 사이를 잇고, 하나로 보낸다.",
  },
  about: {
    summary:
      "한 프로젝트를 앱부터 백엔드, 시뮬레이션, 디바이스까지 한 손으로 붙잡고 끝까지 책임지는 걸 좋아합니다. 계층과 계층 사이에서 자주 새는 부분 — 디바이스와 서버가 주고받는 신호, 화면과 데이터가 어긋나는 지점 — 을 찾아 메우는 일에 특히 재미를 느낍니다.",
    keywords: ["풀스택 통합", "디바이스-서버-앱 연동", "RL 시뮬레이션", "인프라 자동화"],
    role: "Full-stack Engineer 지향",
    interest: "End-to-end product delivery, Cross-layer integration, Reinforcement learning sims",
  },
  contact: {
    email: "ljin2091@naver.com",
    github: "https://github.com/2jinw",
  },
} as const;

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
    project: "잇다 — AI 영상 제작 협업 플랫폼",
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
      "공통PJT 잇다 — 화상 협업 학습 플랫폼 (WebRTC·UI 통합)",
      "특화PJT 적재적소 — 다중 AMR 자율주행 시뮬레이션 (Isaac Lab/RL·인프라)",
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
