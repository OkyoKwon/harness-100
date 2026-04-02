# 디자인 토큰 문서

## 1. 3-Tier 토큰 아키텍처

본 프로젝트는 **Primitive - Semantic - Component** 3계층 토큰 구조를 사용한다.

```
+---------------------+
|   Component Token    |   --button-primary-bg
|   (컴포넌트 전용)      |         |
+----------+----------+         |  var(--primary)
           |                    v
+----------v----------+
|   Semantic Token     |   --primary
|   (역할/의미 부여)     |         |
+----------+----------+         |  var(--color-blue-600)
           |                    v
+----------v----------+
|   Primitive Token    |   --color-blue-600: #2563eb
|   (원시 값)           |
+---------------------+
```

### 각 계층의 역할

| 계층 | 파일 | 역할 | 예시 |
|------|------|------|------|
| **Primitive** | `tokens/primitive.css` | 의미 없는 원시 값. 색상, 간격, 반지름 등의 단일 진실 공급원 | `--color-blue-600: #2563eb` |
| **Semantic** | `tokens/semantic.css` | 역할 기반 별칭. 라이트/다크 테마 전환을 처리 | `--primary: var(--color-blue-600)` |
| **Component** | `tokens/component.css` | 컴포넌트별 토큰. UI 프리미티브에서 직접 사용 | `--button-primary-bg: var(--primary)` |

### 참조 규칙

- Component 토큰은 **Semantic 토큰만** 참조한다.
- Semantic 토큰은 **Primitive 토큰만** 참조한다.
- Primitive 토큰은 **하드코딩 값**(hex, rem 등)을 직접 갖는다.
- 컴포넌트 CSS에서는 가능한 한 **Component 토큰 > Semantic 토큰 > Primitive 토큰** 순으로 사용한다.

---

## 2. 토큰 인벤토리

### 2.1 색상 (Color)

#### Primitive 색상 팔레트

| Hue | Shade 범위 | 용도 |
|-----|-----------|------|
| `gray` | 50 - 950 (11단계) | 중립 배경, 텍스트, 보더 |
| `blue` | 50 - 900 (10단계) | 프라이머리, 정보 |
| `amber` | 50 - 900 (10단계) | 액센트, 경고 |
| `red` | 50 - 950 (11단계) | 위험, 에러 |
| `green` | 50 - 950 (11단계) | 성공 |
| `violet` | 50, 300, 600, 900 | 프레임워크 배지 |
| `yellow` | 50 | 다크 액센트 전경 |
| `white` / `black` | - | 절대 흑백 |

#### Semantic 색상 토큰

| 토큰 | 라이트 테마 | 다크 테마 | 용도 |
|------|------------|----------|------|
| `--background` | `--color-white` | `--color-gray-950` | 페이지 배경 |
| `--foreground` | `--color-gray-900` | `#ededed` | 기본 텍스트 |
| `--muted` | `--color-gray-100` | `--color-gray-800` | 음소거 배경 |
| `--muted-foreground` | `--color-gray-500` | `--color-gray-400` | 보조 텍스트 |
| `--border` | `--color-gray-200` | `--color-gray-700` | 테두리 |
| `--primary` | `--color-blue-600` | `--color-blue-500` | 주요 액션 |
| `--primary-foreground` | `--color-white` | `--color-white` | 주요 액션 텍스트 |
| `--accent` | `--color-amber-500` | `--color-amber-500` | 강조 |
| `--accent-foreground` | `--color-gray-900` | `--color-yellow-50` | 강조 텍스트 |
| `--destructive` | `--color-red-500` | `--color-red-400` | 파괴적 액션 |
| `--card` | `--color-white` | `#1c1c1c` | 카드 배경 |
| `--card-foreground` | `--color-gray-900` | `#ededed` | 카드 텍스트 |
| `--secondary` | `--color-gray-100` | `#2a2a2a` | 보조 배경 |
| `--secondary-foreground` | `--color-gray-600` | `--color-gray-400` | 보조 텍스트 |
| `--ring` | `--color-blue-500` | `--color-blue-400` | 포커스 링 |

#### Semantic 상태 색상 그룹

| 그룹 | 토큰 | 라이트 | 다크 |
|------|------|--------|------|
| **Success** | `--success` | `green-600` | `green-400` |
| | `--success-bg` | `green-50` | `green-950` |
| | `--success-border` | `green-200` | `green-800` |
| | `--success-foreground` | `green-800` | `green-200` |
| **Info** | `--info-bg` | `blue-50` | `blue-900` |
| | `--info-border` | `blue-200` | `blue-800` |
| | `--info-foreground` | `blue-800` | `blue-200` |
| **Danger** | `--danger-bg` | `red-50` | `red-950` |
| | `--danger-border` | `red-200` | `red-800` |
| | `--danger-foreground` | `red-800` | `red-300` |
| **Warning** | `--warning-bg` | `amber-50` | `#1c1608` |
| | `--warning-border` | `amber-200` | `amber-800` |
| | `--warning-foreground` | `amber-800` | `amber-200` |

#### Semantic 배지/그래프 토큰

| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `--badge-tool-bg` | `blue-50` | `blue-900` |
| `--badge-tool-fg` | `blue-700` | `blue-300` |
| `--badge-framework-bg` | `violet-50` | `violet-900` |
| `--badge-framework-fg` | `violet-600` | `violet-300` |
| `--node-bg` | `blue-50` | `blue-900` |
| `--node-border` | `blue-200` | `blue-800` |
| `--node-fg` | `blue-800` | `blue-200` |
| `--edge-stroke` | `blue-300` | `blue-800` |
| `--code-bg` | `#1a1a2e` | `gray-950` |
| `--code-fg` | `#e2e8f0` | `#e2e8f0` |

### 2.2 간격 (Spacing)

4px 기반 스케일. `--space-{n}`에서 `n`은 `0.25rem` 단위의 배수이다.

| 토큰 | 값 | px 환산 |
|------|----|---------|
| `--space-0` | `0` | 0px |
| `--space-0-5` | `0.125rem` | 2px |
| `--space-1` | `0.25rem` | 4px |
| `--space-1-5` | `0.375rem` | 6px |
| `--space-2` | `0.5rem` | 8px |
| `--space-2-5` | `0.625rem` | 10px |
| `--space-3` | `0.75rem` | 12px |
| `--space-4` | `1rem` | 16px |
| `--space-5` | `1.25rem` | 20px |
| `--space-6` | `1.5rem` | 24px |
| `--space-8` | `2rem` | 32px |
| `--space-10` | `2.5rem` | 40px |
| `--space-12` | `3rem` | 48px |
| `--space-16` | `4rem` | 64px |

### 2.3 반지름 (Radius)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--radius-sm` | `0.25rem` | 작은 요소 (배지, 인라인 코드) |
| `--radius-md` | `0.5rem` | 기본 (카드, 입력필드, 버튼) |
| `--radius-lg` | `0.75rem` | 큰 컨테이너 |
| `--radius-xl` | `1rem` | 모달, 다이얼로그 |
| `--radius-full` | `9999px` | 원형 (아바타, 태그) |

Semantic 계층에서 `--radius: var(--radius-md)`로 기본 반지름을 설정한다.

### 2.4 그림자 (Shadow)

| 토큰 | 라이트 용 | 다크 용 |
|------|----------|---------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `0 1px 2px 0 rgb(0 0 0 / 0.3)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` | `0 4px 6px -1px rgb(0 0 0 / 0.4), ...` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` | `0 10px 15px -3px rgb(0 0 0 / 0.4), ...` |

Semantic 계층에서 `--shadow-sm`과 `--shadow-md`를 테마별로 자동 전환한다.

### 2.5 타이포그래피 (Typography)

#### 폰트 크기

| 토큰 | 값 | px 환산 |
|------|----|---------|
| `--text-xs` | `0.75rem` | 12px |
| `--text-sm` | `0.875rem` | 14px |
| `--text-base` | `1rem` | 16px |
| `--text-lg` | `1.125rem` | 18px |
| `--text-xl` | `1.25rem` | 20px |
| `--text-2xl` | `1.5rem` | 24px |

#### 폰트 굵기

| 토큰 | 값 |
|------|----|
| `--font-normal` | `400` |
| `--font-medium` | `500` |
| `--font-semibold` | `600` |
| `--font-bold` | `700` |

### 2.6 모션 (Motion)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--duration-fast` | `150ms` | 호버, 포커스 등 미세 인터랙션 |
| `--duration-normal` | `200ms` | 일반 전환 |
| `--duration-slow` | `300ms` | 모달 진입, 드로어 열기 등 |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 기본 이징 커브 |

`globals.css`에서 `prefers-reduced-motion: reduce` 미디어 쿼리로 모든 애니메이션을 비활성화한다.

---

## 3. 네이밍 컨벤션

### 3.1 Primitive 토큰

```
--{category}-{variant}-{shade}
```

| 패턴 | 예시 | 설명 |
|------|------|------|
| `--color-{hue}-{shade}` | `--color-blue-600` | 색상 팔레트 |
| `--color-{name}` | `--color-white` | 절대 색상 |
| `--space-{n}` | `--space-4` | 간격 (4px 배수) |
| `--radius-{size}` | `--radius-md` | 반지름 |
| `--shadow-{size}` | `--shadow-md` | 그림자 (라이트) |
| `--shadow-{size}-dark` | `--shadow-md-dark` | 그림자 (다크) |
| `--text-{size}` | `--text-lg` | 폰트 크기 |
| `--font-{weight}` | `--font-semibold` | 폰트 굵기 |
| `--duration-{speed}` | `--duration-fast` | 전환 시간 |
| `--ease-{name}` | `--ease-default` | 이징 커브 |

### 3.2 Semantic 토큰

```
--{role}
--{role}-{sub-property}
```

| 패턴 | 예시 | 설명 |
|------|------|------|
| `--{role}` | `--primary`, `--background` | 핵심 역할 |
| `--{role}-foreground` | `--primary-foreground` | 역할의 텍스트 색상 |
| `--{status}-bg` | `--success-bg` | 상태 배경 |
| `--{status}-border` | `--danger-border` | 상태 테두리 |
| `--{status}-foreground` | `--warning-foreground` | 상태 텍스트 |
| `--badge-{type}-bg` | `--badge-tool-bg` | 배지 배경 |
| `--badge-{type}-fg` | `--badge-framework-fg` | 배지 텍스트 |
| `--node-{property}` | `--node-bg` | 그래프 노드 |
| `--edge-{property}` | `--edge-stroke` | 그래프 엣지 |

### 3.3 Component 토큰

```
--{component}-{variant}-{property}
```

| 패턴 | 예시 | 설명 |
|------|------|------|
| `--button-{variant}-bg` | `--button-primary-bg` | 버튼 배경 |
| `--button-{variant}-fg` | `--button-outline-fg` | 버튼 텍스트 |
| `--button-{variant}-border` | `--button-outline-border` | 버튼 테두리 |
| `--button-{state}-{property}` | `--button-ghost-hover-bg` | 버튼 상태 |
| `--button-disabled-opacity` | `--button-disabled-opacity` | 비활성 투명도 |
| `--input-{property}` | `--input-bg`, `--input-focus-border` | 입력 필드 |
| `--select-{property}` | `--select-bg` | 셀렉트 |
| `--card-{property}` | `--card-bg`, `--card-hover-shadow` | 카드 |
| `--badge-default-{property}` | `--badge-default-bg` | 배지 기본 |
| `--modal-{property}` | `--modal-bg`, `--modal-overlay` | 모달 |

---

## 4. 라이트/다크 테마 전환

### 전환 메커니즘

테마 전환은 **semantic.css**에서 CSS 커스텀 프로퍼티 오버라이드로 처리한다.

```
우선순위 (높은 순):
1. [data-theme="dark"]   — 사용자가 명시적으로 다크 선택
2. [data-theme="light"]  — 사용자가 명시적으로 라이트 선택
3. prefers-color-scheme   — 시스템 설정 자동 감지
```

### 셀렉터 구조

```css
/* 1) 라이트 테마 (기본값) */
:root {
  --background: var(--color-white);
  /* ... */
}

/* 2) 다크 테마 (명시적 토글) */
[data-theme="dark"] {
  --background: var(--color-gray-950);
  /* ... */
}

/* 3) 다크 테마 (시스템 환경설정 폴백) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --background: var(--color-gray-950);
    /* ... */
  }
}
```

### 핵심 동작

| 상태 | `data-theme` 속성 | 시스템 다크모드 | 결과 |
|------|-------------------|----------------|------|
| 기본 | 없음 | OFF | 라이트 |
| 기본 | 없음 | ON | **다크** (미디어 쿼리 폴백) |
| 명시적 라이트 | `"light"` | ON | **라이트** (`:not([data-theme="light"])`로 차단) |
| 명시적 다크 | `"dark"` | OFF | **다크** (셀렉터 우선순위) |

### 사용법

```js
// 다크 테마 활성화
document.documentElement.setAttribute('data-theme', 'dark');

// 라이트 테마 활성화
document.documentElement.setAttribute('data-theme', 'light');

// 시스템 설정 따르기 (폴백 모드)
document.documentElement.removeAttribute('data-theme');
```

---

## 5. 마이그레이션 매핑

기존 플랫 토큰에서 3-Tier 참조 체인으로의 전환 테이블.

### 색상 마이그레이션

| 기존 (플랫) | Component | Semantic | Primitive |
|------------|-----------|----------|-----------|
| `background: #ffffff` | - | `var(--background)` | `var(--color-white)` |
| `color: #171717` | - | `var(--foreground)` | `var(--color-gray-900)` |
| `background: #2563eb` | `var(--button-primary-bg)` | `var(--primary)` | `var(--color-blue-600)` |
| `color: #ffffff` (버튼 위) | `var(--button-primary-fg)` | `var(--primary-foreground)` | `var(--color-white)` |
| `border: #e5e5e5` | `var(--card-border)` | `var(--border)` | `var(--color-gray-200)` |
| `background: #f5f5f5` | - | `var(--muted)` | `var(--color-gray-100)` |
| `color: #737373` | - | `var(--muted-foreground)` | `var(--color-gray-500)` |
| `background: #ef4444` | - | `var(--destructive)` | `var(--color-red-500)` |
| `background: #f59e0b` | - | `var(--accent)` | `var(--color-amber-500)` |

### 컴포넌트 마이그레이션

| 기존 (플랫) | 새 토큰 체인 |
|------------|-------------|
| `button { background: #2563eb }` | `var(--button-primary-bg)` -> `var(--primary)` -> `var(--color-blue-600)` |
| `button { border: 1px solid #e5e5e5 }` | `var(--button-outline-border)` -> `var(--border)` -> `var(--color-gray-200)` |
| `input { background: #fff }` | `var(--input-bg)` -> `var(--background)` -> `var(--color-white)` |
| `input:focus { border-color: #2563eb }` | `var(--input-focus-border)` -> `var(--primary)` -> `var(--color-blue-600)` |
| `card { box-shadow: 0 1px 2px ... }` | `var(--card-shadow)` -> `var(--shadow-sm)` -> primitive shadow |
| `.modal-overlay { background: rgba(0,0,0,0.5) }` | `var(--modal-overlay)` (직접 값) |

---

## 6. 토큰 추가 가이드

### 6.1 Primitive 토큰 추가

**파일:** `src/styles/tokens/primitive.css`

```css
/* 예: 새로운 Teal 팔레트 추가 */
:root {
  /* 기존 토큰들... */

  /* Teal (새로 추가) */
  --color-teal-50: #f0fdfa;
  --color-teal-500: #14b8a6;
  --color-teal-900: #134e4a;
}
```

**체크리스트:**
1. `:root` 블록 안에 추가한다.
2. 네이밍: `--{category}-{variant}-{shade}` 형식을 따른다.
3. 값은 하드코딩 (hex, rem 등)만 사용한다. 다른 토큰을 참조하지 않는다.
4. 주석으로 용도를 명시한다.

### 6.2 Semantic 토큰 추가

**파일:** `src/styles/tokens/semantic.css`

```css
/* 예: Teal 기반의 "highlight" 역할 추가 */

/* 라이트 테마 */
:root {
  /* 기존 토큰들... */
  --highlight: var(--color-teal-500);
  --highlight-bg: var(--color-teal-50);
  --highlight-foreground: var(--color-teal-900);
}

/* 다크 테마 (명시적) */
[data-theme="dark"] {
  /* 기존 토큰들... */
  --highlight: var(--color-teal-400);
  --highlight-bg: var(--color-teal-950);
  --highlight-foreground: var(--color-teal-200);
}

/* 다크 테마 (시스템 폴백) - 반드시 동일 값 추가 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* 기존 토큰들... */
    --highlight: var(--color-teal-400);
    --highlight-bg: var(--color-teal-950);
    --highlight-foreground: var(--color-teal-200);
  }
}
```

**체크리스트:**
1. Primitive 토큰만 참조한다 (`var(--color-*)`, `var(--space-*)` 등).
2. **3곳 모두** 추가한다: `:root`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`.
3. 다크 테마의 명시적 토글과 시스템 폴백은 **동일한 값**을 유지한다.
4. 네이밍: `--{role}` 또는 `--{role}-{sub-property}` 형식을 따른다.

### 6.3 Component 토큰 추가

**파일:** `src/styles/tokens/component.css`

```css
/* 예: Tooltip 컴포넌트 토큰 추가 */
:root {
  /* 기존 토큰들... */

  /* --- Tooltip --- */
  --tooltip-bg: var(--card);
  --tooltip-fg: var(--card-foreground);
  --tooltip-border: var(--border);
  --tooltip-shadow: var(--shadow-md);
}
```

**체크리스트:**
1. Semantic 토큰만 참조한다 (`var(--primary)`, `var(--border)` 등).
2. `:root`에만 정의한다. 테마 전환은 Semantic 계층에서 자동 처리된다.
3. 네이밍: `--{component}-{variant}-{property}` 형식을 따른다.
4. 컴포넌트 주석 헤더(`/* --- ComponentName --- */`)를 추가한다.

### 전체 추가 흐름 요약

```
1. Primitive에 원시 값 정의
   primitive.css  →  --color-teal-500: #14b8a6

2. Semantic에 역할 부여 (라이트 + 다크 x 2곳)
   semantic.css   →  --highlight: var(--color-teal-500)

3. Component에 컴포넌트 전용 토큰 생성
   component.css  →  --tooltip-bg: var(--highlight-bg)

4. 컴포넌트에서 사용
   tooltip.css    →  background: var(--tooltip-bg)
```

> **주의:** Primitive 값을 변경하면 해당 값을 참조하는 모든 Semantic, Component 토큰에 자동으로 전파된다. 변경 전 영향 범위를 반드시 확인한다.
