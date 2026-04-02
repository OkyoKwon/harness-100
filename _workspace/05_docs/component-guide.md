# 컴포넌트 사용 가이드

모든 UI 프리미티브는 `@/components/ui`에서 배럴 익스포트된다.

```typescript
import { Button, IconButton, Input, Select, Badge, Card, CardHeader, CardBody, CardFooter, Modal, ModalBody } from "@/components/ui";
```

---

## Button

범용 버튼 컴포넌트. 4가지 변형과 3가지 크기를 지원한다.

**경로**: `src/components/ui/button.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | `"primary" \| "outline" \| "ghost" \| "dashed"` | `"primary"` | 시각적 변형 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 크기 |
| `loading` | `boolean` | `false` | 로딩 스피너 표시 및 비활성화 |
| `disabled` | `boolean` | - | 비활성화 |
| `className` | `string` | - | 추가 클래스 |

`React.ButtonHTMLAttributes<HTMLButtonElement>`를 확장하므로 `onClick`, `type` 등 모든 네이티브 속성을 사용할 수 있다.

### 변형 예시

```tsx
<Button variant="primary">주요 액션</Button>
<Button variant="outline">보조 액션</Button>
<Button variant="ghost">텍스트 액션</Button>
<Button variant="dashed">추가하기</Button>
<Button variant="primary" loading>저장 중...</Button>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 주요 CTA에 `primary` 사용 | 한 화면에 `primary` 버튼 여러 개 배치 |
| 보조 액션에 `outline` 사용 | 링크 역할에 버튼 사용 (대신 `<a>` 사용) |
| 파괴적 액션에는 별도 스타일링 | `ghost`를 중요한 액션에 사용 |
| 비동기 작업 시 `loading` prop 활용 | 수동으로 스피너 구현 |

---

## IconButton

아이콘만 포함하는 버튼. ARIA 라벨이 필수이다.

**경로**: `src/components/ui/icon-button.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `ariaLabel` | `string` | **(필수)** | 스크린 리더용 레이블 |
| `size` | `"sm" \| "md"` | `"md"` | 크기 |
| `className` | `string` | - | 추가 클래스 |

### 사용 예시

```tsx
// 테마 토글
<IconButton ariaLabel="다크 모드로 전환" onClick={toggle}>
  <SunIcon className="h-4 w-4" />
</IconButton>

// 모달 닫기 버튼
<IconButton ariaLabel="닫기" onClick={onClose}>
  <XIcon className="h-5 w-5" />
</IconButton>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 명확한 `ariaLabel` 제공 | `ariaLabel="버튼"` 같은 모호한 레이블 |
| 아이콘 크기를 `size` prop에 맞춤 | 텍스트와 아이콘을 함께 넣기 (대신 `Button` 사용) |
| 보조 액션(닫기, 토글)에 사용 | 주요 CTA에 IconButton 사용 |

---

## Input

텍스트 입력 필드. 선택적 아이콘 슬롯을 지원한다. `forwardRef`로 구현되어 ref 전달이 가능하다.

**경로**: `src/components/ui/input.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `icon` | `React.ReactNode` | - | 왼쪽 아이콘 |
| `className` | `string` | - | 추가 클래스 |

`React.InputHTMLAttributes<HTMLInputElement>`를 확장한다.

### 사용 예시

```tsx
// 기본 입력
<Input placeholder="검색어를 입력하세요" />

// 아이콘 포함
<Input
  icon={<SearchIcon />}
  placeholder="에이전트 검색..."
/>
```

### Do / Don't

| Do | Don't |
|----|-------|
| `placeholder`로 힌트 제공 | placeholder를 라벨 대체로 사용 |
| `icon` prop으로 아이콘 삽입 | 아이콘을 수동으로 포지셔닝 |
| 폼에서 ref 전달 활용 | 입력값을 비제어 방식으로만 사용 |

---

## Select

네이티브 셀렉트 드롭다운. 브라우저 기본 드롭다운을 사용한다.

**경로**: `src/components/ui/select.tsx`

### Props

`React.SelectHTMLAttributes<HTMLSelectElement>`를 확장한다. 추가 커스텀 prop은 없다.

### 사용 예시

```tsx
<Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
  <option value="name">이름순</option>
  <option value="popularity">인기순</option>
</Select>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 옵션이 5개 이하일 때 사용 | 복잡한 커스텀 드롭다운이 필요할 때 사용 |
| `<option>` 요소로 선택지 제공 | children 없이 빈 Select 렌더링 |

---

## Badge

인라인 레이블/태그. 카테고리, 도구, 프레임워크 분류에 사용한다.

**경로**: `src/components/ui/badge.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | `"default" \| "tool" \| "framework" \| "category"` | `"default"` | 시각적 변형 |
| `color` | `string` | - | `category` 변형 전용 커스텀 색상 |
| `className` | `string` | - | 추가 클래스 |

### 변형 예시

```tsx
<Badge variant="default">일반</Badge>
<Badge variant="tool">Python</Badge>
<Badge variant="framework">LangChain</Badge>
<Badge variant="category" color="#e11d48">보안</Badge>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 분류/태그 표시에 사용 | 상태 표시에 사용 (별도 상태 컴포넌트 고려) |
| `category` 변형에 `color` prop 전달 | `tool`/`framework` 변형에 `color` prop 전달 |
| 짧은 텍스트 (1-3 단어) | 긴 문장을 Badge에 넣기 |

---

## Card / CardHeader / CardBody / CardFooter

콘텐츠를 시각적으로 그룹화하는 카드 컨테이너. 4개의 조합 가능한 하위 컴포넌트를 제공한다.

**경로**: `src/components/ui/card.tsx`

### Card Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `hoverable` | `boolean` | `false` | 호버 시 부상 효과 |
| `className` | `string` | - | 추가 클래스 |

`CardHeader`, `CardBody`, `CardFooter`는 `React.HTMLAttributes<HTMLDivElement>`를 확장한다.

### 조합 패턴

```tsx
// 기본 카드
<Card>
  <CardBody>
    <p>카드 콘텐츠</p>
  </CardBody>
</Card>

// 전체 구조
<Card hoverable>
  <CardHeader>
    <h3>제목</h3>
  </CardHeader>
  <CardBody>
    <p>본문</p>
    <Badge variant="tool">Python</Badge>
  </CardBody>
  <CardFooter>
    <Button variant="outline" size="sm">자세히</Button>
  </CardFooter>
</Card>

// 호버 가능한 리스트 아이템
<Card hoverable onClick={handleClick}>
  <CardBody>
    <Badge variant="framework">LangChain</Badge>
    <span>에이전트 이름</span>
  </CardBody>
</Card>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 관련 콘텐츠를 그룹화할 때 사용 | 단순 div 대체로 남용 |
| 클릭 가능한 카드에 `hoverable` 적용 | 정적 카드에 `hoverable` 적용 |
| 하위 컴포넌트 조합으로 구조화 | CardBody 없이 직접 padding 적용 |

---

## Modal / ModalBody

다이얼로그 오버레이. 포커스 트랩, Escape 닫기, 오버레이 클릭 닫기를 기본 제공한다.

**경로**: `src/components/ui/modal.tsx`

### Modal Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | `boolean` | **(필수)** | 열림/닫힘 상태 |
| `onClose` | `() => void` | **(필수)** | 닫기 콜백 |
| `title` | `string` | - | 헤더 타이틀 (자동 렌더링) |
| `ariaLabelledBy` | `string` | `"modal-title"` | aria-labelledby ID |
| `className` | `string` | - | 추가 클래스 |

### 사용 예시

```tsx
// title prop 사용 (자동 헤더)
<Modal open={isOpen} onClose={handleClose} title="설정">
  <ModalBody>
    <p>모달 콘텐츠</p>
  </ModalBody>
</Modal>

// 커스텀 헤더 (ariaLabelledBy 지정)
<Modal open={isOpen} onClose={handleClose} ariaLabelledBy="custom-title">
  <div className="flex items-center justify-between px-5 py-3">
    <h3 id="custom-title">커스텀 헤더</h3>
    <IconButton ariaLabel="닫기" onClick={handleClose}>
      <XIcon />
    </IconButton>
  </div>
  <ModalBody>
    <p>본문</p>
  </ModalBody>
</Modal>
```

### Do / Don't

| Do | Don't |
|----|-------|
| 사용자 확인이 필요한 작업에 사용 | 간단한 알림에 모달 사용 (토스트 고려) |
| `title` 또는 `ariaLabelledBy` 제공 | 접근성 레이블 없이 사용 |
| `ModalBody`로 스크롤 가능한 본문 구성 | 모달 내 모달 중첩 |

---

## 조합 패턴 (Composition Patterns)

### Card + Badge + Button

```tsx
<Card hoverable>
  <CardBody>
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="tool">Python</Badge>
      <Badge variant="framework">CrewAI</Badge>
    </div>
    <h3 className="text-lg font-semibold">에이전트 이름</h3>
    <p className="text-[var(--muted-foreground)]">설명 텍스트</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary" size="sm">설정하기</Button>
    <Button variant="ghost" size="sm">자세히</Button>
  </CardFooter>
</Card>
```

### Modal + IconButton + ModalBody

```tsx
<Modal open={open} onClose={onClose} ariaLabelledBy="viewer-title">
  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
    <h3 id="viewer-title">{title}</h3>
    <IconButton ariaLabel="닫기" onClick={onClose}>
      <XIcon className="h-5 w-5" />
    </IconButton>
  </div>
  <ModalBody>
    {content}
  </ModalBody>
</Modal>
```

---

## 새 프리미티브 생성 vs Tailwind 직접 사용

### 프리미티브를 만들어야 할 때

- 3곳 이상에서 동일한 UI 패턴이 반복될 때
- 접근성 로직(ARIA, 키보드 내비게이션)이 필요할 때
- 토큰 기반 테마 변형이 필요할 때
- 일관된 API(props)가 여러 팀원에게 필요할 때

### Tailwind 직접 사용이 적절할 때

- 한 곳에서만 사용하는 레이아웃/간격 조정
- 단순한 텍스트 스타일링 (`text-sm text-[var(--muted-foreground)]`)
- 기존 프리미티브의 `className` prop으로 충분한 경우
- 피처 컴포넌트 내부의 일회성 레이아웃
