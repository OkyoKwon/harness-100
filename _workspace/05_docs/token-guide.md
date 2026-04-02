# 토큰 사용 가이드

디자인 토큰은 시각적 값을 중앙에서 관리하는 CSS 커스텀 프로퍼티이다. 이 프로젝트는 3계층 토큰 시스템을 사용한다.

---

## 3계층 토큰 개요

```
┌─────────────────────────────────────────────────────┐
│  Component Token (컴포넌트 계층)                       │
│  예: --button-primary-bg, --card-border              │
│  파일: src/styles/tokens/component.css               │
│  역할: UI 프리미티브 전용 토큰                          │
├─────────────────────────────────────────────────────┤
│  Semantic Token (의미 계층)                            │
│  예: --primary, --foreground, --border               │
│  파일: src/styles/tokens/semantic.css                │
│  역할: 역할 기반 별칭, 테마 전환 처리                    │
├─────────────────────────────────────────────────────┤
│  Primitive Token (원시 계층)                           │
│  예: --color-blue-600, --shadow-sm, --radius-md      │
│  파일: src/styles/tokens/primitive.css               │
│  역할: 원시 디자인 값 (색상, 간격, 반경, 그림자 등)       │
└─────────────────────────────────────────────────────┘
```

### 참조 방향

```
Component Token → Semantic Token → Primitive Token
   (참조)             (참조)           (실제 값)
```

- Primitive는 실제 값(`#3b82f6`, `0.5rem`)을 가진다
- Semantic은 Primitive를 참조한다 (`--primary: var(--color-blue-600)`)
- Component는 Semantic을 참조한다 (`--button-primary-bg: var(--primary)`)

---

## Primitive Token (원시 계층)

**파일**: `src/styles/tokens/primitive.css`

의미 없는 원시 디자인 값을 정의한다. `:root`에 한 번만 선언하며 테마에 따라 변하지 않는다.

### 카테고리

| 카테고리 | 접두사 | 예시 |
|---------|--------|------|
| 색상 | `--color-{palette}-{shade}` | `--color-blue-600`, `--color-gray-200` |
| 간격 | `--space-{scale}` | `--space-4` (1rem) |
| 반경 | `--radius-{size}` | `--radius-md` (0.5rem) |
| 그림자 | `--shadow-{size}` | `--shadow-sm`, `--shadow-md-dark` |
| 글꼴 크기 | `--text-{size}` | `--text-sm` (0.875rem) |
| 글꼴 굵기 | `--font-{weight}` | `--font-semibold` (600) |
| 트랜지션 | `--duration-{speed}`, `--ease-{name}` | `--duration-fast` (150ms) |

### 색상 팔레트

| 팔레트 | 용도 | 범위 |
|--------|------|------|
| `gray` | 중립, 배경, 텍스트 | 50~950 |
| `blue` | 주요(primary) 색상 | 50~900 |
| `amber` | 강조(accent) 색상 | 50~900 |
| `red` | 위험/파괴적 | 50~950 |
| `green` | 성공 | 50~950 |
| `violet` | 프레임워크 뱃지 | 50, 300, 600, 900 |

---

## Semantic Token (의미 계층)

**파일**: `src/styles/tokens/semantic.css`

역할 기반 별칭을 정의하며, 라이트/다크 테마 전환을 이 계층에서 처리한다.

### 핵심 토큰

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--background` | white | gray-950 | 페이지 배경 |
| `--foreground` | gray-900 | #ededed | 기본 텍스트 |
| `--muted` | gray-100 | gray-800 | 뮤트 배경 |
| `--muted-foreground` | gray-500 | gray-400 | 보조 텍스트 |
| `--border` | gray-200 | gray-700 | 테두리 |
| `--primary` | blue-600 | blue-500 | 주요 강조 |
| `--primary-foreground` | white | white | 주요 강조 위 텍스트 |
| `--accent` | amber-500 | amber-500 | 보조 강조 |
| `--ring` | blue-500 | blue-400 | 포커스 링 |
| `--card` | white | #1c1c1c | 카드 배경 |
| `--card-foreground` | gray-900 | #ededed | 카드 텍스트 |

### 상태 토큰 그룹

각 상태(success, info, danger, warning)는 3개 토큰 세트를 가진다:

```css
--{state}-bg         /* 배경 */
--{state}-border     /* 테두리 */
--{state}-foreground /* 텍스트 */
```

---

## Component Token (컴포넌트 계층)

**파일**: `src/styles/tokens/component.css`

UI 프리미티브 전용 토큰이다. `:root`에 한 번 선언하며, Semantic Token을 참조한다.

### Button

```css
--button-primary-bg: var(--primary);
--button-primary-fg: var(--primary-foreground);
--button-outline-bg: transparent;
--button-outline-border: var(--border);
--button-outline-fg: var(--foreground);
--button-ghost-bg: transparent;
--button-ghost-fg: var(--foreground);
--button-ghost-hover-bg: var(--muted);
--button-dashed-bg: transparent;
--button-dashed-border: var(--border);
--button-dashed-fg: var(--muted-foreground);
--button-disabled-opacity: 0.5;
```

### Input

```css
--input-bg: var(--background);
--input-border: var(--border);
--input-fg: var(--foreground);
--input-placeholder: var(--muted-foreground);
--input-focus-border: var(--primary);
```

### Select

```css
--select-bg: var(--background);
--select-border: var(--border);
--select-fg: var(--foreground);
```

### Card

```css
--card-bg: var(--card);
--card-border: var(--border);
--card-fg: var(--card-foreground);
--card-shadow: var(--shadow-sm);
--card-hover-border: var(--primary);
--card-hover-shadow: var(--shadow-md);
```

### Badge

```css
--badge-default-bg: var(--secondary);
--badge-default-fg: var(--secondary-foreground);
/* tool, framework 변형은 Semantic 계층에서 직접 정의 */
```

### Modal

```css
--modal-overlay: rgb(0 0 0 / 0.5);
--modal-bg: var(--card);
--modal-border: var(--border);
--modal-fg: var(--card-foreground);
--modal-header-border: var(--border);
```

---

## 컴포넌트에서 토큰 참조 방법

Tailwind의 임의값 문법(`[var(--token)]`)으로 참조한다:

```tsx
// 배경색
className="bg-[var(--button-primary-bg)]"

// 텍스트 색상
className="text-[var(--foreground)]"

// 테두리
className="border border-[var(--card-border)]"

// 그림자
className="shadow-[var(--card-shadow)]"

// 호버 상태
className="hover:bg-[var(--muted)]"

// 포커스 아웃라인
className="focus-visible:outline-[var(--ring)]"
```

---

## 테마 전환 메커니즘

### 작동 방식

1. `<html>` 요소의 `data-theme` 속성으로 테마를 전환한다
2. `semantic.css`에서 `[data-theme="dark"]` 셀렉터가 Semantic Token 값을 재정의한다
3. Component Token은 Semantic Token을 참조하므로 자동으로 테마가 반영된다

```
data-theme="dark" 설정
  → semantic.css의 [data-theme="dark"] 블록 활성화
  → --primary: blue-600 → blue-500 로 변경
  → --button-primary-bg: var(--primary) → 자동으로 blue-500 반영
  → Button 컴포넌트에 다크 테마 적용 완료
```

### 시스템 테마 폴백

`data-theme` 속성이 없으면 `prefers-color-scheme: dark` 미디어 쿼리가 적용된다:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* 다크 토큰 적용 */
  }
}
```

### 우선순위

1. `data-theme="dark"` 또는 `data-theme="light"` (사용자 명시 선택)
2. `prefers-color-scheme` (시스템 설정 폴백)
3. 라이트 테마 (기본값)

---

## 새 토큰 추가 방법

### 1단계: 어떤 계층에 추가할지 결정

| 상황 | 계층 | 파일 |
|------|------|------|
| 새 색상 팔레트, 간격값 추가 | Primitive | `primitive.css` |
| 새 역할 정의 (예: `--warning`) | Semantic | `semantic.css` |
| 새 UI 프리미티브 전용 토큰 | Component | `component.css` |

### 2단계: 네이밍 규칙

| 계층 | 패턴 | 예시 |
|------|------|------|
| Primitive | `--{category}-{palette}-{shade}` | `--color-teal-500` |
| Semantic | `--{role}` 또는 `--{role}-{modifier}` | `--warning`, `--warning-bg` |
| Component | `--{component}-{variant}-{property}` | `--tooltip-bg`, `--tooltip-fg` |

### 3단계: 라이트/다크 양쪽 정의

Semantic Token을 추가할 때는 반드시 라이트와 다크 양쪽 값을 정의해야 한다:

```css
/* semantic.css */

/* 라이트 */
:root {
  --new-token: var(--color-blue-100);
}

/* 다크 (명시 토글) */
[data-theme="dark"] {
  --new-token: var(--color-blue-900);
}

/* 다크 (시스템 폴백) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --new-token: var(--color-blue-900);
  }
}
```

### 4단계: 검증

- 라이트 모드에서 시각적 확인
- 다크 모드에서 시각적 확인
- 명시 토글(`data-theme`)과 시스템 폴백(`prefers-color-scheme`) 모두 테스트
