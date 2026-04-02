# 테스트 자동화 입력

## 대상 코드
- harness-100-ui: Next.js 16 + TypeScript + React 19 정적 사이트
- 100개 AI 에이전트 팀 하네스 카탈로그 사이트

## 기술 스택
- Framework: Next.js 16.2.2 (App Router, static export)
- Language: TypeScript 6.0.2 (strict mode)
- Styling: Tailwind CSS 4.2.2
- Search: Fuse.js 7.1.0
- Graphs: @xyflow/react 12.10.2
- Export: jszip, file-saver
- State: React hooks + localStorage
- i18n: custom useLocale hook

## 기존 테스트
- 없음 (0% 커버리지)

## 주요 테스트 대상
### lib/ (비즈니스 로직)
- `types.ts` — 타입 정의
- `constants.ts` — 카테고리, 인기 랭킹 매핑
- `harness-loader.ts` — 데이터 로딩 + 캐싱
- `merge-harnesses.ts` — 다중 하네스 병합
- `validation.ts` — 입력 검증
- `cli.ts` — CLI 명령어 생성
- `zip-builder.ts` — ZIP 파일 빌드

### hooks/ (커스텀 훅)
- `use-favorites.ts` — 즐겨찾기 (localStorage)
- `use-search.ts` — Fuse.js 검색
- `use-locale.ts` — i18n
- `use-composer.ts` — 하네스 조합

### components/ (UI 컴포넌트)
- catalog/: harness-card, sort-filter-bar, search-bar, category-tabs
- ranking/: ranking-podium, ranking-list, ranking-table
- detail/: harness-detail-client, agent-list, workflow-diagram
- actions/: setup-button, zip-button, copy-cli-button

### scripts/ (빌드 스크립트)
- `generate-seed-data.ts` — 시드 데이터 생성
- `fetch-from-github.ts` — GitHub에서 데이터 가져오기

## 제약 조건
- 커버리지 목표: 80%+
- 파일 크기: <800 lines
- 이뮤터블 패턴 준수
- TDD (테스트 먼저 작성)

## 실행 모드
풀 파이프라인 (5명 전원)
