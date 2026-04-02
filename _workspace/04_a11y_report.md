# WCAG 2.1 AA 접근성 감사 보고서

> **감사 일자**: 2026-04-02
> **대상**: harness-100-ui 전체 컴포넌트
> **기준**: WCAG 2.1 Level AA (Success Criteria 1.1 ~ 4.1)

---

## 1. 대비비 매트릭스 (Color Contrast Matrix)

### 1.1 계산 기준

WCAG 2.1 AA 기준:
- **일반 텍스트** (normal text, < 18pt / < 14pt bold): **4.5:1** 이상
- **큰 텍스트** (large text, >= 18pt / >= 14pt bold): **3:1** 이상
- **UI 컴포넌트 / 그래픽**: **3:1** 이상

상대 휘도(relative luminance) 공식:
`L = 0.2126 * R + 0.7152 * G + 0.0722 * B` (sRGB 감마 보정 후)
대비비(contrast ratio) = `(L1 + 0.05) / (L2 + 0.05)` (L1 > L2)

### 1.2 Light Theme 대비비

| 용도 | 전경 (foreground) | 배경 (background) | Hex 쌍 | 대비비 | 판정 |
|------|-------------------|-------------------|--------|--------|------|
| 본문 텍스트 | `--foreground` (gray-900) | `--background` (white) | `#171717` on `#ffffff` | **15.4:1** | PASS |
| Muted 텍스트 | `--muted-foreground` (gray-500) | `--background` (white) | `#737373` on `#ffffff` | **4.6:1** | PASS (경계) |
| Muted 텍스트 on card | `--muted-foreground` (gray-500) | `--card` (white) | `#737373` on `#ffffff` | **4.6:1** | PASS (경계) |
| Muted 텍스트 on muted | `--muted-foreground` (gray-500) | `--muted` (gray-100) | `#737373` on `#f5f5f5` | **4.2:1** | FAIL (일반), PASS (큰 텍스트) |
| Primary 버튼 | `--primary-foreground` (white) | `--primary` (blue-600) | `#ffffff` on `#2563eb` | **4.6:1** | PASS (경계) |
| Secondary badge | `--secondary-foreground` (gray-600) | `--secondary` (gray-100) | `#525252` on `#f5f5f5` | **6.4:1** | PASS |
| Success 알림 | `--success-foreground` (green-800) | `--success-bg` (green-50) | `#166534` on `#f0fdf4` | **7.5:1** | PASS |
| Info 알림 | `--info-foreground` (blue-800) | `--info-bg` (blue-50) | `#1e3a5f` on `#eff6ff` | **9.1:1** | PASS |
| Danger 알림 | `--danger-foreground` (red-800) | `--danger-bg` (red-50) | `#991b1b` on `#fef2f2` | **7.8:1** | PASS |
| Warning 알림 | `--warning-foreground` (amber-800) | `--warning-bg` (amber-50) | `#92400e` on `#fffbeb` | **7.1:1** | PASS |
| Tool badge | `--badge-tool-fg` (blue-700) | `--badge-tool-bg` (blue-50) | `#1d4ed8` on `#eff6ff` | **6.0:1** | PASS |
| Framework badge | `--badge-framework-fg` (violet-600) | `--badge-framework-bg` (violet-50) | `#7c3aed` on `#faf5ff` | **5.1:1** | PASS |
| Code block | `--code-fg` | `--code-bg` | `#e2e8f0` on `#1a1a2e` | **11.5:1** | PASS |
| 링크 텍스트 | `--primary` (blue-600) | `--background` (white) | `#2563eb` on `#ffffff` | **4.6:1** | PASS (경계) |

### 1.3 Dark Theme 대비비

| 용도 | 전경 (foreground) | 배경 (background) | Hex 쌍 | 대비비 | 판정 |
|------|-------------------|-------------------|--------|--------|------|
| 본문 텍스트 | `--foreground` | `--background` (gray-950) | `#ededed` on `#0a0a0a` | **17.4:1** | PASS |
| Muted 텍스트 | `--muted-foreground` (gray-400) | `--background` (gray-950) | `#a3a3a3` on `#0a0a0a` | **8.6:1** | PASS |
| Muted 텍스트 on card | `--muted-foreground` (gray-400) | `--card` | `#a3a3a3` on `#1c1c1c` | **6.2:1** | PASS |
| Muted 텍스트 on muted | `--muted-foreground` (gray-400) | `--muted` (gray-800) | `#a3a3a3` on `#262626` | **4.8:1** | PASS |
| Primary 버튼 | `--primary-foreground` (white) | `--primary` (blue-500) | `#ffffff` on `#3b82f6` | **3.4:1** | FAIL (일반), PASS (큰 텍스트) |
| Secondary badge | `--secondary-foreground` (gray-400) | `--secondary` | `#a3a3a3` on `#2a2a2a` | **5.3:1** | PASS |
| Success 알림 | `--success-foreground` (green-200) | `--success-bg` (green-950) | `#bbf7d0` on `#052e16` | **10.2:1** | PASS |
| Info 알림 | `--info-foreground` (blue-200) | `--info-bg` (blue-900) | `#bfdbfe` on `#0c1929` | **10.7:1** | PASS |
| Danger 알림 | `--danger-foreground` (red-300) | `--danger-bg` (red-950) | `#fca5a5` on `#2a0a0a` | **7.0:1** | PASS |
| Warning 알림 | `--warning-foreground` (amber-200) | `--warning-bg` | `#fde68a` on `#1c1608` | **11.8:1** | PASS |
| Tool badge | `--badge-tool-fg` (blue-300) | `--badge-tool-bg` (blue-900) | `#93c5fd` on `#0c1929` | **7.5:1** | PASS |
| Framework badge | `--badge-framework-fg` (violet-300) | `--badge-framework-bg` (violet-900) | `#c4b5fd` on `#1a0a2e` | **8.9:1** | PASS |
| Accent 텍스트 | `--accent-foreground` (yellow-50) | `--accent` (amber-500) | `#fefce8` on `#f59e0b` | **1.4:1** | FAIL |
| Code block | `--code-fg` | `--code-bg` (gray-950) | `#e2e8f0` on `#0a0a0a` | **15.8:1** | PASS |

### 1.4 대비비 요약

| 테마 | PASS | FAIL | 경계 (4.5~5.0:1) |
|------|------|------|-------------------|
| Light | 12 | 1 | 3 |
| Dark | 11 | 2 | 0 |

**주요 FAIL 항목**:
1. **Light**: `--muted-foreground` on `--muted` (gray-500 on gray-100) = 4.2:1 -- text-xs 크기에서 사용 시 FAIL
2. **Dark**: `--primary-foreground` on `--primary` (white on blue-500) = 3.4:1 -- primary 버튼 텍스트 FAIL
3. **Dark**: `--accent-foreground` on `--accent` (yellow-50 on amber-500) = 1.4:1 -- 심각한 FAIL

---

## 2. 키보드 내비게이션 매트릭스 (Keyboard Navigation Matrix)

### 2.1 컴포넌트별 키보드 동작

| 컴포넌트 | Tab | Shift+Tab | Enter | Space | Escape | Arrow Keys | Focus Visible |
|----------|-----|-----------|-------|-------|--------|------------|---------------|
| **Button** (`button.tsx`) | O | O | O (native) | O (native) | - | - | O (`focus-visible:outline-2`) |
| **IconButton** (`icon-button.tsx`) | O | O | O (native) | O (native) | - | - | O (`focus-ring` class) |
| **Modal** (`modal.tsx`) | O (focus trap) | O (focus trap) | - | - | O (닫기) | - | O (내부 요소) |
| **MarkdownViewer** (`markdown-viewer.tsx`) | O (Modal 위임) | O (Modal 위임) | - | - | O (Modal 위임) | - | O |
| **ThemeToggle** (`theme-toggle.tsx`) | O | O | O | O | - | - | O (IconButton 위임) |
| **LanguageToggle** (`language-toggle.tsx`) | O | O | O | O | - | - | O (IconButton 위임) |
| **SearchBar** (`search-bar.tsx`) | O | O | - | - | - | - | O (`focus-visible:outline-2`) |
| **CategoryTabs** (`category-tabs.tsx`) | O (각 버튼) | O | O | O | - | X (미구현) | O (`focus-visible:outline-2`) |
| **HarnessCard** (`harness-card.tsx`) | O (Link) | O | O (navigation) | - | - | - | O (`focus-visible:outline-2`) |
| **AgentList** (`agent-list.tsx`) | O (각 버튼) | O | O (toggle) | O (toggle) | - | X (미구현) | O (`focus-visible:ring-2`) |
| **FavoriteToggle** (`favorite-toggle.tsx`) | O | O | O | O | - | - | O (`focus-visible:outline-2`) |
| **Toast** (`toast.tsx`) | O (dismiss 버튼) | O | O | O | - | - | X (명시적 focus 스타일 없음) |

### 2.2 Focus Trap 분석 (Modal)

`modal.tsx` focus trap 구현 상태:

| 항목 | 상태 | 상세 |
|------|------|------|
| Focus 진입 시 첫 번째 요소로 이동 | O | `setTimeout` 후 첫 `button` focus |
| Tab으로 마지막 요소 -> 첫 번째 요소 순환 | O | `FOCUSABLE_SELECTOR` 사용 |
| Shift+Tab으로 첫 번째 요소 -> 마지막 요소 순환 | O | 구현 완료 |
| Escape 키로 모달 닫기 | O | `handleKeyDown` 핸들러 |
| 모달 닫힘 후 trigger 요소로 focus 복원 | X | **미구현** |
| body scroll 잠금 | O | `document.body.style.overflow = "hidden"` |

### 2.3 "/" 키보드 단축키 (SearchBar)

| 항목 | 상태 | 상세 |
|------|------|------|
| "/" 키로 검색 필드 focus | O | `keydown` 이벤트 리스너 |
| Input/Textarea/Select 활성 시 무시 | O | `activeElement.tagName` 체크 |
| Ctrl/Cmd 조합 시 무시 | O | `e.ctrlKey`, `e.metaKey` 체크 |
| 키보드 단축키 시각적 힌트 | O | `<kbd>` 요소로 표시 |
| 단축키 접근성 공지 | X | `aria-keyshortcuts` 속성 없음 |

---

## 3. ARIA 감사 (ARIA Audit)

### 3.1 컴포넌트별 ARIA 속성

#### Modal (`modal.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `role="dialog"` | O | |
| `aria-modal="true"` | O | |
| `aria-labelledby` | O | `titleId` (props 또는 "modal-title") |
| `aria-describedby` | X | 미사용 |

#### MarkdownViewer (`markdown-viewer.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| Modal `ariaLabelledBy` | O | `"md-viewer-title"` |
| 닫기 버튼 `aria-label` | O | `t("a11y.close")` |
| 제목 `id` 연결 | O | `id="md-viewer-title"` |

#### ThemeToggle (`theme-toggle.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `aria-label` | O | 테마에 따라 동적 변경 |
| `aria-pressed` | X | **toggle 버튼에 필수** |

#### LanguageToggle (`language-toggle.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `aria-label` | O | locale에 따라 동적 변경 |
| `aria-pressed` | X | **toggle 버튼에 필수** |

#### SearchBar (`search-bar.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `aria-label` 또는 `<label>` | X | **입력 필드에 label 없음** |
| `aria-keyshortcuts` | X | "/" 단축키 미공지 |
| `role="search"` | X | 검색 컨테이너에 landmark 없음 |
| spinner `aria-live` | X | debounce 로딩 상태 공지 없음 |

#### CategoryTabs (`category-tabs.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `role="tablist"` | X | **탭 컨테이너에 role 없음** |
| `role="tab"` | X | **각 버튼에 role 없음** |
| `aria-selected` | X | **활성 탭 표시 없음** |
| `aria-controls` | X | **패널 연결 없음** |
| 스크롤 화살표 `aria-label` | O | `t("a11y.prevCategory")`, `t("a11y.nextCategory")` |

#### HarnessCard (`harness-card.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| Link의 접근성 | O (부분) | `href` 존재, 텍스트 콘텐츠 있음 |
| 카드 내부 버튼 중첩 | ! | Link 내부에 interactive 요소 (FavoriteToggle, SetupButton, ZipButton) |
| QuickPreview 접근성 | X | hover-only 트리거, 키보드 접근 불가 |

#### AgentList (`agent-list.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `aria-expanded` | X | **accordion 버튼에 필수** |
| `aria-controls` | X | **패널 ID 연결 없음** |
| `role="img"` + `aria-label` | O | emoji에 적용 |
| accordion 그룹 role | X | 그룹 식별 없음 |

#### FavoriteToggle (`favorite-toggle.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `aria-label` | O | 상태별 동적 변경 |
| `aria-pressed` | X | **toggle 상태 미공지** |
| 최소 터치 타겟 | O | `min-w-[44px] min-h-[44px]` |

#### Toast (`toast.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `role="status"` | O | |
| `aria-live="polite"` | O | |
| 닫기 버튼 `aria-label` | O | `t("a11y.close")` |
| error toast `role="alert"` | X | error 타입도 `role="status"` 사용 |

#### Button (`button.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `type="button"` | O | 명시적 type |
| disabled 상태 | O | `disabled` prop 전달 |
| loading 상태 접근성 | X | `aria-busy` 또는 `aria-disabled` 없음 |
| focus-visible | O | 구현 완료 |

#### Layout (`layout.tsx`)
| 속성 | 상태 | 값 |
|------|------|-----|
| `<html lang>` | O | `lang="ko"` (기본값) |
| lang 동적 변경 | O | `langScript`로 즉시 반영 |
| Skip navigation link | X | **미구현** |
| `<main>` landmark | X | **확인 필요** (children 내부) |

### 3.2 aria-live Region 분석

| 위치 | 타입 | 값 | 적절성 |
|------|------|-----|---------|
| Toast | `aria-live="polite"` | `role="status"` | 부분적 -- error는 `assertive` + `role="alert"` 권장 |
| SearchBar 로딩 | 없음 | - | FAIL -- 검색 결과 변경 공지 없음 |
| CategoryTabs 결과 수 | 없음 | - | 개선 기회 -- 필터링 후 결과 수 공지 |

---

## 4. 발견 사항 (Findings)

### P0 (Critical) -- 보조 기술 사용자의 접근 차단

| ID | 컴포넌트 | WCAG SC | 문제 |
|----|----------|---------|------|
| P0-01 | `category-tabs.tsx` | 4.1.2 Name, Role, Value | `role="tablist"`, `role="tab"`, `aria-selected` 미사용. 스크린리더가 탭 패턴을 인식하지 못함. Arrow key 내비게이션 미구현. |
| P0-02 | `agent-list.tsx` | 4.1.2 Name, Role, Value | accordion 버튼에 `aria-expanded` 속성 없음. 스크린리더 사용자가 열림/닫힘 상태를 알 수 없음. |
| P0-03 | `search-bar.tsx` | 1.3.1 Info and Relationships, 4.1.2 | `<input>`에 연결된 `<label>` 또는 `aria-label`이 없음. 스크린리더가 입력 필드의 용도를 알 수 없음. |
| P0-04 | `layout.tsx` | 2.4.1 Bypass Blocks | Skip navigation link 미구현. 키보드 사용자가 반복 콘텐츠를 건너뛸 수 없음. |

### P1 (Major) -- 사용 경험 심각하게 저하

| ID | 컴포넌트 | WCAG SC | 문제 |
|----|----------|---------|------|
| P1-01 | `semantic.css` (Dark) | 1.4.3 Contrast (Minimum) | Dark theme에서 primary 버튼 텍스트 (white on blue-500) 대비비 3.4:1. AA 기준 4.5:1 미달. |
| P1-02 | `semantic.css` (Dark) | 1.4.3 Contrast (Minimum) | Dark theme에서 `--accent-foreground` on `--accent` (yellow-50 on amber-500) 대비비 1.4:1. 심각한 미달. |
| P1-03 | `semantic.css` (Light) | 1.4.3 Contrast (Minimum) | Light theme에서 `--muted-foreground` on `--muted` 배경 대비비 4.2:1. xs 크기 텍스트에서 AA 미달. |
| P1-04 | `modal.tsx` | 2.4.3 Focus Order | 모달 닫힘 후 trigger 요소로 focus가 복원되지 않음. 사용자가 페이지 내 위치를 잃어버림. |
| P1-05 | `harness-card.tsx` | 4.1.2 Name, Role, Value | `<Link>` 내부에 interactive 요소 (FavoriteToggle, SetupButton, ZipButton) 중첩. `<a>` 안의 `<button>`은 WCAG 위반 (nested interactive). |
| P1-06 | `theme-toggle.tsx`, `language-toggle.tsx`, `favorite-toggle.tsx` | 4.1.2 Name, Role, Value | toggle 버튼에 `aria-pressed` 속성 없음. 스크린리더가 현재 상태를 명확히 전달하지 못함. |
| P1-07 | `toast.tsx` | 4.1.2 Name, Role, Value | error 타입 toast가 `role="status"` + `aria-live="polite"` 사용. 긴급한 에러는 `role="alert"` + `aria-live="assertive"` 사용 필요. |
| P1-08 | `harness-card.tsx` | 2.1.1 Keyboard | QuickPreview가 hover-only (`onMouseEnter`/`onMouseLeave`) 트리거. 키보드/스크린리더 사용자 접근 불가. |

### P2 (Minor) -- 개선 기회

| ID | 컴포넌트 | WCAG SC | 문제 |
|----|----------|---------|------|
| P2-01 | `search-bar.tsx` | 4.1.2 | `aria-keyshortcuts="/"` 속성으로 단축키 공지 필요. |
| P2-02 | `search-bar.tsx` | 4.1.3 Status Messages | 검색 결과 변경 시 `aria-live` region으로 결과 수 공지 부재. |
| P2-03 | `search-bar.tsx` | 4.1.2 | debounce 로딩 spinner에 `role="status"` + `aria-label="검색 중"` 없음. |
| P2-04 | `button.tsx` | 4.1.2 | loading 상태에서 `aria-busy="true"` 미사용. |
| P2-05 | `toast.tsx` | - | 닫기 버튼에 focus-visible 스타일 없음. opacity만 변경. |
| P2-06 | `category-tabs.tsx` | 2.4.6 Headings and Labels | 카테고리 필터 영역에 시각적/구조적 레이블 없음. |
| P2-07 | `agent-list.tsx` | - | accordion 그룹에 heading 또는 `aria-label`로 섹션 식별 없음. |
| P2-08 | `layout.tsx` | 1.3.1 | `<main>` landmark 확인 필요. `children`에 포함 여부 불확실. |
| P2-09 | `search-bar.tsx` | 1.3.1 | 검색 wrapper에 `role="search"` landmark 없음. |

---

## 5. 수정 계획 (Remediation Plan)

### P0-01: CategoryTabs에 ARIA tablist 패턴 적용

**파일**: `src/components/catalog/category-tabs.tsx`

```tsx
// 컨테이너에 role="tablist" 추가
<div
  ref={scrollRef}
  role="tablist"
  aria-label={t("a11y.categoryFilter")}
  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1"
>
  // 각 버튼에 role="tab", aria-selected 추가
  <button
    type="button"
    role="tab"
    aria-selected={active === "favorites"}
    onClick={() => onSelect("favorites")}
    className={...}
  >
```

Arrow key 내비게이션 추가:
```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  const tabs = ["favorites", "all", ...CATEGORIES.map(c => c.slug)];
  if (e.key === "ArrowRight") {
    e.preventDefault();
    const next = (index + 1) % tabs.length;
    onSelect(tabs[next]);
    // 다음 탭에 focus 이동
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const prev = (index - 1 + tabs.length) % tabs.length;
    onSelect(tabs[prev]);
  }
};
```

### P0-02: AgentList accordion에 aria-expanded 추가

**파일**: `src/components/detail/agent-list.tsx`

```tsx
<button
  type="button"
  aria-expanded={isExpanded}
  aria-controls={`agent-panel-${agent.id}`}
  onClick={() => handleToggle(agent.id)}
  className="flex w-full items-center gap-3 ..."
>

// 패널에 id 추가
{isExpanded && (
  <div
    id={`agent-panel-${agent.id}`}
    role="region"
    aria-labelledby={`agent-header-${agent.id}`}
    className="border-t ..."
  >
```

### P0-03: SearchBar에 label 추가

**파일**: `src/components/catalog/search-bar.tsx`

```tsx
<div className="relative" role="search">
  <label htmlFor="harness-search" className="sr-only">
    {t("search.placeholder")}
  </label>
  <input
    ref={inputRef}
    id="harness-search"
    type="search"
    aria-keyshortcuts="/"
    placeholder={t("search.placeholder")}
    onChange={handleChange}
    ...
  />
```

### P0-04: Skip Navigation Link 추가

**파일**: `src/app/layout.tsx`

```tsx
<body className="min-h-screen">
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-[var(--primary-foreground)]"
  >
    {/* i18n key 추가 필요 */}
    본문으로 건너뛰기
  </a>
  <LanguageProvider>
    <Header />
    <ToastProvider>
      <main id="main-content">
        {children}
      </main>
    </ToastProvider>
  </LanguageProvider>
</body>
```

### P1-01: Dark Theme Primary 버튼 대비비 개선

**파일**: `src/styles/tokens/semantic.css`

```css
[data-theme="dark"] {
  /* 변경 전: --primary: var(--color-blue-500);  -> #3b82f6 (3.4:1) */
  /* 변경 후: --primary: var(--color-blue-400);  -> #60a5fa (3.0:1) -- 오히려 악화 */
  /* 권장: primary-foreground를 어두운 색으로 변경 */
  --primary-foreground: var(--color-gray-950);  /* #0a0a0a on #3b82f6 = 5.5:1 PASS */
}
```

또는 primary 색상을 밝게 유지하고 foreground를 어둡게:
```css
[data-theme="dark"] {
  --primary: var(--color-blue-500);
  --primary-foreground: var(--color-gray-950);  /* dark text on blue button */
}
```

### P1-02: Dark Theme Accent 대비비 개선

**파일**: `src/styles/tokens/semantic.css`

```css
[data-theme="dark"] {
  /* 변경 전: --accent-foreground: var(--color-yellow-50); #fefce8 on #f59e0b = 1.4:1 */
  /* 변경 후: 어두운 전경색 사용 */
  --accent-foreground: var(--color-gray-950);  /* #0a0a0a on #f59e0b = 9.6:1 PASS */
}
```

### P1-03: Light Theme Muted 대비비 개선

**파일**: `src/styles/tokens/semantic.css`

```css
:root {
  /* 변경 전: --muted-foreground: var(--color-gray-500); #737373 on #f5f5f5 = 4.2:1 */
  /* 변경 후: 더 어두운 회색 사용 */
  --muted-foreground: var(--color-gray-600);  /* #525252 on #f5f5f5 = 6.4:1 PASS */
}
```

> **주의**: `--muted-foreground` on `--background` (white)에서의 대비비도 확인 필요.
> `#525252` on `#ffffff` = 7.4:1 PASS

### P1-04: Modal Focus 복원

**파일**: `src/components/ui/modal.tsx`

```tsx
export function Modal({ open, onClose, ... }: ModalProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // 모달 열릴 때 현재 focus 요소 저장
    previousFocusRef.current = document.activeElement as HTMLElement;

    // ... 기존 focus trap 로직 ...

    return () => {
      // 모달 닫힐 때 이전 요소로 focus 복원
      previousFocusRef.current?.focus();
      // ... cleanup ...
    };
  }, [open, handleKeyDown]);
```

### P1-05: HarnessCard Nested Interactive 해결

**파일**: `src/components/catalog/harness-card.tsx`

카드 구조를 변경하여 `<Link>` 내부의 interactive 요소를 분리:

```tsx
<div className="relative group" onMouseEnter={...} onMouseLeave={...}>
  {/* 카드 본문 영역 - 전체가 링크 */}
  <Link
    href={`/harness/${paddedId}`}
    className="block bg-[var(--card)] border ... focus-visible:outline-2 ..."
  >
    <div className="h-1" style={{ backgroundColor: categoryColor }} />
    <div className="p-4">
      <span className="text-sm font-bold ...">{paddedId}</span>
      <h3 ...>{harness.name}</h3>
      <p ...>{harness.description}</p>
      {/* badges */}
    </div>
  </Link>

  {/* Interactive 요소들을 Link 바깥으로 이동, absolute positioning */}
  <div className="absolute top-5 right-4 z-10">
    <FavoriteToggle ... />
  </div>
  <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
    <SetupButton ... />
    <ZipButton ... />
  </div>
</div>
```

### P1-06: Toggle 버튼에 aria-pressed 추가

**파일**: `src/components/common/theme-toggle.tsx`
```tsx
<IconButton
  ariaLabel={effective === "dark" ? t("a11y.lightMode") : t("a11y.darkMode")}
  aria-pressed={effective === "dark"}
  onClick={toggle}
>
```

**파일**: `src/components/common/language-toggle.tsx`
```tsx
<IconButton
  ariaLabel={locale === "ko" ? "Switch to English" : "한국어로 전환"}
  aria-pressed={locale === "en"}
  onClick={toggle}
>
```

**파일**: `src/components/favorites/favorite-toggle.tsx`
```tsx
<button
  type="button"
  aria-pressed={active}
  aria-label={active ? t("favorite.remove") : t("favorite.add")}
  ...
>
```

### P1-07: Error Toast에 role="alert" 적용

**파일**: `src/components/common/toast.tsx`

```tsx
const ARIA_CONFIG: Record<ToastItem["type"], { role: string; ariaLive: string }> = {
  success: { role: "status", ariaLive: "polite" },
  error: { role: "alert", ariaLive: "assertive" },
  info: { role: "status", ariaLive: "polite" },
};

export function Toast({ item, onDismiss }: ToastProps) {
  const ariaConfig = ARIA_CONFIG[item.type];
  return (
    <div
      className={...}
      role={ariaConfig.role}
      aria-live={ariaConfig.ariaLive as "polite" | "assertive"}
    >
```

### P1-08: QuickPreview 키보드 접근성

**파일**: `src/components/catalog/harness-card.tsx`

```tsx
// focus 이벤트로도 preview 트리거
const handleFocus = useCallback(() => {
  hoverTimer.current = setTimeout(() => setShowPreview(true), 400);
}, []);

const handleBlur = useCallback(() => {
  if (hoverTimer.current) {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }
  setShowPreview(false);
}, []);

<Link
  ref={cardRef}
  href={...}
  onFocus={handleFocus}
  onBlur={handleBlur}
  ...
>
```

---

## 부록: 감사 범위 및 도구

### 감사 대상 파일

| 파일 | 유형 |
|------|------|
| `src/styles/globals.css` | 전역 스타일 |
| `src/styles/tokens/primitive.css` | 원시 토큰 (hex 값) |
| `src/styles/tokens/semantic.css` | 의미론적 토큰 |
| `src/styles/tokens/component.css` | 컴포넌트 토큰 |
| `src/components/ui/modal.tsx` | 재사용 Modal |
| `src/components/ui/button.tsx` | 재사용 Button |
| `src/components/ui/icon-button.tsx` | 재사용 IconButton |
| `src/components/common/markdown-viewer.tsx` | Markdown 뷰어 |
| `src/components/common/theme-toggle.tsx` | 테마 전환 |
| `src/components/common/language-toggle.tsx` | 언어 전환 |
| `src/components/common/toast.tsx` | 알림 Toast |
| `src/components/catalog/search-bar.tsx` | 검색 입력 |
| `src/components/catalog/category-tabs.tsx` | 카테고리 탭 |
| `src/components/catalog/harness-card.tsx` | 하네스 카드 |
| `src/components/detail/agent-list.tsx` | 에이전트 아코디언 |
| `src/components/favorites/favorite-toggle.tsx` | 즐겨찾기 토글 |
| `src/app/layout.tsx` | 루트 레이아웃 |

### 긍정적 발견 사항

- `globals.css`에 `@media (prefers-reduced-motion: reduce)` 구현 완료
- `.sr-only` 유틸리티 클래스 정의됨
- `.focus-ring` 유틸리티로 일관된 focus 스타일
- Modal에 focus trap 구현 (Tab/Shift+Tab 순환)
- Toast에 `role="status"` + `aria-live` 적용
- FavoriteToggle에 44x44px 최소 터치 타겟 보장
- IconButton에 `ariaLabel` prop 필수화
- 테마/언어 토글에 상태별 동적 aria-label
- SearchBar의 "/" 단축키에 충돌 방지 로직
- emoji에 `role="img"` + `aria-label` 적용 (agent-list)
