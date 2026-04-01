---
name: code-reviewer
description: "'코드 리뷰해줘', '이 코드 봐줘', '코드 검토', 'PR 리뷰', '코드 품질 분석', '보안 리뷰', '성능 리뷰', '아키텍처 리뷰', '코드 스타일 검사'"
---

# code-reviewer

## 에이전트 구성

| 에이전트 | 파일 | 역할 | 타입 |
|---------|------|------|------|
| architecture-reviewer | `.claude/agents/architecture-reviewer.md` | 아키텍처 리뷰어 | general-purpose |
| performance-analyst | `.claude/agents/performance-analyst.md` | 코드 성능 분석가 | general-purpose |
| review-synthesizer | `.claude/agents/review-synthesizer.md` | 코드 리뷰 종합자 | general-purpose |
| security-analyst | `.claude/agents/security-analyst.md` | 코드 보안 분석가 | general-purpose |
| style-inspector | `.claude/agents/style-inspector.md` | 코드 스타일 검사관 | general-purpose |

## 워크플로우

| 순서 | 담당 | 의존 |
|------|------|------|
| 1a | style-inspector | 없음 |
| 2a | security-analyst | 없음 |
| 3a | performance-analyst | 없음 |
| 4a | architecture-reviewer | 없음 |
| 5 | review-synthesizer | style-inspector, architecture-reviewer |

## 작업 규모별 모드

| 사용자 요청 패턴 | 실행 모드 | 투입 에이전트 |
|----------------|----------|-------------|
| "코드 리뷰해줘, 전체 리뷰" | **풀 리뷰** | architecture-reviewer, performance-analyst, review-synthesizer, security-analyst, style-inspector |
| "보안 리뷰만 해줘" | **보안 모드** | security-analyst, review-synthesizer |
| "성능 분석해줘" | **성능 모드** | performance-analyst, review-synthesizer |
| "아키텍처 리뷰해줘" | **아키텍처 모드** | architecture-reviewer, review-synthesizer |
| "코드 스타일만 봐줘" | **스타일 모드** | style-inspector, review-synthesizer |

