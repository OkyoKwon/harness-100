# 커버리지 분석 보고서

## 현재 상태

- **전체 커버리지**: 27.63% Statements, 22.91% Branch, 32.08% Functions, 27.97% Lines
- **테스트 수**: 154 passing (12 files)
- **목표**: 80%+

## 모듈별 커버리지

### 100% 커버리지 (완료)
| 파일 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| `lib/cli.ts` | 100% | 100% | 100% | 100% |
| `lib/constants.ts` | 100% | 100% | 100% | 100% |
| `lib/harness-loader.ts` | 100% | 100% | 100% | 100% |
| `lib/validation.ts` | 100% | 100% | 100% | 100% |
| `hooks/use-favorites.ts` | 100% | 100% | 100% | 100% |
| `hooks/use-search.ts` | 100% | 100% | 100% | 100% |

### 높은 커버리지
| 파일 | Stmts | Branch | Funcs | Lines | 미커버 |
|------|-------|--------|-------|-------|--------|
| `lib/merge-harnesses.ts` | 96.29% | 100% | 92.85% | 95.83% | Line 30 |

### 0% 커버리지 (갭)
| 파일 | 설명 | 우선순위 |
|------|------|----------|
| `lib/zip-builder.ts` | ZIP 파일 빌드 | P1 — JSZip 의존 |
| `lib/local-writer.ts` | File System Access API 사용 | P2 — 브라우저 전용 |
| `lib/translations.ts` | i18n 번역 키 | P2 — 순수 데이터 |
| `hooks/use-composer.ts` | 하네스 조합 | P1 |
| `hooks/use-modifications.ts` | 에이전트 수정 | P1 |
| `hooks/use-locale.ts` | 언어 전환 | P2 |
| `hooks/use-theme.ts` | 다크모드 | P2 |
| `hooks/use-toast.ts` | 토스트 알림 | P2 |
| `hooks/use-local-setup.ts` | 로컬 세팅 | P2 |
| `hooks/use-zip-download.ts` | ZIP 다운로드 | P2 |

## 80% 달성을 위한 추가 테스트 계획

### P1 (필수 — 즉시 추가)
1. **`hooks/use-composer.ts`** — renderHook 테스트 (선택/해제, 병합 호출)
2. **`hooks/use-modifications.ts`** — 수정 CRUD, localStorage 연동
3. **`lib/zip-builder.ts`** — ZIP 생성, 파일 포함 확인

### P2 (권장 — 커버리지 보강)
4. **`lib/translations.ts`** — 키 존재 확인, 치환 동작
5. **`hooks/use-locale.ts`** — 언어 전환, localStorage 저장
6. **`hooks/use-theme.ts`** — 테마 토글, 시스템 설정 감지

### P3 (선택 — 브라우저 의존)
7. **`lib/local-writer.ts`** — File System Access API 모킹 필요
8. **`hooks/use-local-setup.ts`** — 복합 의존성
9. **`hooks/use-zip-download.ts`** — zip-builder 래퍼

## 예상 커버리지 (P1 추가 후)
- lib/: ~75% → **85%+**
- hooks/: ~16% → **60%+**
- 전체: ~28% → **약 65-70%**

P2까지 추가하면 **80%+ 달성 가능**.
