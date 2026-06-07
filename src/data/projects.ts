export type Outcome = {
  value: string;
  label: string;
  detail?: string;
};

export type Problem = {
  title: string;
  problem: string;
  approach: string;
  result: string;
  evidence?: { label: string; href?: string };
};

export type TechDecision = {
  tech: string;
  why: string;
};

export type ProjectMedia = {
  kind: "gif" | "screenshot" | "preview" | "architecture" | "video";
  title: string;
  src: string;
  alt: string;
  caption: string;
};

export type ProjectLink = {
  label: string;
  href: string;
  note: string;
  /**
   * MR 화면 스크린샷 경로 (예: "/project-media/imo/mr-83.png").
   * SSAFY 사내 GitLab은 외부에서 열람이 어렵기 때문에, 면접관이 링크 없이도
   * 변경 내용을 확인할 수 있도록 스크린샷을 넣어두면 좋습니다. 비어 있으면
   * 상세 페이지에 "내부망 · 로그인 필요" 안내만 노출됩니다.
   */
  screenshot?: string;
};

/** 기획 배경 — 왜 이 프로젝트가 필요했는지. 잡지 article의 lede에 해당. */
export type ProjectBackground = {
  /** 어떤 사용자/시장 문제를 풀려고 했나 (1~2문단) */
  problem: string;
  /** 인용·관찰·데이터 포인트 (없으면 생략) */
  evidence?: string[];
  /** 우리 팀의 가설/접근 (어떤 방향으로 풀려고 했나) */
  approach?: string;
};

export type ProjectMeta = {
  slug: string;
  jsonFile: string;
  displayName: string;

  /** ① 한 줄 임팩트 요약 — 무엇을 · 어떤 문제를 · 어떤 결과로 */
  impact: string;

  period: string;

  /** ② 기획 배경 — 잡지 article의 lede. 면접관이 "왜 만들었나" 묻는 자리. */
  background?: ProjectBackground;

  /** ③ 빠르게 읽히는 수치 2~3개 */
  stats: Outcome[];

  /** ③ 내 역할 — 팀 구성 · 내 담당 파트 한정 */
  role: {
    team: string;
    myPart: string;
  };

  /** ④ 핵심 문제 해결 2~3개 — 문제 → 판단 → 결과 */
  problems: Problem[];

  /** ⑤ 기술 선택 이유 — 핵심 2~3개, trade-off 포함 */
  techDecisions: TechDecision[];

  /** ⑥ 수치 기반 성과 — Before/After 또는 실제 수치 */
  outcomes: Outcome[];

  /** ⑦ 시각 자료 */
  media: ProjectMedia[];

  /** ⑧ MR 링크 */
  featuredMRs: ProjectLink[];

  /** ⑨ 회고 */
  retrospective: {
    lesson: string;
    nextTime: string;
  };

  /** 보조 정보 */
  techStack: string[];
  accentColor: string;
  order: number;
};

export const projects: ProjectMeta[] = [
  {
    slug: "imo",
    jsonFile: "04_자율PJT.json",
    displayName: "IMO",
    impact:
      "스마트 글래스로 운동 자세를 보고, 라즈베리파이에서 추정한 데이터를 앱이 받아 통계·코치로 돌려주는 풀스택 운동 코치. 디바이스–서버–앱 3개 계층을 사용자 의도에 맞게 묶는 게 과제였다.",
    period: "2026.04 – 2026.05 · 6주 · 자율PJT",
    background: {
      problem:
        "운동 코칭 앱은 많지만, 정작 자세를 \"본다\"는 부분은 사용자가 직접 영상을 찍어 올리는 데 의존한다. 그러다 보니 한 세트가 끝날 때마다 동작이 끊겨 운동에 몰입하기 어렵고, 코칭 데이터도 그때그때 단발성으로만 남는다. 우리는 사용자가 운동 중에 시선을 떼지 않고도 자세 피드백·통계·코치 응답을 받을 수 있어야 한다고 봤다.",
      evidence: [
        "홈트레이닝/헬스장 사용자가 정확한 자세 피드백 없이 반복 운동을 이어가면 부상·정체로 이어진다는 관찰 — 운동 중에는 폼을 점검할 손이 없다.",
        "기존 운동 앱들은 한 세트가 끝날 때마다 사용자가 직접 영상을 찍거나 입력해야 해서, 흐름이 끊기고 누적 기록이 들쭉날쭉했다.",
      ],
      approach:
        "스마트 글래스(촬영) → 라즈베리파이(자세 추정) → 백엔드(세션·통계·챗봇) → Flutter 앱(피드백·기록) 4계층을 한 흐름으로 묶어, 사용자는 글래스만 쓰고 있으면 나머지가 자동으로 굴러가는 운동 사이클을 만들기로 했다.",
    },
    stats: [
      {
        value: "4계층",
        label: "글래스 → Pi → 서버 → 앱",
        detail: "한 사이클이 끝까지 도는 E2E 흐름",
      },
      {
        value: "1회 호출",
        label: "달력 한 달치 + 마커",
        detail: "달력·리스트가 GET /sessions를 공유",
      },
      {
        value: "2환경",
        label: "compose override 분리",
        detail: "로컬은 Redis 포트 노출, 운영은 내부망 전용",
      },
    ],
    role: {
      team: "5인 팀 (앱·백·디바이스 분담)",
      myPart:
        "Flutter 앱 초기 아키텍처, 백엔드 세션/통계 API, 라즈베리파이 ↔ 앱 실시간 핸드셰이크 프로토콜, Redis/Docker 환경 통합",
    },
    problems: [
      {
        title: "디바이스가 사용자 의도를 무시하고 자동 진입했다",
        problem:
          "캘리브레이션이 끝나면 Pi가 곧바로 monitoring으로 진입했다. 사용자가 글래스를 쓰기도 전에 세션이 잡혀 누적 통계가 오염됐다.",
        approach:
          "monitoring 진입 권한을 Pi에서 앱으로 옮겼다. PiMessageType.startWorkout을 새로 만들어 앱의 \"운동 시작\" 버튼만 트리거로 인정하도록 못 박고, WorkoutRepository까지 호출 경로를 다시 깔았다.",
        result:
          "글래스 미착용 시 세션 자동 진입 0건. 운동 시작이 사용자 의도와 일치하면서 통계 데이터의 출처가 분명해졌다.",
        evidence: {
          label: "MR !83 · 앱-Pi 양방향 운동 시작 핸드셰이크",
          href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/83",
        },
      },
      {
        title: "주간 추세 막대가 잘못된 요일에 찍혔다",
        problem:
          "월요일에 3회 운동하면 막대가 일·월·화 자리에 1개씩 흩어졌다. 백엔드가 세션 순서대로 trend values를 append했고, 앱은 그 배열을 그대로 쌓아 막대 모양까지 깨졌다.",
        approach:
          "집계 키를 \"세션 순서\"에서 \"일자 기준 7일 슬롯\"으로 교체했다. 앱은 같은 날 다중 세션을 한 막대로 합쳐 그리도록 다시 그렸다.",
        result:
          "월요일 3회는 월요일 막대 하나에 누적된다. 주간 그래프가 비로소 요일을 가리킨다.",
        evidence: {
          label: "MR !101 · 주간 추세 일자별 7일 슬롯 매핑",
          href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/101",
        },
      },
      {
        title: "세션 조회 API가 화면이 필요한 모양과 어긋났다",
        problem:
          "달력은 한 달치 + 마커, 리스트는 필터·페이징이 필요한데 기존 GET /sessions는 둘을 한 번에 못 줬다. 화면마다 2~3회 호출이 붙었다.",
        approach:
          "쿼리 파라미터를 date/month/exerciseType + page/size로 통일하고, 응답에 sessions·exerciseDates·pagination을 한 묶음으로 담아 API-07 명세로 못 박았다.",
        result:
          "달력이 한 달치를 1회 호출로 받는다. 리스트가 같은 엔드포인트를 그대로 재사용하면서 화면별 분기 코드가 사라졌다.",
        evidence: {
          label: "MR !25 · GET /sessions 명세 정합",
          href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/25",
        },
      },
      {
        title: "로컬 디버깅용 Redis 노출이 운영 환경에 그대로 새어 나갈 위험이 있었다",
        problem:
          "Pi·서버·앱이 Redis를 공유 상태 버스로 썼다. 로컬은 디버깅을 위해 6379 포트를 호스트에 열어야 했고, 같은 compose를 EC2에 그대로 올리면 운영 Redis가 외부에 노출됐다.",
        approach:
          "compose를 base + override 패턴으로 쪼갰다. docker-compose.local.yml은 6379를 호스트에 매핑, docker-compose.prod.yml은 내부 네트워크에만 묶이도록 설정. Gemini API key와 DB 자격증명은 .env로 빼내 이미지에서 분리했다.",
        result:
          "같은 이미지를 환경 파일만 갈아 끼우면 로컬과 EC2에 다른 노출 규칙으로 뜬다. 운영 Redis 포트가 외부로 열린 채 배포되는 경로는 설정 단에서 막혔다.",
      },
    ],
    techDecisions: [
      {
        tech: "Flutter",
        why: "Android/iOS 동시 출시가 필요했고 디바이스 통신이 핵심이라 빠른 빌드-실기기 검증 사이클이 중요했다. React Native 대비 단일 코드베이스에서 BLE/WebSocket 같은 디바이스 채널을 안정적으로 다루기 쉬워 선택했다.",
      },
      {
        tech: "Redis (in-memory state bus)",
        why: "Pi·앱·서버 3자가 운동 세션 상태를 공유해야 하는데 DB polling으로는 latency와 부하가 누적된다. in-memory key로 상태를 주고받으면 코드가 단순해지고, 세션 종료 시 TTL로 자연 만료시킬 수 있어 청소 로직이 따로 필요 없다.",
      },
      {
        tech: "Docker Compose override (local / prod 분리)",
        why: "같은 이미지를 환경 파일만 바꿔 띄우려면 단일 compose로는 부족했다. base + override 패턴으로 로컬은 Redis를 노출하고 운영은 내부 네트워크에만 두는 식으로 분리하면, 배포 실수로 민감 포트가 열리는 사고를 구조적으로 막을 수 있다.",
      },
      {
        tech: "Spring Boot + Django 이원화",
        why: "세션·통계·인증처럼 트랜잭션이 분명한 영역은 Spring Boot에, Gemini 호출과 챗봇·LLM 응답처럼 파이썬 생태계 자산이 풍부한 영역은 Django에 두는 게 팀의 개발 속도와 검증 자원 모두에 유리했다.",
      },
    ],
    outcomes: [
      {
        value: "0건",
        label: "글래스 미착용 시 세션 자동 진입",
        detail: "monitoring 진입 권한을 Pi → 앱 버튼으로 이관",
      },
      {
        value: "1회 호출",
        label: "달력 한 달치 페치",
        detail: "달력·리스트가 GET /sessions 한 엔드포인트 공유",
      },
      {
        value: "7일 슬롯",
        label: "주간 추세 집계 키",
        detail: "세션 append → 일자 매핑으로 교체",
      },
      {
        value: "내부망 전용",
        label: "운영 Redis 6379",
        detail: "compose override로 호스트 포트 매핑 차단",
      },
    ],
    media: [
      {
        kind: "preview",
        title: "대표 흐름 보드",
        src: "/project-media/imo/preview.svg",
        alt: "IMO 앱의 온보딩, 운동 시작, 통계/챗봇 흐름을 요약한 다이어그램",
        caption:
          "실제 앱 캡처가 남아 있지 않아, 포트폴리오용으로 핵심 사용자 흐름을 다시 정리한 보드.",
      },
      {
        kind: "screenshot",
        title: "캐릭터 자산",
        src: "/project-media/imo/mascot-report-wait.png",
        alt: "IMO 프로젝트의 운동 결과 대기 화면용 캐릭터 자산",
        caption:
          "운동 종료 후 결과 대기 흐름에 활용한 대표 캐릭터 자산. 앱의 친화적 톤을 만드는 요소였다.",
      },
      {
        kind: "architecture",
        title: "시스템 아키텍처",
        src: "/project-media/imo/architecture.svg",
        alt: "IMO의 smart glass, Raspberry Pi, backend, Flutter app, Redis/Gemini 구성을 설명한 다이어그램",
        caption:
          "스마트 글래스, Pi, 서버, 앱, Redis/Gemini가 어떻게 연결되는지 포트폴리오용으로 재구성한 아키텍처.",
      },
    ],
    featuredMRs: [
      {
        label: "MR !83 · 앱-Pi 양방향 운동 시작 핸드셰이크",
        href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/83",
        note: "사용자 버튼을 기준으로 monitoring 진입 시점을 제어한 핵심 변경.",
      },
      {
        label: "MR !25 · GET /sessions 명세 정합 (API-07)",
        href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/25",
        note: "달력과 리스트 화면을 한 엔드포인트로 맞춘 API 정리.",
      },
      {
        label: "MR !101 · 주간 추세 7일 슬롯 매핑",
        href: "https://lab.ssafy.com/s14-final/S14P31C203/-/merge_requests/101",
        note: "통계 집계와 앱 시각화가 어긋나던 문제를 함께 수정.",
      },
    ],
    retrospective: {
      lesson:
        "디바이스·서버·앱이 얽힌 흐름에서는 \"상태의 소유자가 누구인가\"부터 정해져야 했다. 핸드셰이크 이슈는 그 결정이 늦었을 때 작은 트리거 하나가 전체를 오염시킨다는 걸 보여줬다.",
      nextTime:
        "다음에는 상태 머신 다이어그램을 첫 주에 합의하고, 메시지마다 어떤 권한을 위임하는지 타입 수준에서 명시하겠다.",
    },
    techStack: [
      "Flutter",
      "Spring Boot",
      "Django",
      "Redis",
      "Docker",
      "Raspberry Pi",
      "WebSocket",
      "Gemini API",
    ],
    accentColor: "#2d6b8c",
    order: 1,
  },
  {
    slug: "amr-sim",
    jsonFile: "03_특화PJT.json",
    displayName: "AMR 시뮬레이션 플랫폼",
    impact:
      "Isaac Lab 위에서 자율이동로봇(AMR) 다대수가 동시에 학습·도킹·서비스 사이클을 도는 시뮬레이션 환경. 단일 로봇 학습을 6/12/18대 스케일링까지 끌어올리는 게 과제였다.",
    period: "2026.02 – 2026.04 · 6주 · 특화PJT",
    background: {
      problem:
        "물류·서비스 현장에서 AMR을 다대수로 운용하려면 충돌 회피·도킹·서비스 사이클을 함께 학습해야 한다. 그런데 실기로 6대 이상을 동시에 돌리는 건 공간·안전·전력 비용이 크고, 알고리즘 검증 단계에서는 더더욱 부담스럽다. 시뮬레이션에서 먼저 다대수 환경을 만들어, 실기 부담 없이 정책을 검증·확장하는 길이 필요했다.",
      evidence: [
        "단일 AMR 학습은 정착돼 있어도, 다대수 동시 학습에서는 정책 자체보다 자산 참조·미션 큐·환경 충돌 같은 비(非)알고리즘 문제에 더 많은 시간이 들어가는 패턴이 반복된다.",
        "도킹까지는 학습이 잘 되더라도 도킹 이후의 retreat / returning 사이클이 정의돼 있지 않으면 다음 작업으로 연결되지 않아, 시뮬레이션이 \"한 번 도킹하고 끝\"으로 멈춘다.",
      ],
      approach:
        "Isaac Lab 위에서 학습 환경(rl_navigation 패키지) · 플레이 런타임(play_navigation_multi) · 배포 인프라(Jenkins/Caddy/EC2)를 한 라인 위에 정리해, 6/12/18대 스케일링 실험과 도킹 이후 서비스 사이클까지 같은 코드베이스에서 굴러가도록 만들기로 했다.",
    },
    stats: [
      {
        value: "6 → 18대",
        label: "스케일링 폭",
        detail: "같은 코드베이스에서 config만 갈아 끼우는 분기",
      },
      {
        value: "3단계",
        label: "도킹 이후 큐 사이클",
        detail: "retreat → returning → done",
      },
      {
        value: "self-host CI",
        label: "Jenkins on EC2",
        detail: "GPU·Isaac Sim 의존을 그대로 흡수",
      },
    ],
    role: {
      team: "5인 팀 (시뮬·학습·인프라 분담)",
      myPart:
        "AMR navigation 학습 환경(asset/config/scene/planner) 구성, 멀티 도킹 서비스 런타임, 스케일링 실험 환경, EC2/Caddy/Jenkins 배포 인프라",
    },
    problems: [
      {
        title: "멀티 AMR 도킹 후 서비스 흐름이 끊겼다",
        problem:
          "도킹까지는 학습이 잘 됐다. 다만 도킹 이후 retreat / returning / done 사이클이 정의돼 있지 않아 시뮬레이션이 \"한 번 도킹하고 끝\"으로 멈췄다.",
        approach:
          "play_navigation_multi.py를 새로 두고 도킹 이후 retreat → returning → done을 큐 기반 사이클로 못 박았다. service-v1 학습 환경을 함께 추가해 런타임과 학습 기준을 같은 줄에 맞췄다.",
        result:
          "도킹 이후 3단계 사이클이 큐 위에서 자동으로 굴러간다. 멀티 도킹 시나리오가 한 번 시작되면 같은 패턴으로 반복된다.",
        evidence: {
          label: "MR !110 · 멀티 도킹 서비스 런타임 및 service-v1 학습 환경",
          href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/110",
        },
      },
      {
        title: "학습 환경을 늘릴 때마다 환경/경로 설정을 다시 뜯어야 했다",
        problem:
          "단일 navigation 코드를 멀티대로 늘릴 때마다 asset/config 경로가 깨지고 scene이 충돌했다. 다대수 학습이라는 본 문제 전에 환경 재구성이 매번 발목을 잡았다.",
        approach:
          "isaaclab 경로를 rl_navigation 패키지로 재구성했다. 단일·멀티 학습 환경을 같은 패키지에서 공유하도록 묶고, N대 환경 추가가 config 한 줄 변경으로 끝나도록 정책 코드와 실험 코드를 분리했다.",
        result:
          "6/12/18대 실험이 같은 코드베이스에서 config만 갈아 끼우는 분기로 굴러간다. 환경 재구성에 들어가던 시간이 학습 튜닝 쪽으로 옮겨갔다.",
        evidence: {
          label: "MR !156 · AMR 최적대수 스케일링 실험 환경",
          href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/156",
        },
      },
      {
        title: "실험과 배포가 따로 굴러가서 결과 재현이 흔들렸다",
        problem:
          "Isaac Lab 학습 결과를 팀원이 확인하려면 각자 로컬 환경을 맞춰야 했다. 환경이 자주 바뀌니 \"같은 코드인데 결과가 다르다\"는 일이 반복됐고, GitHub Actions로는 GPU·Isaac Sim 의존을 끌어올 수 없었다.",
        approach:
          "Jenkins를 EC2에 셀프호스팅. build → deploy → verify를 같은 서버 맥락에서 돌리고, Caddy로 HTTPS 자동화를 붙여 실험 dashboard 주소를 빠르게 깔았다. 학습·런타임·대시보드는 Docker 컨테이너 단위로 격리했다.",
        result:
          "코드 push가 곧장 배포·재현으로 이어진다. 팀원이 각자 로컬 셋업을 다시 빌드하던 비용이 \"머지 후 자동\"으로 옮겨갔다.",
        evidence: {
          label: "MR !21 · Docker and EC2 deployment setup",
          href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/21",
        },
      },
    ],
    techDecisions: [
      {
        tech: "Isaac Lab",
        why: "GPU 병렬 시뮬레이션과 RL 학습 툴체인이 한곳에 있어, 학습 환경과 플레이 테스트를 같은 문맥에서 돌릴 수 있었다. Gazebo/Webots 대비 다대수 환경에서 step throughput이 높고, 자산 참조·미션 큐를 패키지 단위로 정리하기 좋아 스케일링 실험에 유리했다.",
      },
      {
        tech: "rl_navigation 패키지화 + service-v1 학습 환경 분리",
        why: "단일·멀티 학습 코드를 한 트리에 두면 변경 한 번에 모든 실험이 깨졌다. 정책 코드와 실험 환경(scene/config/mission)을 패키지 경계로 분리하면 N대 추가가 config 변경만으로 끝나서, 학습 본 문제에 더 집중할 수 있었다.",
      },
      {
        tech: "Jenkins on EC2 (self-hosted)",
        why: "Isaac Sim/학습 스택은 GPU·OS·드라이버 의존이 커서 GitHub Actions 같은 매니지드 러너로는 재현이 어려웠다. 셀프호스팅으로 build → deploy → verify를 같은 서버 맥락에서 돌려 \"내 컴에선 됐는데\" 문제를 구조적으로 줄였다.",
      },
      {
        tech: "Caddy reverse proxy",
        why: "nginx 대비 HTTPS 자동화가 단순해서 실험 dashboard 주소를 빠르게 붙일 수 있었다. 운영 인프라 학습에 쓸 시간을 줄여, 인프라보다 실험 자체에 시간을 더 쓰는 트레이드오프를 의식적으로 택했다.",
      },
    ],
    outcomes: [
      {
        value: "6 → 18대",
        label: "스케일링 분기",
        detail: "config만 갈아 끼우는 같은 코드베이스",
      },
      {
        value: "3단계",
        label: "도킹 이후 큐 사이클",
        detail: "retreat → returning → done 자동 진행",
      },
      {
        value: "push → deploy",
        label: "학습 환경 재현",
        detail: "Jenkins/EC2 self-host + Caddy HTTPS 자동화",
      },
      {
        value: "1 패키지",
        label: "rl_navigation",
        detail: "단일·멀티 학습 코드가 한 트리에 공존",
      },
    ],
    media: [
      {
        kind: "screenshot",
        title: "시뮬레이터 맵 캡처",
        src: "/project-media/amr/layer-add-guide.png",
        alt: "Isaac Sim 맵 레이어 구성 화면 캡처",
        caption:
          "실험 맵에 오버레이 자산을 얹어 시나리오를 구성할 때 사용한 실제 시뮬레이터 화면.",
      },
      {
        kind: "architecture",
        title: "실험/배포 아키텍처",
        src: "/project-media/amr/architecture.svg",
        alt: "Isaac Lab, 멀티 도킹 런타임, dashboard, Jenkins/Caddy/EC2 흐름을 그린 아키텍처",
        caption:
          "학습 환경, 런타임, 텔레메트리, 배포 경로를 한 장으로 정리한 포트폴리오용 아키텍처.",
      },
    ],
    featuredMRs: [
      {
        label: "MR !110 · 멀티 도킹 서비스 런타임 및 service-v1 학습 환경",
        href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/110",
        note: "도킹 이후 서비스 사이클과 새 학습 환경을 함께 추가한 대표 MR.",
      },
      {
        label: "MR !156 · 6/12/18대 스케일링 실험 환경",
        href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/156",
        note: "같은 코드베이스에서 다대수 실험을 돌릴 수 있게 한 확장 작업.",
      },
      {
        label: "MR !21 · Docker and EC2 deployment setup",
        href: "https://lab.ssafy.com/s14-mobility-smarthome-sub1/S14P21C206/-/merge_requests/21",
        note: "로컬 검증과 EC2 배포 경로를 연결한 인프라 시작점.",
      },
    ],
    retrospective: {
      lesson:
        "다대수 RL은 정책 튜닝보다 경로·자산 참조·미션 파일 구조가 먼저 흔들렸다. 학습 코드와 플레이 런타임의 경계를 어디에 두느냐가 실제 학습에 쓸 수 있는 시간을 결정했다.",
      nextTime:
        "다음에는 첫 주부터 env/config/log 포맷을 고정하고, 1대 → 6대 → 12대 smoke 시나리오를 자동화해 스케일 문제를 학습 전에 미리 드러내겠다.",
    },
    techStack: [
      "Isaac Lab",
      "RL",
      "Python",
      "ROS",
      "Docker",
      "Jenkins",
      "EC2",
      "Caddy",
    ],
    accentColor: "#7c4f8a",
    order: 2,
  },
  {
    slug: "itda",
    jsonFile: "02_공통PJT.json",
    displayName: "itda",
    impact:
      "WebRTC로 다인 협업을 묶고 통합 대시보드 UI에서 룸·타임라인·세션을 한 번에 관리하는 AI 영상 제작 협업 플랫폼.",
    period: "2026.01 – 2026.02 · 6주 · 공통PJT",
    background: {
      problem:
        "AI 영상 제작 협업은 시나리오 작성, 씬 편집, 타임라인 정리, 실시간 회의가 보통 서로 다른 도구에 흩어져 있다. 그러다 보니 협업 중간에 도구를 옮겨 다니면서 맥락이 끊기고, 누가 무엇을 보고 있는지가 화면 사이에서 사라진다. 우리 팀은 시나리오·씬·타임라인·화상 통화를 한 화면 안에서 굴리는 협업 공간이 필요하다고 봤다.",
      evidence: [
        "기존 영상 제작 협업 흐름은 시나리오 도구(문서) → 편집 도구(타임라인) → 회의 도구(화상)가 분리돼 있어, 같은 프로젝트인데도 사용자가 여러 탭을 동시에 띄우고 맥락을 머릿속에서 합쳐야 했다.",
        "WebRTC 기반 소규모 협업은 SFU 운영 비용 없이 P2P로도 6명 수준까지 잘 굴러간다는 일반 관찰이 있어, 통합 협업 공간의 MVP를 P2P로 시작하는 게 현실적이었다.",
      ],
      approach:
        "Vue 기반 통합 워크스페이스에 chat·presence·rtc 3개 협업 채널을 projectId 기준으로 묶고, MiniTimeline과 사이드바를 공통 셸로 정리해 시나리오 → 씬 편집 → 회의가 같은 화면 계층에서 연결되도록 만들기로 했다.",
    },
    stats: [
      {
        value: "3채널",
        label: "chat · presence · rtc",
        detail: "projectId 기준 단일 라이프사이클",
      },
      {
        value: "6명",
        label: "WebRTC Mesh 통화 범위",
        detail: "P2P 전제로 문서·UI·코드 스코프 통일",
      },
      {
        value: "1 store",
        label: "collabStore",
        detail: "join → subscribe → media 순서를 보유",
      },
    ],
    role: {
      team: "6인 팀",
      myPart: "WebRTC 시그널링 처리, 사이드바·MiniTimeline UI 통합, 라우팅 정리",
    },
    problems: [
      {
        title: "협업 채널이 페이지마다 흩어져 실시간 상태가 어긋났다",
        problem:
          "프로젝트 상세·씬 편집·타임라인 레이아웃이 각자 소켓·프레즌스·RTC 연결을 품었다. 페이지 이동 때 구독 해제와 재연결 순서가 어긋나 협업 바가 흔들렸고, WebRTC peer가 라우트 전환마다 재생성되면서 미디어 스트림이 끊겼다.",
        approach:
          "collabStore에 chat / presence / rtc 채널을 projectId 기준으로 모았다. socketManager와 peerConnectionService의 join → subscribe → media 순서를 명시적으로 못 박고, 레이아웃은 공통 사이드바와 협업 패널 슬롯을 공유해 페이지가 바뀌어도 구독이 끊기지 않도록 묶었다.",
        result:
          "대시보드·상세·에디터가 같은 협업 store 하나를 본다. peer 재연결로 인한 미디어 끊김 회귀가 사라졌고, 6명 Mesh 전제가 코드·문서·UI에서 같은 기준으로 정렬됐다.",
        evidence: {
          label: "협업 채널 3종(chat/presence/rtc) + 6명 Mesh 설계",
        },
      },
      {
        title: "레이아웃과 라우팅 충돌 때문에 UI 통합 속도가 느렸다",
        problem:
          "MiniTimeline·사이드바·프로젝트/씬 편집 레이아웃을 여러 브랜치가 동시에 건드렸다. 클릭 흐름과 URL 파라미터가 엇갈리면 화면 전환이 깨졌고, 데모 직전 회귀가 이 영역에서 반복됐다.",
        approach:
          "공통 레이아웃과 라우터 경계를 다시 그렸다. projectId/sceneId 파라미터를 기준으로 페이지 책임을 나누고, 충돌이 잦은 공통 셸은 merge 단위를 잘게 쪼개 회귀 범위를 좁혔다. 데모 안정화 MR(!69)로 흐름을 한 번 되감은 뒤 다시 통합했다.",
        result:
          "프로젝트 상세 → 씬 편집 진입 흐름이 다시 일정해졌다. 협업 UI와 MiniTimeline이 같은 화면 계층에 올라갔고, 데모 직전 회귀의 원인 범위가 좁아졌다.",
        evidence: {
          label: "MR !70 · 라우팅 수정",
          href: "https://lab.ssafy.com/s14-webmobile1-sub1/S14P11C205/-/merge_requests/70",
        },
      },
    ],
    techDecisions: [
      {
        tech: "WebRTC P2P (Mesh)",
        why: "최대 6명 통화를 MVP 범위로 잡았기 때문에 SFU 서버를 따로 운영할 만한 트래픽이 아니었다. P2P Mesh는 시그널링만 우리 서버를 거치고 미디어는 클라이언트끼리 직접 주고받아, 운영 비용·인프라 복잡도를 낮추는 대신 인원 확장은 포기하는 트레이드오프였다.",
      },
      {
        tech: "Vue.js + Pinia (collabStore)",
        why: "편집기 상태와 협업 상태(채널 구독·peer 연결·미디어 트랙)를 분리해서 다뤄야 했다. Composition API + Pinia 조합은 store 단위로 책임을 자르기 쉬워, 페이지가 바뀌어도 협업 store 하나가 채널 라이프사이클을 들고 있는 구조를 만들 수 있었다.",
      },
      {
        tech: "STOMP presence + 채널 라우팅 분리",
        why: "chat은 브로드캐스트, presence는 1:1 큐, rtc는 시그널링 메시지처럼 채널마다 라우팅 패턴이 달랐다. 같은 소켓 위에서 STOMP destination으로 나눠두면 레이아웃이 달라도 협업 UI를 같은 규칙으로 재사용할 수 있었다.",
      },
    ],
    outcomes: [
      {
        value: "3채널",
        label: "chat·presence·rtc",
        detail: "projectId 기준으로 묶인 단일 라이프사이클",
      },
      {
        value: "1 store",
        label: "collabStore",
        detail: "페이지가 바뀌어도 채널 구독 주체가 동일",
      },
      {
        value: "6명",
        label: "WebRTC Mesh 설계 범위",
        detail: "문서·코드·UI 스코프가 같은 기준으로 정렬",
      },
      {
        value: "join → subscribe → media",
        label: "협업 채널 초기화 순서",
        detail: "socketManager · peerConnectionService 진입 경로 고정",
      },
    ],
    media: [
      {
        kind: "video",
        title: "완성 영상 (실제 생성 결과)",
        src: "/project-media/itda/demo.mp4",
        alt: "itda로 생성한 씬 영상 결과물",
        caption:
          "itda 안에서 AI로 만든 씬 영상 결과물. 텍스트·이미지에서 출발해 씬 단위로 생성·병합된 실제 출력물이다.",
      },
      {
        kind: "gif",
        title: "AI 시나리오 생성",
        src: "/project-media/itda/scenario.gif",
        alt: "itda의 AI 시나리오 생성 화면 GIF",
        caption:
          "장르·분위기·씬 개수를 입력하면 AI가 씬별 스토리를 짜주는 실제 동작 GIF.",
      },
      {
        kind: "screenshot",
        title: "협업 대시보드",
        src: "/project-media/itda/dashboard.png",
        alt: "itda 대시보드. 우상단에 접속 중인 팀원 아바타, 우하단에 실시간 통화 바가 떠 있다",
        caption:
          "우상단 아바타(MK·SJ·YH…)는 같은 작업 공간에 들어와 있는 팀원 표시. 우하단 'Live' 바는 화면을 옮겨 다녀도 끊기지 않는 실시간 통화·협업 바다.",
      },
      {
        kind: "screenshot",
        title: "노드 씬 에디터 + 협업",
        src: "/project-media/itda/scene-editor.png",
        alt: "itda 노드 기반 씬 에디터와 마스터 이미지 생성 사이드바, 우하단 실시간 통화 바",
        caption:
          "노드 기반 씬 에디터와 마스터 이미지 생성 사이드바. 우하단 'Live' 바에서 마이크·카메라·화면 공유·채팅을 켠 채 같은 화면을 보며 작업한다.",
      },
      {
        kind: "screenshot",
        title: "타임라인 · 영상 병합",
        src: "/project-media/itda/timeline.png",
        alt: "itda 타임라인 화면. 비디오 미리보기와 클립 트랙, 영상 병합 버튼",
        caption:
          "확정한 클립을 타임라인에 배치하고 '영상 병합하기'로 최종 영상을 만든다. 협업 'Live' 바는 이 화면에서도 그대로 유지된다.",
      },
      {
        kind: "architecture",
        title: "시스템 아키텍처",
        src: "/project-media/itda/architecture.png",
        alt: "itda의 프론트엔드, 백엔드, Redis, S3, Google Cloud를 연결한 시스템 아키텍처",
        caption:
          "프로젝트 README에 포함돼 있던 실제 아키텍처 이미지. 협업, AI 작업, 배포 흐름이 한 장에 담겨 있다.",
      },
    ],
    featuredMRs: [
      {
        label: "MR !70 · 라우팅 수정",
        href: "https://lab.ssafy.com/s14-webmobile1-sub1/S14P11C205/-/merge_requests/70",
        note: "프로젝트/씬 편집 전환이 흔들리던 경로를 다시 맞춘 정리 MR.",
      },
      {
        label: "MR !69 · 원상복구",
        href: "https://lab.ssafy.com/s14-webmobile1-sub1/S14P11C205/-/merge_requests/69",
        note: "데모 직전 흐름 안정화와 UI 회귀를 되돌린 보수 MR.",
      },
    ],
    retrospective: {
      lesson:
        "실시간 협업은 미디어 처리보다 이벤트 라우팅과 재접속 순서가 먼저였다. UI는 그 위에 올라오는 결과물에 가깝다.",
      nextTime:
        "다음에는 collab contract(chat/presence/rtc)와 reconnect 시나리오를 첫 주부터 fixture로 만들고, 공통 셸 변경은 별도 브랜치로 격리하겠다.",
    },
    techStack: ["Vue.js", "WebRTC", "Spring Boot", "Node.js", "Docker", "S3"],
    accentColor: "#6e8a3e",
    order: 3,
  },
  {
    slug: "movie",
    jsonFile: "01_관통PJT.json",
    displayName: "MovieApp",
    impact:
      "영화 추천·한줄평·마이페이지를 갖춘 영화 커뮤니티. 첫 풀스택 협업 프로젝트로, 사용자 콘텐츠 흐름(좋아요·한줄평·나중에 볼)을 끝에서 끝까지 묶는 게 과제였다.",
    period: "2025.12 · 1주 · 관통PJT",
    background: {
      problem:
        "1주짜리 첫 풀스택 협업 프로젝트로, 영화 데이터를 활용해 사용자가 자기 취향을 정리·공유하는 공간을 만드는 게 과제였다. 단순 카탈로그가 아니라 \"내 활동이 모이는 곳\"이 되려면, 좋아요·한줄평·나중에 볼 같은 사용자 행동이 한 화면에서 연결돼야 했다.",
      evidence: [
        "영화 추천/메타데이터 서비스는 많지만, 한줄평·좋아요·나중에 볼 같은 사용자 활동이 한 마이페이지에 통합돼 있지 않으면 \"내 취향 기록\"이 화면 사이에 흩어진다는 일반적 관찰이 있었다.",
        "1주 단위 짧은 프로젝트라서, 메타데이터 수집·관리에 시간을 쓰는 대신 사용자 행동 흐름과 협업 워크플로우(브랜치/MR) 자체를 배우는 데 시간을 더 쓰는 편이 맞았다.",
      ],
      approach:
        "TMDB로 영화 메타데이터 부담을 외부 API에 위임하고, 사용자 활동(좋아요·한줄평·나중에 볼)은 watchlist 관계 모델로 묶어 마이페이지 한 화면에 모은다. 추천 영역은 사용자 반응 신호를 가볍게 활용해 단순 인기 목록과 차별화한다.",
    },
    stats: [
      {
        value: "4흐름",
        label: "직접 맡은 사용자 기능",
        detail: "마이페이지 · 한줄평 · 나중에 볼 · 추천",
      },
      {
        value: "watchlist",
        label: "활동 통합 관계 모델",
        detail: "좋아요·저장·한줄평이 같은 단위로 조회",
      },
      {
        value: "1주",
        label: "관통PJT 기간",
        detail: "첫 풀스택 협업 + Vue/DRF 학습 동시 진행",
      },
    ],
    role: {
      team: "3인 팀",
      myPart: "마이페이지(프로필/좋아요/한줄평), 한줄평 작성·조회, 추천 콘텐츠 큐",
    },
    problems: [
      {
        title: "사용자 활동이 화면 사이에 흩어져 마이페이지가 비어 보였다",
        problem:
          "좋아요·한줄평·나중에 볼이 영화·커뮤니티·계정 화면에 따로 살았다. 마이페이지가 프로필 정보만 보여주고 정작 \"내 흔적\" 자리는 비어 있었다.",
        approach:
          "watchlist 관계를 모델·migration에 추가했다. movies/community/accounts 뷰를 묶어 MyPageView에서 프로필·저장 목록·한줄평을 한 흐름으로 노출. 1주 일정이라 데이터 모델을 먼저 못 박고 화면을 그 위에 얹는 순서로 진행했다.",
        result:
          "마이페이지가 활동 허브로 자리잡았다. 좋아요·한줄평·나중에 볼이 같은 화면 계층에서 연결되면서 \"내 활동이 모이는 곳\"이라는 기획 의도가 그대로 드러난다.",
        evidence: {
          label: "MR !7 · 마이페이지",
          href: "https://lab.ssafy.com/ljin2091/final-pjt/-/merge_requests/7",
        },
      },
      {
        title: "추천 영역이 단순 인기 목록이라 커뮤니티 서비스다운 차별점이 약했다",
        problem:
          "메인 피드가 TMDB 기준 최신·인기 목록만 보여줬다. 커뮤니티 서비스라면 \"이 사용자에게 어울리는 것\"이 자리잡아야 했는데, 그 칸이 비어 있었다.",
        approach:
          "MovieView 메인과 movies/views.py에서 추천 영역을 분리했다. 좋아요·한줄평·나중에 볼 신호를 추천 큐의 입력으로 흘려보내고, 알고리즘 자체는 가벼운 규칙 기반으로 두면서 \"신호 → 큐\" 흐름을 먼저 깔았다.",
        result:
          "메인 피드에 개인화 블록이 따로 자리잡았다. 단순 카탈로그와 구분되는 탐색 진입점이 생겼다.",
        evidence: {
          label: "MR !13 · 좋아할 만한 콘텐츠",
          href: "https://lab.ssafy.com/ljin2091/final-pjt/-/merge_requests/13",
        },
      },
    ],
    techDecisions: [
      {
        tech: "Vue.js + Django REST Framework",
        why: "1주 안에 화면과 API를 동시에 붙여야 했다. Vue는 컴포넌트 단위로 화면을 빠르게 쪼개기 좋았고, DRF는 ORM + serializer로 영화·커뮤니티·계정 도메인의 CRUD를 빠르게 묶어 낼 수 있었다. \"화면-라우터-시리얼라이저\"가 거의 일대일로 붙는 구조라 첫 협업의 학습 곡선이 가팔라지지 않았다.",
      },
      {
        tech: "TMDB API (외부 메타데이터 위임)",
        why: "포스터·장르·개봉일 같은 영화 메타데이터를 직접 적재·관리하면 1주 일정이 전부 거기로 빨려 들어간다. 외부 API에 위임하면 그 시간을 사용자 행동 기능(좋아요·한줄평·나중에 볼)과 협업 워크플로우 학습에 돌릴 수 있다는 트레이드오프가 분명했다.",
      },
      {
        tech: "watchlist 관계 모델 (\"내 활동\" 통합 단위)",
        why: "마이페이지를 \"내 활동이 모이는 곳\"으로 만들려면 좋아요·한줄평·나중에 볼이 같은 단위에서 조회돼야 했다. watchlist 관계를 명시적인 모델로 두면 화면이 늘어도 같은 쿼리 패턴으로 활동을 모을 수 있어, 1주짜리 프로젝트에서도 확장의 여지를 남길 수 있었다.",
      },
    ],
    outcomes: [
      {
        value: "4흐름",
        label: "마이페이지 진입 통로",
        detail: "한줄평·나중에 볼·추천이 같은 화면 계층에 연결",
      },
      {
        value: "watchlist",
        label: "활동 통합 관계 모델",
        detail: "좋아요·저장·한줄평이 같은 단위로 조회",
      },
      {
        value: "신호 → 큐",
        label: "추천 입력 흐름",
        detail: "사용자 반응을 가벼운 규칙 기반 추천 큐의 입력으로 사용",
      },
    ],
    media: [
      {
        kind: "preview",
        title: "대표 화면 보드",
        src: "/project-media/movie/preview.svg",
        alt: "MovieApp의 추천 피드와 마이페이지를 요약한 보드",
        caption:
          "실제 화면 캡처가 남아 있지 않아, 추천 피드와 마이페이지 중심으로 기능 구성을 다시 정리한 포트폴리오용 보드.",
      },
      {
        kind: "architecture",
        title: "서비스 구성",
        src: "/project-media/movie/architecture.svg",
        alt: "Vue.js, Django REST, TMDB API로 구성된 MovieApp 아키텍처",
        caption:
          "Vue 프론트, DRF 백엔드, TMDB 메타데이터 연동, 사용자 콘텐츠 흐름을 설명한 아키텍처.",
      },
    ],
    featuredMRs: [
      {
        label: "MR !7 · 마이페이지",
        href: "https://lab.ssafy.com/ljin2091/final-pjt/-/merge_requests/7",
        note: "watchlist 관계와 MyPageView를 포함해 사용자 활동 허브를 만든 대표 MR.",
      },
      {
        label: "MR !12 · 한줄평 등등",
        href: "https://lab.ssafy.com/ljin2091/final-pjt/-/merge_requests/12",
        note: "영화 상세와 라우팅을 건드리며 리뷰 작성/조회 흐름을 붙인 작업.",
      },
      {
        label: "MR !13 · 좋아할 만한 콘텐츠",
        href: "https://lab.ssafy.com/ljin2091/final-pjt/-/merge_requests/13",
        note: "메인 영화 피드에 추천 블록을 추가한 마무리 기능.",
      },
    ],
    retrospective: {
      lesson:
        "첫 협업에서는 화면보다 데이터 모델을 먼저 맞추는 편이 전체 속도를 더 높인다. 사용자 활동이 여러 화면에 걸치면 관계 설계가 늦을수록 프론트와 백이 함께 흔들린다.",
      nextTime:
        "다음에는 관계형 필드와 응답 shape를 먼저 문서화하고, 라우터와 뷰 이름까지 초반에 맞춘 뒤 구현하겠다.",
    },
    techStack: ["Vue.js", "Django REST Framework", "TMDB API"],
    accentColor: "#b85b2e",
    order: 4,
  },
];

export const projectsBySlug: Record<string, ProjectMeta> = Object.fromEntries(
  projects.map((p) => [p.slug, p])
);
