# Contributing to Harness 100

Thank you for your interest in contributing! This guide will help you get started.

[English](#english) | [한국어](#한국어)

---

## English

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold a welcoming, inclusive, and respectful environment.

### How to Contribute

#### Reporting Bugs

1. Search [existing issues](https://github.com/OkyoKwon/harness-100/issues) to avoid duplicates.
2. Open a new issue using the **Bug Report** template.
3. Include:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser / OS / Node.js version
   - Screenshots if applicable

#### Requesting Features

1. Search existing issues for similar requests.
2. Open a new issue using the **Feature Request** template.
3. Describe the use case and expected behavior.

#### Submitting Code

Follow the **fork and pull request** workflow:

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/harness-100.git
cd harness-100

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes, commit, and push
git add <files>
git commit -m "feat: add your feature description"
git push origin feat/your-feature-name

# 4. Open a Pull Request on GitHub
```

### Development Setup

#### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| pnpm | 10+ |
| Git | 2.30+ |

#### Installation

```bash
git clone https://github.com/OkyoKwon/harness-100.git
cd harness-100
pnpm install
```

#### Running the Project

```bash
pnpm dev              # Development server at http://localhost:3000
pnpm build            # Static build (output: out/)
pnpm test             # Run tests
pnpm test:coverage    # Tests with coverage report
pnpm storybook        # Storybook at http://localhost:6006
pnpm seed             # Fetch harness data from GitHub
```

### Code Style

#### TypeScript

- Use strict TypeScript throughout. No `any` types without justification.
- Prefer `const` over `let`. Never use `var`.
- Use immutable patterns: create new objects instead of mutating existing ones.

#### React & Next.js

- Use functional components with hooks.
- Prefer Server Components (default in App Router). Use `"use client"` only when necessary.
- Keep components small and focused (< 200 lines).

#### Styling

- Use Tailwind CSS utility classes. Avoid custom CSS unless absolutely necessary.
- Follow the existing design token system in `_workspace/01_design_tokens/`.

#### File Organization

- One component per file.
- Co-locate tests next to source files or in `src/test/`.
- Keep files under 400 lines. Extract utilities when files grow large.

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

<optional body>
```

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependency updates |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration |

Examples:
```
feat: add dark mode toggle to header
fix: correct search results not updating on filter change
docs: update contributing guide with storybook instructions
```

### DCO Sign-Off

This project uses the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). All commits must be signed off to certify that you have the right to submit the code under the project's license.

Add `-s` to your commit command:

```bash
git commit -s -m "feat: add your feature description"
```

This adds a `Signed-off-by` line to your commit message. The CI will check for this automatically.

### Pull Request Process

1. **Branch naming**: `feat/`, `fix/`, `refactor/`, `docs/` prefix matching commit type.
2. **Before submitting**:
   - Run `pnpm test` and ensure all tests pass.
   - Run `pnpm build` and verify no build errors.
   - Add tests for new features (target: 80%+ coverage).
   - Ensure all commits are signed off (`git commit -s`).
3. **PR description**: Explain what changed and why. Include screenshots for UI changes.
4. **Review**: A maintainer will review your PR. Address feedback promptly.
5. **Merge**: PRs are squash-merged into `main`.

### Testing

- Write tests for all new features and bug fixes.
- Use Vitest + Testing Library for component tests.
- Use MSW for mocking API calls.
- Target 80%+ code coverage.

```bash
pnpm test             # Run all tests
pnpm test:coverage    # Check coverage
```

---

## 한국어

### 행동 강령

이 프로젝트는 [기여자 행동 강령](CODE_OF_CONDUCT.md)을 따릅니다. 참여 시 환영적이고, 포용적이며, 존중하는 환경을 유지해주세요.

### 기여 방법

#### 버그 신고

1. [기존 이슈](https://github.com/OkyoKwon/harness-100/issues)에서 중복 여부를 확인하세요.
2. **Bug Report** 템플릿으로 새 이슈를 열어주세요.
3. 재현 단계, 예상/실제 동작, 환경 정보, 스크린샷을 포함해주세요.

#### 기능 요청

1. 기존 이슈에서 유사한 요청이 있는지 확인하세요.
2. **Feature Request** 템플릿으로 새 이슈를 열어주세요.
3. 사용 사례와 기대 동작을 설명해주세요.

#### 코드 기여

**Fork & Pull Request** 워크플로우를 따릅니다:

```bash
# 1. GitHub에서 Fork 후 클론
git clone https://github.com/<your-username>/harness-100.git
cd harness-100

# 2. 기능 브랜치 생성
git checkout -b feat/기능-설명

# 3. 변경 후 커밋 & 푸시
git add <files>
git commit -m "feat: 기능 설명"
git push origin feat/기능-설명

# 4. GitHub에서 Pull Request 생성
```

### 개발 환경 설정

#### 필수 도구

| 도구 | 버전 |
|------|------|
| Node.js | 22+ |
| pnpm | 10+ |
| Git | 2.30+ |

#### 설치

```bash
git clone https://github.com/OkyoKwon/harness-100.git
cd harness-100
pnpm install
```

#### 실행

```bash
pnpm dev              # 개발 서버 (http://localhost:3000)
pnpm build            # 정적 빌드 (출력: out/)
pnpm test             # 테스트 실행
pnpm test:coverage    # 커버리지 포함 테스트
pnpm storybook        # 스토리북 (http://localhost:6006)
pnpm seed             # GitHub에서 하네스 데이터 가져오기
```

### 코드 스타일

- **TypeScript**: 엄격한 타입 사용. `any` 지양. `const` 우선 사용.
- **불변성**: 기존 객체를 변경하지 않고 새 객체를 생성합니다.
- **React**: 함수형 컴포넌트 + 훅 사용. Server Component 기본.
- **스타일링**: Tailwind CSS 유틸리티 클래스 사용. 커스텀 CSS 최소화.
- **파일 구성**: 컴포넌트당 하나의 파일. 400줄 이하 유지.

### 커밋 메시지 형식

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

```
<type>: <설명>
```

타입: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### DCO Sign-Off

이 프로젝트는 [Developer Certificate of Origin (DCO)](https://developercertificate.org/)를 사용합니다. 모든 커밋에 sign-off가 필요합니다.

```bash
git commit -s -m "feat: 기능 설명"
```

CI에서 자동으로 DCO sign-off를 확인합니다.

### Pull Request 절차

1. 브랜치명: `feat/`, `fix/`, `refactor/`, `docs/` 접두사 사용.
2. 제출 전: `pnpm test` 통과, `pnpm build` 성공, 새 기능에 테스트 추가, 모든 커밋에 sign-off (`git commit -s`).
3. PR 설명: 변경 내용과 이유 설명. UI 변경 시 스크린샷 포함.
4. 리뷰 후 squash-merge로 `main`에 병합됩니다.

### 테스트

- 모든 새 기능과 버그 수정에 테스트를 작성하세요.
- Vitest + Testing Library 사용.
- 80% 이상 커버리지 목표.

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
