# 기여 가이드

디자인 시스템에 기여할 때 따라야 할 규칙과 절차를 정리한다.

---

## 새 UI 프리미티브 추가

### 1. 파일 생성

**위치**: `src/components/ui/{component-name}.tsx`

파일명은 kebab-case를 사용한다 (`icon-button.tsx`, `date-picker.tsx`).

### 2. Props 패턴

모든 props 인터페이스에 `readonly` 수정자를 적용한다:

```typescript
interface TooltipProps {
  readonly content: string;
  readonly placement?: "top" | "bottom" | "left" | "right";
  readonly className?: string;
  readonly children: React.ReactNode;
}
```

규칙:
- `readonly`를 모든 prop에 적용한다
- 변형이 있으면 `type`으로 리터럴 유니온을 정의한다 (`type TooltipPlacement = "top" | "bottom"`)
- 변형별 스타일은 `Record<Variant, string>` 상수로 관리한다
- 네이티브 HTML 속성을 확장할 때는 `extends React.HTMLAttributes<HTMLElement>` 사용
- `className` prop을 항상 제공하여 외부 오버라이드를 허용한다

### 3. 스타일링 규칙

```typescript
export function Tooltip({ content, placement = "top", className, children }: TooltipProps) {
  return (
    <div
      className={cn(
        // 1. 기본 구조 스타일 (Tailwind)
        "absolute rounded-md px-2 py-1 text-xs",
        // 2. 토큰 기반 색상 (CSS 변수)
        "bg-[var(--tooltip-bg)] text-[var(--tooltip-fg)]",
        // 3. 접근성 (포커스, 모션)
        "transition-base",
        // 4. 변형별 클래스
        PLACEMENT_CLASSES[placement],
        // 5. 외부 오버라이드 (항상 마지막)
        className,
      )}
      role="tooltip"
    >
      {content}
    </div>
  );
}
```

`cn()` 호출 순서:
1. 기본 구조 (레이아웃, 크기, 반경)
2. 토큰 기반 색상/그림자
3. 접근성 관련 (`focus-visible:*`, `transition-base`)
4. 변형/크기 클래스
5. `className` (외부 오버라이드, 항상 마지막)

### 4. 토큰 추가

새 컴포넌트에 필요한 토큰을 `src/styles/tokens/component.css`에 추가한다:

```css
/* --- Tooltip --- */
--tooltip-bg: var(--foreground);
--tooltip-fg: var(--background);
```

### 5. 배럴 익스포트 등록

`src/components/ui/index.ts`에 추가한다:

```typescript
export { Tooltip } from "./tooltip";
```

### 6. 스토리 작성

`src/components/ui/{component-name}.stories.tsx` 파일을 생성한다:

- 모든 변형(variant)에 대한 스토리
- 다양한 크기(size)에 대한 스토리
- 인터랙티브 상태 (hover, disabled, loading 등)

### 7. 테스트 작성

- 각 변형의 렌더링 테스트
- 접근성 속성(ARIA) 확인
- 키보드 인터랙션 테스트 (해당 시)
- 이벤트 핸들러 호출 확인

---

## 토큰 수정

### 수정 가능 범위

| 작업 | 허용 여부 | 주의사항 |
|------|-----------|----------|
| Primitive에 새 색상 추가 | 허용 | 기존 값 변경 금지 |
| Semantic 토큰 값 변경 | 주의 | 라이트/다크 양쪽 변경 필수 |
| Component 토큰 추가 | 허용 | Semantic 참조 권장 |
| Primitive 토큰 값 변경 | 금지 | 전체 시스템에 영향 |
| Semantic 토큰 이름 변경 | 금지 | 하위 호환성 파괴 |

### 하위 호환성 규칙

- **절대 삭제하지 않는다**: 기존 토큰을 제거하면 참조하는 모든 컴포넌트가 깨진다
- **이름을 변경하지 않는다**: 토큰 이름은 API와 동일하다. 변경 시 deprecated 별칭을 추가한다
- **값 변경 시 영향 범위를 확인한다**: 해당 토큰을 참조하는 모든 컴포넌트를 검색한다

```bash
# 토큰 사용처 검색
grep -r "var(--button-primary-bg)" src/
```

### 다크 테마 누락 방지

Semantic 토큰을 추가/수정할 때 다음 3곳을 반드시 함께 수정한다:

1. `:root { }` (라이트 기본값)
2. `[data-theme="dark"] { }` (명시 다크)
3. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { } }` (시스템 폴백)

---

## PR 체크리스트

디자인 시스템 변경사항이 포함된 PR을 올릴 때 다음 항목을 확인한다.

### 컴포넌트 추가/수정

- [ ] `readonly` 수정자가 모든 props에 적용되었는가
- [ ] `cn()` 유틸리티를 사용하여 클래스를 병합하는가
- [ ] `className` prop을 마지막 인자로 전달하여 오버라이드를 허용하는가
- [ ] 하드코딩된 색상값(`#hex`, `rgb()`)이 없고 `var(--token)` 을 사용하는가
- [ ] 포커스 링이 적용되었는가 (`focus-ring` 클래스 또는 `focus-visible:outline-*`)
- [ ] 인터랙티브 요소에 적절한 ARIA 속성이 있는가
- [ ] `transition-base` 또는 적절한 트랜지션이 적용되었는가
- [ ] 배럴 익스포트(`index.ts`)에 등록되었는가
- [ ] 스토리 파일이 작성되었는가
- [ ] 테스트가 작성되었는가

### 토큰 추가/수정

- [ ] 적절한 계층(Primitive/Semantic/Component)에 추가되었는가
- [ ] 네이밍 컨벤션을 따르는가
- [ ] Semantic 토큰인 경우 라이트/다크/시스템폴백 3곳 모두 정의되었는가
- [ ] 기존 토큰의 이름이나 값을 변경하지 않았는가 (또는 deprecated 별칭 추가)
- [ ] 영향받는 컴포넌트를 라이트/다크 모드에서 시각적으로 확인했는가

### 공통

- [ ] 파일이 800줄을 초과하지 않는가
- [ ] 함수가 50줄을 초과하지 않는가
- [ ] `prefers-reduced-motion` 지원이 필요한 애니메이션을 추가했다면 처리되었는가

---

## 코드 스타일 요구사항

### readonly Props

모든 props 인터페이스의 프로퍼티에 `readonly` 수정자를 적용한다. TypeScript가 props 객체의 변경을 컴파일 타임에 방지한다.

```typescript
// 올바름
interface Props {
  readonly value: string;
  readonly onChange: (v: string) => void;
}

// 잘못됨
interface Props {
  value: string;
  onChange: (v: string) => void;
}
```

### cn() 유틸리티

클래스 문자열을 조건부로 결합할 때 반드시 `cn()`을 사용한다. 직접 문자열 연결이나 템플릿 리터럴을 사용하지 않는다.

```typescript
// 올바름
className={cn("base-class", condition && "conditional-class", className)}

// 잘못됨
className={`base-class ${condition ? "conditional-class" : ""} ${className}`}
```

### focus-ring 클래스

인터랙티브 요소에는 반드시 키보드 포커스 표시를 제공한다.

**방법 1**: `focus-ring` 유틸리티 클래스 (간단한 경우)

```tsx
<button className="focus-ring">클릭</button>
```

**방법 2**: 인라인 Tailwind (세밀한 제어가 필요한 경우)

```tsx
<button className="focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2">
  클릭
</button>
```

### 변형 상수 패턴

변형별 스타일은 컴포넌트 외부에 `Record<Variant, string>` 상수로 선언한다:

```typescript
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)]",
  outline: "border border-[var(--button-outline-border)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};
```

이 패턴은 컴포넌트 함수 내부의 조건문을 제거하고, 새 변형 추가를 용이하게 한다.
