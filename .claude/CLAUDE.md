# Harness 100

Claude Code 하네스 카탈로그 웹앱. 100개의 하네스(에이전트+스킬 조합)를 탐색·커스터마이즈·다운로드할 수 있는 Next.js 기반 웹 서비스.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, Static Export)
- **언어**: TypeScript 6
- **스타일링**: Tailwind CSS 4
- **테스트**: Vitest + Testing Library + MSW
- **스토리북**: Storybook 10 (addon-a11y, addon-interactions)
- **패키지매니저**: pnpm 10
- **배포**: Vercel (Static Export)

## 프로젝트 구조

```
src/
├── app/                    — Next.js App Router 페이지
│   ├── page.tsx            — 카탈로그 메인 (검색, 필터, 그리드)
│   ├── harness/[id]/       — 하네스 상세 페이지
│   ├── composer/           — 하네스 조합 페이지
│   ├── guide/              — 가이드 페이지
│   └── ranking/            — 인기 순위 페이지
├── components/
│   ├── ui/                 — 공통 UI 컴포넌트 (Button, Card, Input, Modal 등)
│   ├── catalog/            — 카탈로그 컴포넌트 (HarnessCard, SearchBar, CategoryTabs 등)
│   ├── detail/             — 상세 페이지 컴포넌트 (AgentList, WorkflowDiagram 등)
│   ├── composer/           — 조합기 컴포넌트
│   ├── customizer/         — 커스터마이즈 패널
│   ├── actions/            — 액션 버튼 (CopyCLI, Setup, Zip)
│   ├── common/             — 공통 레이아웃 (Header, Toast, LanguageToggle 등)
│   ├── favorites/          — 즐겨찾기
│   └── ranking/            — 랭킹 컴포넌트
├── hooks/                  — 커스텀 훅 (use-search, use-favorites, use-locale 등)
├── lib/                    — 유틸리티 (types, harness-loader, zip-builder, translations 등)
├── styles/                 — 글로벌 CSS
└── test/                   — 테스트 설정 (setup.ts, mocks/)

public/data/{en,ko}/       — 하네스 JSON 데이터 (다국어)
scripts/                    — 시드 데이터 생성 스크립트
.storybook/                 — 스토리북 설정
_workspace/                 — 디자인 시스템 산출물
```

## 주요 커맨드

```bash
pnpm dev              # 개발 서버
pnpm build            # 정적 빌드
pnpm test             # 테스트 실행
pnpm test:coverage    # 커버리지 포함 테스트
pnpm storybook        # 스토리북 실행
pnpm seed             # GitHub에서 하네스 데이터 가져오기
```

## 에이전트 & 스킬

### 에이전트 (.claude/agents/)

| 에이전트 | 역할 |
|---------|------|
| token-designer | 디자인 토큰 설계 (색상, 타이포, 간격, 그림자, 모션) |
| component-developer | React 컴포넌트 개발 (변형, 합성, 상태) |
| a11y-auditor | 접근성 검증 (WCAG 2.1, ARIA, 키보드) |
| storybook-builder | 스토리북 스토리 및 인터랙션 테스트 |
| doc-writer | 디자인 시스템 문서 작성 |
| unit-tester | 단위 테스트 작성 |
| integration-tester | 통합 테스트 작성 |
| test-strategist | 테스트 전략 수립 |
| coverage-analyst | 테스트 커버리지 분석 |
| qa-reviewer | QA 리뷰 |

### 스킬 (.claude/skills/)

| 스킬 | 용도 |
|-----|------|
| `/design-system` | 디자인 시스템 풀 파이프라인 오케스트레이션 |
| `/test-automation` | 테스트 자동화 파이프라인 |
| `/code-reviewer` | 코드 리뷰 |
| `/token-generator` | 디자인 토큰 생성 |
| `/wcag-checker` | WCAG 접근성 검증 |
| `/test-design-patterns` | 테스트 설계 패턴 |
| `/mocking-strategy` | 모킹 전략 가이드 |
| `/fullstack-webapp` | 풀스택 웹앱 개발 |

## 산출물 (_workspace/)

- `00_input.md` — 사용자 입력 및 브랜드 정보
- `01_design_tokens/` — 디자인 토큰 정의 파일
- `02_components/` — 컴포넌트 라이브러리 코드
- `03_storybook/` — 스토리북 스토리 및 설정
- `04_a11y_report.md` — 접근성 검증 보고서
- `05_docs/` — 디자인 시스템 문서
