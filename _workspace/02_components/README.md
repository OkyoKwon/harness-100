# UI 프리미티브 컴포넌트

## 위치

`src/components/ui/`

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| Button | `button.tsx` | 범용 버튼 (primary, outline, ghost, dashed) |
| IconButton | `icon-button.tsx` | 아이콘 전용 버튼 (필수 aria-label) |
| Input | `input.tsx` | 텍스트 입력 (선택적 아이콘 슬롯, forwardRef) |
| Select | `select.tsx` | 셀렉트 드롭다운 |
| Badge | `badge.tsx` | 레이블/태그 (default, tool, framework, category) |
| Card | `card.tsx` | 카드 컨테이너 (Card, CardHeader, CardBody, CardFooter) |
| Modal | `modal.tsx` | 모달 다이얼로그 (포커스 트랩, Escape, body scroll lock) |

## 유틸리티

| 유틸리티 | 파일 | 설명 |
|---------|------|------|
| cn() | `src/lib/cn.ts` | 경량 클래스명 병합 함수 |

## Storybook

모든 프리미티브에 스토리가 작성되어 있습니다:

```bash
pnpm storybook
```

`http://localhost:6006`에서 확인 가능.

## 적용된 리팩터링

| 기존 컴포넌트 | 사용 프리미티브 |
|-------------|--------------|
| `setup-button.tsx` | `Button variant="primary"` |
| `zip-button.tsx` | `Button variant="outline"` |
| `theme-toggle.tsx` | `IconButton` |
| `language-toggle.tsx` | `IconButton` |
| `markdown-viewer.tsx` | `Modal` + `ModalBody` + `IconButton` |
