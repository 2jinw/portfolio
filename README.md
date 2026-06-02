# 이진원 · Portfolio

> **끝에서 끝까지, 사이를 잇고, 하나로 보낸다.**
> Flutter 앱 · Spring/Django 백엔드 · Isaac Lab 시뮬레이션 · 라즈베리파이까지 — 한 프로젝트의 끝에서 끝까지 책임지는 풀스택 엔지니어 이진원의 포트폴리오 사이트.

매거진(에디토리얼) 컨셉으로 구성한 정적 사이트입니다. 각 프로젝트를 한 편의 기사처럼
`기획 배경 → 핵심 문제 해결 → 기술 선택(트레이드오프) → 수치 성과 → 회고`의 흐름으로 풀어냅니다.

---

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| Framework | Next.js 16 (App Router, `output: "export"` 정적 빌드) |
| UI | React 19, Tailwind CSS v4, View Transitions API |
| Font | Fraunces (display), JetBrains Mono, Pretendard |
| Language | TypeScript 5 |
| Tooling | ESLint 9, Puppeteer / pdf-lib (웹 → PDF·PPTX 변환) |

> 이 저장소는 **포트폴리오 사이트 자체**의 코드입니다. 사이트에서 소개하는 4개 프로젝트
> (IMO · AMR Sim · itda · MovieApp)는 각각 별도 저장소에서 개발했습니다.

---

## 📂 소개 프로젝트

| 프로젝트 | 한 줄 소개 | 핵심 기술 |
|----------|-----------|-----------|
| **IMO** | 스마트 글래스 → Pi → 서버 → 앱 4계층을 한 흐름으로 묶은 운동 코치 | Flutter, Spring Boot, Django, Redis, Raspberry Pi |
| **AMR 시뮬레이션** | Isaac Lab 위 다중 AMR(6/12/18대) 자율주행·도킹 학습 환경 | Isaac Lab, RL, ROS, Jenkins, EC2, Caddy |
| **itda** | WebRTC로 다인 협업을 묶은 AI 영상 제작 플랫폼 (우수상 1등) | Vue.js, WebRTC, Spring Boot, S3 |
| **MovieApp** | 추천·한줄평·마이페이지를 갖춘 영화 커뮤니티 (첫 풀스택 협업) | Vue.js, Django REST, TMDB API |

콘텐츠 원본 데이터는 [`src/data/`](src/data/)에, GitLab 활동 요약은 상위
`portfolio_data/SUMMARY.md`에 정리되어 있습니다.

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 정적 사이트 빌드 → out/ 디렉토리
npm run build

# 빌드 결과 미리보기 (정적 호스팅 시뮬레이션)
npx serve out
```

`output: "export"` 설정이라 `npm run build` 시 `out/` 에 정적 파일이 생성됩니다.
GitHub Pages, Vercel, S3 등 어떤 정적 호스팅에도 그대로 배포할 수 있습니다.

---

## 🗂 디렉토리 구조

```
src/
├─ app/
│  ├─ page.tsx                  # 메인 (Hero · About · Tech · Stories · ...)
│  ├─ layout.tsx                # 루트 레이아웃 · 메타데이터 · 폰트
│  └─ projects/[slug]/page.tsx  # 프로젝트 상세 (정적 생성)
├─ components/                  # 애니메이션·인터랙션 컴포넌트 (Reveal, Tilt, RadarChart ...)
├─ data/
│  ├─ profile.ts                # 프로필·수상·경력·학력
│  ├─ projects.ts               # 프로젝트별 서사 데이터 (핵심 콘텐츠)
│  └─ tech-stack.ts             # 기술 스택 · 역량 레이더
└─ lib/load-project.ts          # GitLab JSON 로더
public/
└─ project-media/               # 프로젝트별 스크린샷·다이어그램
```

---

## ✏️ 콘텐츠 수정 가이드

내용을 바꾸려면 대부분 `src/data/` 안의 데이터만 수정하면 됩니다.

- **프로필·연락처·수상·학력** → [`src/data/profile.ts`](src/data/profile.ts)
- **프로젝트 서사**(임팩트·문제 해결·기술 선택·성과) → [`src/data/projects.ts`](src/data/projects.ts)
- **기술 스택·역량 레이더** → [`src/data/tech-stack.ts`](src/data/tech-stack.ts)
- **이미지·다이어그램** → `public/project-media/<slug>/` 에 추가 후 `projects.ts`의 `media`에 연결

> ⚠️ 이 프로젝트의 Next.js는 학습 데이터와 다를 수 있는 버전입니다.
> 코드 작성 전 [`AGENTS.md`](AGENTS.md)를 먼저 확인하세요.

---

## 📄 라이선스 / 연락처

개인 포트폴리오 용도의 비공개 프로젝트입니다.

- ✉️ ljin2091@naver.com
- 🦊 [GitLab](https://lab.ssafy.com/ljin2091) *(SSAFY 사내 — 열람에 로그인이 필요할 수 있습니다)*
