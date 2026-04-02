# Test Strategy: harness-100-ui

> Generated: 2026-04-02
> Status: Ready for implementation by unit-tester and integration-tester agents

---

## 1. Test Framework & Tooling

### Recommended Stack

| Tool | Purpose | Rationale |
|------|---------|-----------|
| **Vitest 3.x** | Unit & integration test runner | Native ESM, Vite-based (aligns with Next.js), fast HMR, built-in coverage |
| **@testing-library/react** | Component testing | React 19 support, DOM-centric assertions |
| **@testing-library/user-event** | User interaction simulation | Realistic event firing for hooks/components |
| **jsdom** | DOM environment | Required by Vitest for browser API mocks |
| **@vitest/coverage-v8** | Coverage reporting | V8-based, accurate for TypeScript |
| **msw 2.x** | Network mocking | Intercepts fetch for harness-loader tests without coupling to implementation |

### Installation Command

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom msw
```

### Configuration: `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/lib/**", "src/hooks/**"],
      exclude: [
        "src/lib/types.ts",
        "src/lib/locale.ts",
        "src/**/*.d.ts",
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Setup File: `src/__tests__/setup.ts`

```ts
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 2. Test File Organization

```
src/
  __tests__/
    setup.ts                          # Global test setup
    mocks/
      harness-fixtures.ts             # Shared Harness/Agent/HarnessMeta factories
      local-storage.ts                # localStorage mock helper
      msw-handlers.ts                 # MSW request handlers for fetch mocking
  lib/
    __tests__/
      validation.test.ts              # P0
      merge-harnesses.test.ts         # P0
      harness-loader.test.ts          # P0
      cli.test.ts                     # P0
      zip-builder.test.ts             # P1
      translations.test.ts            # P2
      constants.test.ts               # P2
  hooks/
    __tests__/
      use-favorites.test.ts           # P0
      use-search.test.ts              # P1
      use-modifications.test.ts       # P1
      use-composer.test.ts            # P1
      use-locale.test.ts              # P2
```

Convention: `__tests__/` directories colocated with the module they test. Each test file mirrors the source file name with `.test.ts` suffix.

---

## 3. Test Pyramid & Ratios

```
        /  E2E  \          5%  (~2-3 smoke tests via Playwright, deferred)
       /----------\
      / Integration \      25% (~15-20 tests: hooks, loader+fetch, zip+jszip)
     /----------------\
    /    Unit Tests     \  70% (~50-60 tests: validation, merge, cli, translations)
   /--------------------\
```

- **Unit tests** (70%): Pure functions in `lib/` -- no side effects, no mocking needed in most cases
- **Integration tests** (25%): Hooks with localStorage/fetch, zip-builder with JSZip, harness-loader with network
- **E2E tests** (5%): Deferred to a later phase; not part of this initial strategy. When needed, use Playwright for critical flows (browse catalog -> view detail -> download ZIP)

---

## 4. Priority-Ordered Test Targets

### P0 -- Critical Business Logic (Must-have, implement first)

| Module | File | Risk | Test Count (est.) | Justification |
|--------|------|------|-------------------|---------------|
| validation | `lib/validation.ts` | HIGH | 15-20 | Input boundary of the system. Slug validation gates CLI commands, path validation gates ZIP file creation, favorites parsing handles untrusted user input. A bug here propagates everywhere. |
| merge-harnesses | `lib/merge-harnesses.ts` | HIGH | 10-12 | Core business logic for the Composer feature. ID prefix collision, dependency remapping, edge cases (empty array, single harness). Data corruption risk. |
| harness-loader | `lib/harness-loader.ts` | HIGH | 8-10 | Data layer with LRU cache. Cache eviction logic, fetch error handling, locale routing. Silent cache bugs cause stale data. |
| cli | `lib/cli.ts` | MEDIUM | 3-4 | Small but validates slug before generating command. Must not produce invalid CLI output. |
| use-favorites | `hooks/use-favorites.ts` | HIGH | 8-10 | Primary user-facing state. localStorage persistence, URL parameter hydration, toggle idempotency. Data loss risk on parse failure. |

### P1 -- Important Features (Implement second)

| Module | File | Risk | Test Count (est.) | Justification |
|--------|------|------|-------------------|---------------|
| zip-builder | `lib/zip-builder.ts` | MEDIUM | 8-10 | Generates downloadable artifacts. applyModifications logic, path validation, folder structure correctness. Output correctness is user-visible. |
| use-search | `hooks/use-search.ts` | MEDIUM | 5-6 | Fuzzy search via Fuse.js. Threshold behavior, empty query, Korean/English search. Affects discoverability. |
| use-modifications | `hooks/use-modifications.ts` | MEDIUM | 6-8 | Customizer state management. Toggle enable/disable, field update immutability, reset behavior. |
| use-composer | `hooks/use-composer.ts` | MEDIUM | 5-7 | Orchestrates load + merge. Race condition handling (cancelled flag), dedup on add. |

### P2 -- Supporting Modules (Implement if time permits)

| Module | File | Risk | Test Count (est.) | Justification |
|--------|------|------|-------------------|---------------|
| translations | `lib/translations.ts` | LOW | 5-6 | Parameter interpolation, missing key fallback, locale fallback. Low risk but easy to test. |
| constants | `lib/constants.ts` | LOW | 3-4 | Category ranges, STORAGE_KEYS completeness. Structural assertions. |
| use-locale | `hooks/use-locale.ts` | LOW | 4-5 | Context provider, localStorage persistence. Low risk, well-isolated. |
| local-writer | `lib/local-writer.ts` | LOW | 2-3 | File System Access API -- hard to test without browser. Smoke test `isFileSystemAccessSupported()` only. |

---

## 5. Mocking Strategy

### 5.1 localStorage

```ts
// src/__tests__/mocks/local-storage.ts
export function createMockLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}
```

Usage: `vi.stubGlobal("localStorage", createMockLocalStorage())` in `beforeEach`.

### 5.2 fetch (for harness-loader)

Use **MSW** (Mock Service Worker) for realistic network mocking:

```ts
// src/__tests__/mocks/msw-handlers.ts
import { http, HttpResponse } from "msw";
import { catalogFixture, harnessDetailFixture } from "./harness-fixtures";

export const handlers = [
  http.get("*/data/:locale/harnesses.json", ({ params }) => {
    return HttpResponse.json(catalogFixture(params.locale as string));
  }),
  http.get("*/data/:locale/harness/:id.json", ({ params }) => {
    return HttpResponse.json(harnessDetailFixture(Number(params.id)));
  }),
];
```

For simpler unit tests, `vi.fn()` on global fetch is acceptable:

```ts
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(mockData),
}));
```

### 5.3 JSZip (for zip-builder)

Do NOT mock JSZip. Instead, use the real library and assert on the generated ZIP content:

```ts
const blob = await buildZip(mockHarness);
const zip = await JSZip.loadAsync(blob);
const files = Object.keys(zip.files);
expect(files).toContain(".claude/CLAUDE.md");
expect(files).toContain(".claude/agents/my-agent.md");
```

This gives higher confidence than mocking internal calls.

### 5.4 File System Access API (for local-writer)

Mock `window.showDirectoryPicker` and `FileSystemDirectoryHandle`:

```ts
const mockWritable = { write: vi.fn(), close: vi.fn() };
const mockFileHandle = { createWritable: vi.fn().mockResolvedValue(mockWritable) };
const mockDirHandle = {
  name: "my-project",
  getFileHandle: vi.fn().mockResolvedValue(mockFileHandle),
  getDirectoryHandle: vi.fn().mockImplementation(async () => mockDirHandle),
};
vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(mockDirHandle));
```

Since this API is hard to fully mock, prioritize testing `isFileSystemAccessSupported()` and `applyModifications()` (which is exported from zip-builder and reused).

### 5.5 React Hooks (renderHook)

Use `@testing-library/react` `renderHook`:

```ts
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/use-favorites";

test("toggle adds and removes favorite", () => {
  const { result } = renderHook(() => useFavorites());
  act(() => { result.current.toggle(42); });
  expect(result.current.isFavorite(42)).toBe(true);
  act(() => { result.current.toggle(42); });
  expect(result.current.isFavorite(42)).toBe(false);
});
```

### 5.6 Fuse.js (for use-search)

Do NOT mock Fuse.js. Supply real `HarnessMeta[]` fixtures and assert on filtered results. Mocking the search engine defeats the purpose of the test.

---

## 6. Test Fixture Factories

All fixtures live in `src/__tests__/mocks/harness-fixtures.ts`.

```ts
import type { Agent, Harness, HarnessMeta, Skill, ExecutionStep } from "@/lib/types";

let idCounter = 1;

export function createAgent(overrides?: Partial<Agent>): Agent {
  const id = `agent-${idCounter++}`;
  return {
    id,
    name: `Agent ${id}`,
    role: "Test role",
    description: "Test description",
    tools: ["Read", "Write"],
    outputTemplate: "# Output",
    dependencies: [],
    ...overrides,
  };
}

export function createHarness(overrides?: Partial<Harness>): Harness {
  const agents = overrides?.agents ?? [createAgent(), createAgent()];
  return {
    id: overrides?.id ?? idCounter++,
    slug: overrides?.slug ?? "test-harness",
    name: overrides?.name ?? "Test Harness",
    description: "A test harness",
    category: "development",
    agents,
    skill: createSkill(agents),
    frameworks: ["vitest"],
    agentCount: agents.length,
    popularityRank: 0,
    ...overrides,
  };
}

export function createHarnessMeta(overrides?: Partial<HarnessMeta>): HarnessMeta {
  return {
    id: overrides?.id ?? idCounter++,
    slug: "test-harness",
    name: "Test Harness",
    description: "A test harness",
    category: "development",
    agentCount: 3,
    frameworks: ["vitest"],
    popularityRank: 0,
    ...overrides,
  };
}

// createSkill, createExecutionStep helpers similarly...
```

---

## 7. Coverage Goals Per Module

| Module | Statements | Branches | Functions | Lines | Notes |
|--------|-----------|----------|-----------|-------|-------|
| `lib/validation.ts` | 100% | 100% | 100% | 100% | Pure functions, full coverage trivial |
| `lib/merge-harnesses.ts` | 95%+ | 90%+ | 100% | 95%+ | Edge cases for empty/single arrays |
| `lib/harness-loader.ts` | 90%+ | 85%+ | 100% | 90%+ | Cache hit/miss/eviction paths |
| `lib/cli.ts` | 100% | 100% | 100% | 100% | 1 function, straightforward |
| `lib/zip-builder.ts` | 85%+ | 80%+ | 100% | 85%+ | Complex branching with rawFiles |
| `lib/translations.ts` | 90%+ | 85%+ | 100% | 90%+ | Interpolation edge cases |
| `hooks/use-favorites.ts` | 85%+ | 80%+ | 100% | 85%+ | localStorage error paths |
| `hooks/use-search.ts` | 90%+ | 85%+ | 100% | 90%+ | Empty query, non-matching query |
| `hooks/use-modifications.ts` | 90%+ | 85%+ | 100% | 90%+ | Toggle/update/reset |
| `hooks/use-composer.ts` | 80%+ | 75%+ | 100% | 80%+ | Async loading, cancellation |
| **Global** | **80%+** | **80%+** | **80%+** | **80%+** | |

---

## 8. Detailed Test Scenarios

### 8.1 validation.ts

| # | Scenario | Input | Expected | Type |
|---|----------|-------|----------|------|
| 1 | Valid simple slug | `"hello"` | `true` | Unit |
| 2 | Valid hyphenated slug | `"my-harness"` | `true` | Unit |
| 3 | Invalid uppercase slug | `"Hello"` | `false` | Unit |
| 4 | Invalid leading hyphen | `"-bad"` | `false` | Unit |
| 5 | Invalid trailing hyphen | `"bad-"` | `false` | Unit |
| 6 | Invalid consecutive hyphens | `"a--b"` | `false` | Unit |
| 7 | Empty string slug | `""` | `false` | Unit |
| 8 | assertValidSlug throws | `"INVALID"` | throws Error | Unit |
| 9 | assertValidSlug passes | `"valid-slug"` | no throw | Unit |
| 10 | Valid path | `"agents/foo.md"` | `true` | Unit |
| 11 | Path traversal blocked | `"../etc/passwd"` | `false` | Unit |
| 12 | Absolute path blocked | `"/root/file"` | `false` | Unit |
| 13 | Windows special chars blocked | `"file<name"` | `false` | Unit |
| 14 | parseFavoriteIds normal | `"1,5,100"` | `[1, 5, 100]` | Unit |
| 15 | parseFavoriteIds filters invalid | `"0,1000,abc,5"` | `[5]` | Unit |
| 16 | parseFavoriteIds empty string | `""` | `[]` | Unit |
| 17 | parseStoredFavorites valid JSON | `"[1,2,3]"` | `[1,2,3]` | Unit |
| 18 | parseStoredFavorites invalid JSON | `"not json"` | `[]` | Unit |
| 19 | parseStoredFavorites non-array | `"42"` | `[]` | Unit |
| 20 | parseStoredFavorites filters bad | `"[1,\"a\",1.5,0]"` | `[1]` | Unit |
| 21 | isAllowedModificationField valid | `"name"` | `true` | Unit |
| 22 | isAllowedModificationField invalid | `"password"` | `false` | Unit |

### 8.2 merge-harnesses.ts

| # | Scenario | Input | Expected | Type |
|---|----------|-------|----------|------|
| 1 | Empty array throws | `[]` | throws Error | Unit |
| 2 | Single harness returns same | `[h1]` | `h1` (identity) | Unit |
| 3 | Two harnesses merge agents | `[h1, h2]` | agents prefixed `h0_`, `h1_` | Unit |
| 4 | Dependencies remapped | agents with deps | deps prefixed correctly | Unit |
| 5 | Execution steps remapped | 2 harnesses | agentId and dependsOn prefixed | Unit |
| 6 | Frameworks deduplicated | overlapping frameworks | unique set | Unit |
| 7 | Modes prefixed with harness name | 2 harnesses | mode names include `[name]` | Unit |
| 8 | Merged skill has "full pipeline" mode | 2 harnesses | first mode contains all agent IDs | Unit |
| 9 | Three harnesses merge | `[h1, h2, h3]` | h0_, h1_, h2_ prefixes | Unit |
| 10 | Result metadata correct | 2 harnesses | slug="merged-harness", id=0 | Unit |

### 8.3 harness-loader.ts

| # | Scenario | Input | Expected | Type |
|---|----------|-------|----------|------|
| 1 | loadCatalog fetches on miss | first call | fetch called, data returned | Integration |
| 2 | loadCatalog returns cache on hit | second call | fetch NOT called again | Integration |
| 3 | loadCatalog per locale | ko then en | separate fetch calls | Integration |
| 4 | loadCatalog fetch error | 500 response | throws Error with status | Integration |
| 5 | loadHarnessDetail fetches on miss | first call | fetch called with padded ID | Integration |
| 6 | loadHarnessDetail cache hit | second call | fetch NOT called again | Integration |
| 7 | LRU eviction at MAX_DETAIL_CACHE | 21 different IDs | first entry evicted | Integration |
| 8 | clearCache resets all | after cache, call clear | next call fetches again | Integration |

### 8.4 zip-builder.ts (applyModifications + buildZip)

| # | Scenario | Input | Expected | Type |
|---|----------|-------|----------|------|
| 1 | applyModifications no mods | agents, undefined | agents unchanged | Unit |
| 2 | applyModifications name change | mod field=name | agent name updated | Unit |
| 3 | applyModifications disable agent | mod field=enabled, value=false | agent removed | Unit |
| 4 | applyModifications invalid field | mod field=password | ignored | Unit |
| 5 | applyModifications boolean value on non-enabled | mod field=name, value=true | ignored (not string) | Unit |
| 6 | buildZip basic structure | simple harness | .claude/CLAUDE.md, agents/, skills/ | Integration |
| 7 | buildZip with rawFiles | harness with rawFiles | uses raw content | Integration |
| 8 | buildZip with modifications | harness + mods | modified agent content | Integration |
| 9 | buildZip path traversal blocked | rawFiles with `../` path | file skipped | Integration |

### 8.5 use-favorites hook

| # | Scenario | Input | Expected | Type |
|---|----------|-------|----------|------|
| 1 | Initial state empty | no storage | favorites = [] | Integration |
| 2 | Hydrate from localStorage | stored `[1,2,3]` | favorites = [1,2,3] | Integration |
| 3 | Hydrate from URL params | `?favorites=1,5,10` | favorites = [1,5,10] | Integration |
| 4 | URL params take precedence | both URL and storage | uses URL values | Integration |
| 5 | Toggle adds favorite | toggle(42) | isFavorite(42) = true | Integration |
| 6 | Toggle removes favorite | toggle(42) twice | isFavorite(42) = false | Integration |
| 7 | Toggle persists to localStorage | toggle(1) | localStorage updated | Integration |
| 8 | shareUrl generated | favorites=[1,2] | URL with ?favorites=1,2 | Integration |
| 9 | shareUrl empty when no favorites | favorites=[] | empty string | Integration |
| 10 | localStorage unavailable | throws on getItem | graceful fallback | Integration |

---

## 9. CI Pipeline Design (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: harness-100-ui

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: harness-100-ui/pnpm-lock.yaml

      - run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm exec tsc --noEmit

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: harness-100-ui/coverage/
          retention-days: 7

      - name: Check coverage thresholds
        run: |
          # Vitest will exit non-zero if thresholds are not met
          # (configured in vitest.config.ts)
          echo "Coverage thresholds enforced by Vitest config"
```

### CI Enforcement Rules

- Coverage thresholds are enforced in `vitest.config.ts` (not just CI) so they fail locally too
- Type checking runs before tests to catch compilation errors early
- Coverage report is uploaded as artifact for PR review
- Tests must pass on both `push` to main and PRs

---

## 10. Implementation Order for Agents

### Phase 1: Foundation (unit-tester)

1. Set up Vitest configuration, setup file, and fixture factories
2. Write all P0 unit tests:
   - `validation.test.ts` (22 tests)
   - `merge-harnesses.test.ts` (10 tests)
   - `cli.test.ts` (4 tests)
3. Verify 100% coverage on `validation.ts` and `cli.ts`

### Phase 2: Integration (integration-tester)

1. Set up MSW handlers and localStorage mocks
2. Write P0 integration tests:
   - `harness-loader.test.ts` (8 tests)
   - `use-favorites.test.ts` (10 tests)
3. Write P1 tests:
   - `zip-builder.test.ts` (9 tests)
   - `use-search.test.ts` (6 tests)
   - `use-modifications.test.ts` (8 tests)
   - `use-composer.test.ts` (7 tests)

### Phase 3: Polish (if time allows)

1. P2 tests: `translations.test.ts`, `constants.test.ts`, `use-locale.test.ts`
2. Verify global 80%+ coverage
3. Add CI workflow

---

## 11. Code Review Checklist for Tests

- [ ] Each test has a descriptive name that reads as a specification
- [ ] No test depends on execution order of other tests
- [ ] Mocks are reset in `beforeEach` / `afterEach`
- [ ] No hardcoded magic numbers -- use fixtures and constants
- [ ] Assertions are specific (not just `toBeTruthy()`)
- [ ] Edge cases covered: empty input, boundary values, error paths
- [ ] No mutation of shared fixtures between tests
- [ ] Async tests properly await and handle rejections
- [ ] Hook tests use `renderHook` + `act` correctly
- [ ] Coverage report reviewed for untested branches

---

## 12. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module-level `let` variables in harness-loader (cache state) | Tests leak state between runs | Call `clearCache()` in `beforeEach` |
| `window.location` access in use-favorites | jsdom limitations | Use `vi.stubGlobal` or configure jsdom URL |
| JSZip async operations | Flaky tests if not awaited | Always `await` and use real JSZip (no mock) |
| React 19 + testing-library compatibility | Potential version mismatches | Pin `@testing-library/react@16+` which supports React 19 |
| `"use client"` directive in hooks | Vitest may not understand directive | Safe to ignore -- Vitest treats it as a comment |
| Fuse.js search threshold sensitivity | Brittle assertions on search results | Assert on inclusion/exclusion, not exact ordering |
