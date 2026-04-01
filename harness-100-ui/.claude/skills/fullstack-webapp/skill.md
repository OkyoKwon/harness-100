---
name: fullstack-webapp
description: "'웹앱 만들어줘', '웹 서비스 개발', 'SaaS 개발', 'CRUD 앱', '대시보드 만들어줘', '관리자 페이지', '회원가입/로그인 기능', 'REST API 개발', '풀스택 프로젝트', 'Next.js 앱'"
---

# fullstack-webapp

## 에이전트 구성

| 에이전트 | 파일 | 역할 | 타입 |
|---------|------|------|------|
| architect | `.claude/agents/architect.md` | 시스템 아키텍트 | general-purpose |
| backend-dev | `.claude/agents/backend-dev.md` | 백엔드 개발자 | general-purpose |
| devops-engineer | `.claude/agents/devops-engineer.md` | DevOps 엔지니어 | general-purpose |
| frontend-dev | `.claude/agents/frontend-dev.md` | 프론트엔드 개발자 | general-purpose |
| qa-engineer | `.claude/agents/qa-engineer.md` | QA 엔지니어 | general-purpose |

## 워크플로우

| 순서 | 담당 | 의존 |
|------|------|------|
| 1 | architect | 없음 |
| 2a | frontend-dev | architect |
| 3a | backend-dev | architect |
| 4a | devops-engineer | architect |
| 5 | qa-engineer | frontend-dev, backend-dev |

## 작업 규모별 모드

| 사용자 요청 패턴 | 실행 모드 | 투입 에이전트 |
|----------------|----------|-------------|
| "웹앱 만들어줘, 풀스택 개발" | **풀 파이프라인** | architect, backend-dev, devops-engineer, frontend-dev, qa-engineer |
| "API만 만들어줘" | **백엔드 모드** | architect, backend-dev, qa-engineer |
| "프론트엔드만 만들어줘 (API 있음)" | **프론트 모드** | architect, frontend-dev, qa-engineer |
| "이 코드 리팩토링해줘" | **리팩토링 모드** | architect, qa-engineer |
| "배포 설정만 해줘" | **DevOps 모드** | devops-engineer |

