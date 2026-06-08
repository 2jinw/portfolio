export type TechCategory = {
  name: string;
  subtitle?: string;
  items: string[];
};

export type SkillAxis = {
  label: string;
  /** 0–100. 본인이 손에 익은 정도 (자체 평가). */
  value: number;
  /** 한 줄 보조 설명 — 호버 시 참고. */
  detail?: string;
};

/**
 * 레이더 차트 데이터. 절대 점수가 아니라 "어떤 영역에 무게가 실렸나"의 분포.
 * IMO/AMR/itda/Movie 프로젝트의 실작업 분량을 기준으로 추정한 placeholder —
 * 본인 평가에 맞게 자유롭게 조정해줘.
 */
export const skillAxes: SkillAxis[] = [
  { label: "Mobile", value: 80, detail: "Flutter · IMO 앱 아키텍처/계층 통합" },
  { label: "Backend", value: 75, detail: "FastAPI · Django DRF · Spring Boot · API 명세 정합" },
  { label: "Infra", value: 70, detail: "Docker · Jenkins · Caddy · Nginx · EC2" },
  { label: "Sim · AI", value: 85, detail: "Isaac Lab · RL navigation · 멀티 도킹" },
  { label: "Frontend", value: 60, detail: "Vue.js · WebRTC 시그널링 · UI 통합" },
  { label: "Embedded", value: 70, detail: "Raspberry Pi · 앱-디바이스 핸드셰이크" },
];

export const techStack: TechCategory[] = [
  {
    name: "Languages",
    subtitle: "프로젝트에서 주력으로 쓴 언어",
    items: ["Python", "Dart", "Java", "TypeScript", "JavaScript"],
  },
  {
    name: "Frontend & Mobile",
    subtitle: "앱·웹 클라이언트",
    items: ["Flutter", "Vue.js", "React"],
  },
  {
    name: "Backend",
    subtitle: "API·서비스 서버",
    items: ["FastAPI", "Django REST Framework", "Spring Boot", "Node.js"],
  },
  {
    name: "Realtime · Data",
    subtitle: "실시간 통신과 데이터 저장",
    items: ["WebSocket", "WebRTC", "Redis", "MySQL", "PostgreSQL"],
  },
  {
    name: "Infra & DevOps",
    subtitle: "배포·운영 인프라",
    items: ["Docker", "Jenkins", "Nginx", "Caddy"],
  },
  {
    name: "Sim · AI · Embedded",
    subtitle: "특화 기술 — 시뮬레이션부터 디바이스까지",
    items: [
      "Isaac Lab",
      "Reinforcement Learning",
      "ROS",
      "Raspberry Pi",
    ],
  },
  {
    name: "Tools",
    subtitle: "협업·이슈·디자인",
    items: ["Git", "GitLab", "Figma", "Jira", "Mattermost", "Notion"],
  },
];
