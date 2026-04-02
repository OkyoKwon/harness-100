# Storybook 설정 가이드

## 실행

```bash
pnpm storybook          # 개발 서버 (포트 6006)
pnpm build-storybook    # 정적 빌드
```

## 설정 파일

| 파일 | 역할 |
|------|------|
| `.storybook/main.ts` | 프레임워크, 스토리 글로브, 애드온 설정 |
| `.storybook/preview.ts` | 글로벌 CSS 임포트, 테마 데코레이터, 뷰포트 |
| `.storybook/decorators/theme-decorator.tsx` | light/dark 테마 전환 데코레이터 |

## 프레임워크 & 애드온

- **Framework**: `@storybook/nextjs` (Next.js 16 + App Router 지원)
- **Addons**:
  - `@storybook/addon-essentials` — 기본 컨트롤, docs, viewport
  - `@storybook/addon-a11y` — axe-core 기반 접근성 검증
  - `@storybook/addon-interactions` — 인터랙션 테스트

## 스토리 파일 위치

컴포넌트와 같은 디렉토리에 co-locate:

```
src/components/ui/
├── button.tsx
├── button.stories.tsx    ← 여기
├── badge.tsx
├── badge.stories.tsx     ← 여기
└── ...
```

## 스토리 작성 규칙

1. **파일명**: `{component}.stories.tsx`
2. **Meta**: `title: "UI/{ComponentName}"`, `tags: ["autodocs"]`
3. **필수 스토리**: `Default`, `AllVariants` (모든 variant 나열)
4. **테마 지원**: 툴바에서 light/dark 전환 가능 (ThemeDecorator)
5. **접근성**: `@storybook/addon-a11y`가 각 스토리에서 자동 검증

## 테마 토글

Storybook 툴바에서 테마와 언어를 전환할 수 있습니다:
- **Theme**: Light / Dark (data-theme 속성 제어)
- **Locale**: 한국어 / English
