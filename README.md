<div align="center">

# Harness 100

**100 AI Agent Teams, Set Up in 3 Clicks**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://harness100.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Storybook](https://img.shields.io/badge/Storybook-10-ff4785?logo=storybook&logoColor=white)](https://storybook.js.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)

[Live Demo](https://harness100.vercel.app) · [English](#english) · [한국어](#한국어)

</div>

---

## English

A web app to browse, customize, and set up 100 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) harnesses (agent teams + orchestrator skills) directly into your projects.

> **Browse → Customize → Run**
>
> Open source · No login required · Works entirely in the browser
>
> _This project was itself built using Claude Code harnesses._

Based on [revfactory/harness-100](https://github.com/revfactory/harness-100).

![Catalog](docs/screenshots/catalog.png)

### Features

- **Catalog** — 10 categories, fuzzy search, sort by number / popularity / name
- **3 Setup Methods** — Browser direct setup (File System Access API) / ZIP download / CLI copy
- **Conflict Detection & Merge** — Overwrite, skip, or merge when `.claude/` files already exist
- **Customization** — Edit agent names, roles, and output templates before setup
- **Harness Builder** — AI-assisted custom harness creation with skill markdown preview & edit
- **Harness Composer** — Combine agents from multiple harnesses into a custom workflow
- **Guide** — Getting started guide with visual stepper, concept cards, and "Build Your Own" section
- **Workflow Diagram** — Interactive agent dependency visualization
- **Popularity Ranking** — Community top 10 harnesses
- **Favorites** — Locally persisted via IndexedDB, viewable in favorites tab
- **Multilingual** — English / Korean
- **Dark Mode** — System preference + manual toggle

<details>
<summary><strong>Harness Builder</strong> — Build your own harness from scratch</summary>

A 4-step wizard for creating custom harnesses:

1. **Meta** — Set harness name, description, and category
2. **Agents** — Add agents with roles, tools, and dependencies (AI-assist available)
3. **Skill** — Preview and edit the orchestrator skill in markdown
4. **Review** — Final review with full agent list, workflow diagram, and export

Custom harnesses are saved locally in IndexedDB and can be exported as ZIP or set up directly via File System Access API.

</details>

<details>
<summary><strong>Guide Page</strong> — Interactive getting-started experience</summary>

- Two-column layout with sticky TOC sidebar
- Visual 3-step install stepper (Browse → Setup → Run)
- Concept explanation cards (Harness, Agent, Skill)
- Accordion sections for detailed instructions
- "Build Your Own Harness" guide section

</details>

<details>
<summary><strong>Setup Methods</strong> — Three ways to install a harness</summary>

| Method | How it works |
|--------|-------------|
| **Browser Setup** | Uses the File System Access API to write `.claude/` files directly into your project folder |
| **ZIP Download** | Packages all agents, skills, and CLAUDE.md into a downloadable ZIP via JSZip |
| **CLI Copy** | Copies a ready-to-paste CLI command to your clipboard |

When `.claude/` files already exist in the target folder, the setup flow detects conflicts and lets you choose: overwrite, skip, or merge per file.

</details>

### Demo

**https://harness100.vercel.app**

### Quick Start

> **Prerequisites:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/OkyoKwon/harness-100.git
cd harness-100
pnpm install
pnpm dev
```

Open http://localhost:3000.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Static build (→ `out/`) |
| `pnpm start` | Production server |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Watch mode testing |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm storybook` | Launch Storybook on port 6006 |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm seed` | Fetch harness data from GitHub |
| `pnpm build:agent-index` | Build searchable agent index |

### Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 16 | App Router, Static Export |
| Language | TypeScript 6 | Type safety |
| UI | React 19 | Component library |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Flow Diagrams | @xyflow/react 12 | Workflow visualization |
| Search | fuse.js 7 | Client-side fuzzy search |
| ZIP / Download | jszip + file-saver | Harness ZIP packaging |
| Markdown | react-markdown + remark-gfm | Skill content rendering |
| Storage | idb 8 (IndexedDB) | Favorites, custom harnesses |
| Frontmatter | gray-matter 4 | Skill file parsing |
| Testing | Vitest 4 + Testing Library + MSW | Unit / integration tests |
| Stories | Storybook 10 | Component development |
| Package Manager | pnpm 10 | Dependency management |
| Deployment | Vercel | Static hosting |

### Project Structure

<details open>
<summary>Expand</summary>

```
src/
├── app/                    — Next.js App Router pages
│   ├── page.tsx            — Catalog main (search, filter, grid)
│   ├── harness/[id]/       — Harness detail
│   ├── builder/            — Custom harness builder
│   ├── composer/           — Harness composer
│   ├── guide/              — Guide page
│   └── ranking/            — Ranking page
├── components/
│   ├── ui/                 — Common UI (Button, Card, Input, Modal)
│   ├── catalog/            — Catalog (HarnessCard, SearchBar, CategoryTabs)
│   ├── detail/             — Detail page (AgentList, WorkflowDiagram)
│   ├── builder/            — Builder components
│   ├── composer/           — Composer components
│   ├── customizer/         — Customization panels
│   ├── actions/            — Action buttons (CopyCLI, Setup, Zip)
│   ├── common/             — Layout (Header, Toast, LanguageToggle)
│   ├── favorites/          — Favorites
│   ├── guide/              — Guide components
│   ├── ranking/            — Ranking components
│   └── setup/              — Setup flow components
├── hooks/                  — Custom hooks (search, favorites, locale, etc.)
├── lib/                    — Utilities (types, harness-loader, zip-builder, translations)
├── styles/                 — Global CSS
└── test/                   — Test setup and mocks

public/data/{en,ko}/       — Harness JSON data (i18n)
scripts/                    — Seed data & index generation
```

</details>

### Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Catalog | Browse, search, and filter 100 harnesses |
| `/harness/[id]` | Detail | View agents, workflow diagram, setup options |
| `/builder` | Builder | AI-assisted custom harness creation |
| `/composer` | Composer | Combine agents from multiple harnesses |
| `/guide` | Guide | Getting started, concepts, build your own |
| `/ranking` | Ranking | Community popularity top 10 |

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

This project follows [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, etc.).

### Acknowledgments

- Based on [revfactory/harness-100](https://github.com/revfactory/harness-100)
- Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### License

[Apache License 2.0](LICENSE)

---

## 한국어

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)용 하네스(에이전트 팀 + 오케스트레이터 스킬) 100개를 탐색하고, 커스터마이즈하고, 바로 프로젝트에 세팅할 수 있는 웹앱입니다.

> **고르고 → 커스터마이즈하고 → 바로 실행**
>
> 오픈소스 · 로그인 불필요 · 브라우저에서 모든 것이 완결
>
> _이 프로젝트 자체도 Claude Code 하네스로 만들었습니다._

[revfactory/harness-100](https://github.com/revfactory/harness-100) 기반으로 제작되었습니다.

### 주요 기능

- **카탈로그** — 10개 카테고리, 퍼지 검색, 번호순/인기순/이름순 정렬
- **3가지 세팅 방식** — 브라우저 직접 세팅 (File System Access API) / ZIP 다운로드 / CLI 복사
- **충돌 감지 & 병합** — 기존 `.claude/` 파일이 있으면 덮어쓰기/건너뛰기/병합 선택
- **커스터마이즈** — 에이전트 이름, 역할, 산출물 템플릿 수정 후 세팅
- **하네스 빌더** — AI 지원 커스텀 하네스 생성, 스킬 마크다운 미리보기 & 편집
- **하네스 조합** — 여러 하네스의 에이전트를 조합하여 나만의 워크플로우 생성
- **가이드** — 비주얼 스테퍼, 개념 카드, "나만의 하네스 만들기" 섹션이 포함된 시작 가이드
- **워크플로우 다이어그램** — 에이전트 의존성 인터랙티브 시각화
- **인기 순위** — 커뮤니티 인기 Top 10 하네스
- **즐겨찾기** — IndexedDB 로컬 저장, 즐겨찾기 탭에서 모아보기
- **다국어** — 한국어 / English
- **다크 모드** — 시스템 설정 연동 + 수동 전환

<details>
<summary><strong>하네스 빌더</strong> — 나만의 하네스를 처음부터 만들기</summary>

4단계 위자드로 커스텀 하네스를 생성합니다:

1. **메타** — 하네스 이름, 설명, 카테고리 설정
2. **에이전트** — 역할, 도구, 의존성을 가진 에이전트 추가 (AI 지원 가능)
3. **스킬** — 오케스트레이터 스킬을 마크다운으로 미리보기 및 편집
4. **리뷰** — 전체 에이전트 목록, 워크플로우 다이어그램, 내보내기

커스텀 하네스는 IndexedDB에 로컬 저장되며, ZIP 내보내기 또는 File System Access API로 직접 세팅할 수 있습니다.

</details>

<details>
<summary><strong>가이드 페이지</strong> — 인터랙티브 시작 가이드</summary>

- 스티키 TOC 사이드바가 있는 2단 레이아웃
- 비주얼 3단계 설치 스테퍼 (탐색 → 세팅 → 실행)
- 개념 설명 카드 (하네스, 에이전트, 스킬)
- 상세 설명을 위한 아코디언 섹션
- "나만의 하네스 만들기" 가이드 섹션

</details>

<details>
<summary><strong>세팅 방식</strong> — 하네스를 설치하는 세 가지 방법</summary>

| 방식 | 동작 방식 |
|------|----------|
| **브라우저 세팅** | File System Access API를 사용하여 프로젝트 폴더에 `.claude/` 파일을 직접 기록 |
| **ZIP 다운로드** | JSZip으로 에이전트, 스킬, CLAUDE.md를 ZIP으로 패키징하여 다운로드 |
| **CLI 복사** | 바로 붙여넣을 수 있는 CLI 명령어를 클립보드에 복사 |

대상 폴더에 `.claude/` 파일이 이미 존재하면 충돌을 감지하고 파일별로 덮어쓰기/건너뛰기/병합을 선택할 수 있습니다.

</details>

### 데모

**https://harness100.vercel.app**

### 빠른 시작

> **필수 조건:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/OkyoKwon/harness-100.git
cd harness-100
pnpm install
pnpm dev
```

http://localhost:3000 에서 확인하세요.

### 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 정적 빌드 (→ `out/`) |
| `pnpm start` | 프로덕션 서버 |
| `pnpm test` | 테스트 실행 |
| `pnpm test:watch` | 워치 모드 테스트 |
| `pnpm test:coverage` | 커버리지 포함 테스트 |
| `pnpm storybook` | 스토리북 실행 (포트 6006) |
| `pnpm build-storybook` | 스토리북 정적 빌드 |
| `pnpm seed` | GitHub에서 하네스 데이터 가져오기 |
| `pnpm build:agent-index` | 검색 가능한 에이전트 인덱스 빌드 |

### 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 16 | App Router, Static Export |
| 언어 | TypeScript 6 | 타입 안전성 |
| UI | React 19 | 컴포넌트 라이브러리 |
| 스타일 | Tailwind CSS 4 | 유틸리티 퍼스트 CSS |
| 플로우 다이어그램 | @xyflow/react 12 | 워크플로우 시각화 |
| 검색 | fuse.js 7 | 클라이언트 사이드 퍼지 검색 |
| ZIP / 다운로드 | jszip + file-saver | 하네스 ZIP 패키징 |
| 마크다운 | react-markdown + remark-gfm | 스킬 콘텐츠 렌더링 |
| 저장소 | idb 8 (IndexedDB) | 즐겨찾기, 커스텀 하네스 |
| 프론트매터 | gray-matter 4 | 스킬 파일 파싱 |
| 테스트 | Vitest 4 + Testing Library + MSW | 단위/통합 테스트 |
| 스토리 | Storybook 10 | 컴포넌트 개발 |
| 패키지 매니저 | pnpm 10 | 의존성 관리 |
| 배포 | Vercel | 정적 호스팅 |

### 프로젝트 구조

<details open>
<summary>펼치기</summary>

```
src/
├── app/                    — Next.js App Router 페이지
│   ├── page.tsx            — 카탈로그 메인 (검색, 필터, 그리드)
│   ├── harness/[id]/       — 하네스 상세
│   ├── builder/            — 커스텀 하네스 빌더
│   ├── composer/           — 하네스 조합
│   ├── guide/              — 가이드 페이지
│   └── ranking/            — 랭킹 페이지
├── components/
│   ├── ui/                 — 공통 UI (Button, Card, Input, Modal)
│   ├── catalog/            — 카탈로그 (HarnessCard, SearchBar, CategoryTabs)
│   ├── detail/             — 상세 페이지 (AgentList, WorkflowDiagram)
│   ├── builder/            — 빌더 컴포넌트
│   ├── composer/           — 조합기 컴포넌트
│   ├── customizer/         — 커스터마이즈 패널
│   ├── actions/            — 액션 버튼 (CopyCLI, Setup, Zip)
│   ├── common/             — 레이아웃 (Header, Toast, LanguageToggle)
│   ├── favorites/          — 즐겨찾기
│   ├── guide/              — 가이드 컴포넌트
│   ├── ranking/            — 랭킹 컴포넌트
│   └── setup/              — 세팅 플로우 컴포넌트
├── hooks/                  — 커스텀 훅 (검색, 즐겨찾기, 로케일 등)
├── lib/                    — 유틸리티 (types, harness-loader, zip-builder, translations)
├── styles/                 — 글로벌 CSS
└── test/                   — 테스트 설정 및 목

public/data/{en,ko}/       — 하네스 JSON 데이터 (다국어)
scripts/                    — 시드 데이터 & 인덱스 생성
```

</details>

### 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 카탈로그 | 100개 하네스 탐색, 검색, 필터 |
| `/harness/[id]` | 상세 | 에이전트, 워크플로우 다이어그램, 세팅 옵션 |
| `/builder` | 빌더 | AI 지원 커스텀 하네스 생성 |
| `/composer` | 조합 | 여러 하네스의 에이전트 조합 |
| `/guide` | 가이드 | 시작하기, 개념 설명, 나만의 하네스 만들기 |
| `/ranking` | 랭킹 | 커뮤니티 인기 Top 10 |

### 기여하기

1. 리포지토리 포크
2. 기능 브랜치 생성 (`git checkout -b feat/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치 푸시 (`git push origin feat/amazing-feature`)
5. Pull Request 생성

이 프로젝트는 [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:` 등)를 따릅니다.

### 감사의 말

- [revfactory/harness-100](https://github.com/revfactory/harness-100) 기반
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)로 제작

### 라이선스

[Apache License 2.0](LICENSE)
