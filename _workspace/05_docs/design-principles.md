# 디자인 원칙

이 문서는 프로젝트 디자인 시스템의 핵심 원칙을 정의한다. 모든 UI 작업은 이 원칙에 따라 일관성을 유지해야 한다.

---

## 1. 토큰 기반 테마 (Token-Driven Theming)

### 원칙

색상, 그림자, 간격 등 모든 시각적 값은 **CSS 커스텀 프로퍼티(변수)**로 관리한다. 컴포넌트에 하드코딩된 색상값(`#3b82f6`, `rgb(...)`)을 직접 사용하지 않는다.

### 구조

```
Primitive Token → Semantic Token → Component Token
   (원시값)          (역할 부여)        (컴포넌트별)
```

- **Primitive**: `--color-blue-600`, `--shadow-sm` 등 의미 없는 원시값
- **Semantic**: `--primary`, `--foreground`, `--border` 등 역할 기반 별칭
- **Component**: `--button-primary-bg`, `--card-border` 등 컴포넌트 전용 토큰

### 규칙

```css
/* 올바른 사용 */
background: var(--button-primary-bg);
color: var(--foreground);

/* 잘못된 사용 */
background: #3b82f6;
color: rgb(23, 23, 23);
```

컴포넌트가 참조해야 할 토큰 계층:
1. Component Token이 있으면 Component Token 사용 (`--button-primary-bg`)
2. 없으면 Semantic Token 사용 (`--primary`, `--muted`)
3. Primitive Token은 **토큰 정의 파일 내부에서만** 참조

---

## 2. 접근성 우선 (Accessibility-First)

### 포커스 링 (Focus Ring)

모든 인터랙티브 요소는 키보드 포커스 시 시각적 표시를 제공해야 한다.

```css
/* globals.css에 정의된 유틸리티 클래스 */
.focus-ring:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* 또는 인라인 Tailwind */
focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2
```

- `focus-ring` 클래스: IconButton 등 간단한 요소에 사용
- 인라인 `focus-visible:*`: Button, Input 등 상세 제어가 필요한 경우 사용

### ARIA 속성

- `IconButton`은 `ariaLabel`을 **필수 prop**으로 강제한다
- `Modal`은 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 자동 적용한다
- 스크린 리더 전용 텍스트는 `.sr-only` 클래스를 사용한다

### 키보드 네비게이션

- `Modal`은 포커스 트랩(focus trap)을 구현한다 (Tab/Shift+Tab 순환)
- 열릴 때 첫 번째 포커스 가능한 요소로 자동 이동한다
- `Escape` 키로 닫을 수 있다

### 모션 감소 (Reduced Motion)

```css
@media (prefers-reduced-motion: reduce) {
  .transition-base {
    transition-duration: 0ms !important;
  }
  * {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

사용자가 시스템 설정에서 모션 감소를 활성화하면 모든 트랜지션과 애니메이션이 즉시 비활성화된다.

---

## 3. 불변 Props (Immutable Props)

### 원칙

모든 컴포넌트의 props 인터페이스에 `readonly` 수정자를 적용한다. 이를 통해 props 객체의 의도치 않은 변경을 컴파일 타임에 방지한다.

```typescript
// 올바른 패턴
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
}

interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly color?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}
```

### 적용 범위

- UI 프리미티브 (`Button`, `Badge`, `Card` 등)
- 피처 컴포넌트 (`SetupButton`, `MarkdownViewer` 등)
- 내부 서브 컴포넌트 (`FrontmatterTable` 등)

### 유틸리티 함수에도 적용

```typescript
// cn() 함수의 파라미터도 ReadonlyArray 사용
export function cn(
  ...classes: ReadonlyArray<string | false | undefined | null>
): string;
```

---

## 4. 피처 기반 조직 + 공유 UI 프리미티브

### 디렉토리 구조

```
src/
├── components/
│   ├── ui/              ← 공유 UI 프리미티브 (Button, Card, Modal 등)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── index.ts     ← 배럴 익스포트
│   ├── actions/          ← 액션 관련 피처 컴포넌트
│   │   └── setup-button.tsx
│   ├── common/           ← 공통 피처 컴포넌트
│   │   ├── markdown-viewer.tsx
│   │   └── theme-toggle.tsx
│   ├── catalog/          ← 카탈로그 피처
│   └── ranking/          ← 랭킹 피처
├── lib/                  ← 유틸리티 (cn.ts 등)
├── hooks/                ← 커스텀 훅
└── styles/
    ├── tokens/
    │   ├── primitive.css
    │   ├── semantic.css
    │   └── component.css
    └── globals.css
```

### 원칙

- **UI 프리미티브**: 도메인 로직 없이 순수한 시각적 요소만 담당. `@/components/ui`에서 배럴 익스포트
- **피처 컴포넌트**: UI 프리미티브를 조합하여 도메인 로직 구현. 기능별 폴더에 배치
- **임포트 규칙**: 피처 컴포넌트는 `@/components/ui`에서 프리미티브를 임포트

```typescript
// 피처 컴포넌트에서의 임포트
import { Button } from "@/components/ui";
import { Modal, ModalBody } from "@/components/ui";
```

---

## 5. Tailwind + CSS Custom Properties 하이브리드 접근

### 전략

| 항목 | 접근 방식 |
|------|-----------|
| 색상, 그림자, 테마 | CSS 커스텀 프로퍼티 (`var(--token)`) |
| 레이아웃, 간격, 크기 | Tailwind 유틸리티 (`px-4`, `rounded-lg`, `flex`) |
| 상태 스타일 | Tailwind 수정자 (`hover:`, `focus-visible:`, `disabled:`) |
| 공통 유틸리티 | globals.css 커스텀 클래스 (`transition-base`, `focus-ring`) |

### 클래스 병합

`cn()` 유틸리티를 사용하여 조건부 클래스를 결합한다. 이 함수는 외부 의존성 없이 falsy 값을 필터링하고 문자열을 연결한다.

```typescript
import { cn } from "@/lib/cn";

className={cn(
  "rounded-lg font-medium transition-base",              // 기본 클래스
  "focus-visible:outline-2 focus-visible:outline-offset-2", // 접근성
  VARIANT_CLASSES[variant],                               // 토큰 기반 변형
  SIZE_CLASSES[size],                                     // Tailwind 크기
  className,                                              // 외부 오버라이드
)}
```

### 글로벌 유틸리티 클래스

`globals.css`에 정의된 재사용 클래스:

- `.transition-base` — 색상, 배경, 테두리, 그림자, 투명도, 변환에 대한 표준 트랜지션
- `.focus-ring` — 포커스 시 아웃라인 링 표시
- `.sr-only` — 스크린 리더 전용 숨김
- `.scrollbar-hide` — 스크롤바 숨김
