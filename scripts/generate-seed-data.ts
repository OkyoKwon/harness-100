import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Type definitions (inline, not imported - this runs outside Next.js)
// ---------------------------------------------------------------------------

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  outputTemplate: string;
  dependencies: string[];
}

interface ExecutionStep {
  agentId: string;
  parallel: boolean;
  dependsOn: string[];
}

interface Skill {
  id: string;
  name: string;
  triggerConditions: string[];
  executionOrder: ExecutionStep[];
  modes: {
    full: ExecutionStep[];
    reduced: ExecutionStep[];
    single: ExecutionStep[];
  };
}

interface Harness {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  agents: Agent[];
  skill: Skill;
  frameworks: string[];
  agentCount: number;
  popularityRank: number;
}

interface HarnessMeta {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  agentCount: number;
  frameworks: string[];
  popularityRank: number;
}

// ---------------------------------------------------------------------------
// Raw harness definitions
// ---------------------------------------------------------------------------

interface RawHarness {
  id: number;
  slug: string;
  name: string;
  description: string;
  agentCount: number;
  category: string;
}

const RAW_HARNESSES: readonly RawHarness[] = [
  // Content (01-15)
  { id: 1, slug: "youtube-production", name: "YouTube Production", description: "영상 기획부터 썸네일, SEO까지 전 단계", agentCount: 5, category: "content" },
  { id: 2, slug: "podcast-studio", name: "Podcast Studio", description: "팟캐스트 기획, 리서치, 대본, 쇼노트", agentCount: 5, category: "content" },
  { id: 3, slug: "newsletter-engine", name: "Newsletter Engine", description: "뉴스레터 큐레이션, 작성, A/B 변형", agentCount: 5, category: "content" },
  { id: 4, slug: "content-repurposer", name: "Content Repurposer", description: "원본 콘텐츠를 다중 포맷으로 변환", agentCount: 5, category: "content" },
  { id: 5, slug: "game-narrative", name: "Game Narrative", description: "게임 스토리, 퀘스트, 대사, 분기 시나리오", agentCount: 5, category: "content" },
  { id: 6, slug: "brand-identity", name: "Brand Identity", description: "네이밍, 슬로건, 톤앤매너, 가이드라인", agentCount: 5, category: "content" },
  { id: 7, slug: "comic-creator", name: "Comic Creator", description: "4컷/장편 만화: 콘티부터 편집까지", agentCount: 5, category: "content" },
  { id: 8, slug: "course-builder", name: "Course Builder", description: "온라인 강의: 커리큘럼, 교안, 퀴즈", agentCount: 5, category: "content" },
  { id: 9, slug: "documentary-research", name: "Documentary Research", description: "다큐멘터리 리서치, 구성안, 내레이션", agentCount: 5, category: "content" },
  { id: 10, slug: "social-media-manager", name: "Social Media Manager", description: "SNS 콘텐츠 달력, 포스트, 분석", agentCount: 5, category: "content" },
  { id: 11, slug: "book-publishing", name: "Book Publishing", description: "전자책: 원고편집, 표지, 배포", agentCount: 5, category: "content" },
  { id: 12, slug: "advertising-campaign", name: "Advertising Campaign", description: "광고 캠페인: 타깃 설정~미디어 플랜", agentCount: 5, category: "content" },
  { id: 13, slug: "presentation-designer", name: "Presentation Designer", description: "스토리보드, 슬라이드, 발표 노트", agentCount: 5, category: "content" },
  { id: 14, slug: "translation-localization", name: "Translation & Localization", description: "다국어 번역, 현지화, 용어 관리", agentCount: 5, category: "content" },
  { id: 15, slug: "visual-storytelling", name: "Visual Storytelling", description: "AI 이미지 + HTML 비주얼 스토리텔링", agentCount: 5, category: "content" },

  // Development (16-30)
  { id: 16, slug: "fullstack-webapp", name: "Fullstack Web App", description: "설계, 프론트엔드, 백엔드, 테스트, 배포", agentCount: 5, category: "development" },
  { id: 17, slug: "mobile-app-builder", name: "Mobile App Builder", description: "UI/UX, 코드, API, 스토어 배포", agentCount: 5, category: "development" },
  { id: 18, slug: "api-designer", name: "API Designer", description: "REST/GraphQL 설계, 문서화, 테스트", agentCount: 5, category: "development" },
  { id: 19, slug: "database-architect", name: "Database Architect", description: "모델링, 마이그레이션, 인덱싱, 최적화", agentCount: 5, category: "development" },
  { id: 20, slug: "cicd-pipeline", name: "CI/CD Pipeline", description: "파이프라인 설계, 구축, 최적화", agentCount: 5, category: "development" },
  { id: 21, slug: "code-reviewer", name: "Code Reviewer", description: "스타일, 보안, 성능, 아키텍처 리뷰", agentCount: 5, category: "development" },
  { id: 22, slug: "legacy-modernizer", name: "Legacy Modernizer", description: "분석, 리팩토링, 마이그레이션", agentCount: 5, category: "development" },
  { id: 23, slug: "microservice-designer", name: "Microservice Designer", description: "아키텍처 설계, 분해, 통신", agentCount: 5, category: "development" },
  { id: 24, slug: "test-automation", name: "Test Automation", description: "전략, 작성, CI, 커버리지", agentCount: 5, category: "development" },
  { id: 25, slug: "incident-postmortem", name: "Incident Postmortem", description: "타임라인, 근본원인, 재발방지", agentCount: 5, category: "development" },
  { id: 26, slug: "infra-as-code", name: "Infrastructure as Code", description: "Terraform/Pulumi, 보안, 비용 최적화", agentCount: 5, category: "development" },
  { id: 27, slug: "data-pipeline", name: "Data Pipeline", description: "ETL, 품질 검증, 모니터링", agentCount: 5, category: "development" },
  { id: 28, slug: "security-audit", name: "Security Audit", description: "취약점, 코드 분석, 침투 테스트", agentCount: 5, category: "development" },
  { id: 29, slug: "performance-optimizer", name: "Performance Optimizer", description: "프로파일링, 병목 분석, 벤치마크", agentCount: 5, category: "development" },
  { id: 30, slug: "open-source-launcher", name: "Open Source Launcher", description: "코드 정리, 문서, 라이선스, 커뮤니티", agentCount: 5, category: "development" },

  // Data/AI (31-42)
  { id: 31, slug: "ml-experiment", name: "ML Experiment", description: "데이터 준비, 모델 학습, 평가, 배포", agentCount: 5, category: "data-ai" },
  { id: 32, slug: "data-analysis", name: "Data Analysis", description: "탐색, 정제, 분석, 시각화, 보고서", agentCount: 5, category: "data-ai" },
  { id: 33, slug: "text-processor", name: "Text Processor", description: "요약, 분류, 정보 추출, 감성 분석", agentCount: 5, category: "data-ai" },
  { id: 34, slug: "data-migration", name: "Data Migration", description: "스키마 매핑, 변환, 검증", agentCount: 5, category: "data-ai" },
  { id: 35, slug: "api-client-generator", name: "API Client Generator", description: "API 클라이언트 SDK 자동 생성", agentCount: 5, category: "data-ai" },
  { id: 36, slug: "design-system", name: "Design System", description: "UI 토큰, 컴포넌트, 스토리북", agentCount: 5, category: "data-ai" },
  { id: 37, slug: "web-scraper", name: "Web Scraper", description: "크롤러, 파서, 저장, 모니터링", agentCount: 5, category: "data-ai" },
  { id: 38, slug: "chatbot-builder", name: "Chatbot Builder", description: "대화 설계, NLU, 통합, 테스트", agentCount: 5, category: "data-ai" },
  { id: 39, slug: "changelog-generator", name: "Changelog Generator", description: "git 분석, 릴리스 노트, 마이그레이션 가이드", agentCount: 5, category: "data-ai" },
  { id: 40, slug: "cli-tool-builder", name: "CLI Tool Builder", description: "명령 설계, 코드, 테스트, 문서, 배포", agentCount: 5, category: "data-ai" },
  { id: 41, slug: "llm-app-builder", name: "LLM App Builder", description: "프롬프트, RAG, 평가, 최적화, 배포", agentCount: 5, category: "data-ai" },
  { id: 42, slug: "bi-dashboard", name: "BI Dashboard", description: "KPI 설정, 시각화, 자동 보고", agentCount: 5, category: "data-ai" },

  // Business (43-55)
  { id: 43, slug: "startup-launcher", name: "Startup Launcher", description: "아이디어 검증, 비즈니스 모델, MVP, 피칭", agentCount: 5, category: "business" },
  { id: 44, slug: "market-research", name: "Market Research", description: "산업, 경쟁사, 소비자, 트렌드 분석", agentCount: 5, category: "business" },
  { id: 45, slug: "gov-funding-plan", name: "Gov Funding Plan", description: "정부 지원사업 사업 계획서 작성", agentCount: 5, category: "business" },
  { id: 46, slug: "product-manager", name: "Product Manager", description: "로드맵, PRD, 유저 스토리, 스프린트", agentCount: 5, category: "business" },
  { id: 47, slug: "strategy-framework", name: "Strategy Framework", description: "OKR, BSC, SWOT, 비전, 로드맵", agentCount: 5, category: "business" },
  { id: 48, slug: "sales-enablement", name: "Sales Enablement", description: "고객 분석, 제안서, 프레젠테이션, 팔로업", agentCount: 5, category: "business" },
  { id: 49, slug: "customer-support", name: "Customer Support", description: "FAQ, 응대 매뉴얼, 에스컬레이션", agentCount: 5, category: "business" },
  { id: 50, slug: "pricing-strategy", name: "Pricing Strategy", description: "원가, 경쟁 분석, 가치 기반, 시뮬레이션", agentCount: 5, category: "business" },
  { id: 51, slug: "investor-report", name: "Investor Report", description: "재무, KPI, 시장, 전략 보고서", agentCount: 5, category: "business" },
  { id: 52, slug: "scenario-planner", name: "Scenario Planner", description: "변수 분석, 영향 평가, 대응 전략", agentCount: 5, category: "business" },
  { id: 53, slug: "financial-modeler", name: "Financial Modeler", description: "수익, 비용, 시나리오, 밸류에이션", agentCount: 5, category: "business" },
  { id: 54, slug: "grant-writer", name: "Grant Writer", description: "공고 분석, 사업 계획, 예산", agentCount: 5, category: "business" },
  { id: 55, slug: "rfp-responder", name: "RFP Responder", description: "RFI/RFP 응답서 작성", agentCount: 5, category: "business" },

  // Education (56-65)
  { id: 56, slug: "language-tutor", name: "Language Tutor", description: "레벨 테스트, 커리큘럼, 레슨, 퀴즈", agentCount: 5, category: "education" },
  { id: 57, slug: "exam-prep", name: "Exam Prep", description: "출제 경향 분석, 약점 진단, 모의고사", agentCount: 5, category: "education" },
  { id: 58, slug: "thesis-advisor", name: "Thesis Advisor", description: "주제 선정, 문헌 검토, 방법론, 집필", agentCount: 5, category: "education" },
  { id: 59, slug: "coding-bootcamp", name: "Coding Bootcamp", description: "커리큘럼, 실습, 코드 리뷰, 포트폴리오", agentCount: 4, category: "education" },
  { id: 60, slug: "debate-simulator", name: "Debate Simulator", description: "찬반 입장, 교차 심문, 심판 보고서", agentCount: 5, category: "education" },
  { id: 61, slug: "competency-modeler", name: "Competency Modeler", description: "직무 분석, 역량 사전, 루브릭", agentCount: 4, category: "education" },
  { id: 62, slug: "adr-writer", name: "ADR Writer", description: "기술 컨텍스트, 대안 비교, 트레이드오프", agentCount: 5, category: "education" },
  { id: 63, slug: "research-assistant", name: "Research Assistant", description: "문헌 검색, 메모, 비평, 참고문헌", agentCount: 5, category: "education" },
  { id: 64, slug: "knowledge-base-builder", name: "Knowledge Base Builder", description: "수집, 분류, 마크다운 위키, 검색", agentCount: 5, category: "education" },
  { id: 65, slug: "personal-branding", name: "Personal Branding", description: "이력서, 포트폴리오, LinkedIn 최적화", agentCount: 5, category: "education" },

  // Legal (66-72)
  { id: 66, slug: "contract-analyzer", name: "Contract Analyzer", description: "계약서 분석, 작성, 검토, 위험 평가", agentCount: 5, category: "legal" },
  { id: 67, slug: "compliance-checker", name: "Compliance Checker", description: "법률 매핑, 갭 분석, 개선 계획", agentCount: 4, category: "legal" },
  { id: 68, slug: "patent-drafter", name: "Patent Drafter", description: "선행 기술 조사, 청구항, 명세서", agentCount: 5, category: "legal" },
  { id: 69, slug: "privacy-engineer", name: "Privacy Engineer", description: "GDPR/PIPA, PIA, 동의서", agentCount: 4, category: "legal" },
  { id: 70, slug: "legal-research", name: "Legal Research", description: "판례, 법리 분석, 의견서", agentCount: 4, category: "legal" },
  { id: 71, slug: "service-legal-docs", name: "Service Legal Docs", description: "약관, 처리방침, 쿠키, 환불 정책", agentCount: 4, category: "legal" },
  { id: 72, slug: "regulatory-filing", name: "Regulatory Filing", description: "요건 조사, 신청서, 첨부자료", agentCount: 4, category: "legal" },

  // Lifestyle (73-80)
  { id: 73, slug: "meal-planner", name: "Meal Planner", description: "영양 분석, 식단 설계, 레시피, 장보기", agentCount: 4, category: "lifestyle" },
  { id: 74, slug: "fitness-program", name: "Fitness Program", description: "프로그램 설계, 가이드, 식단 연계", agentCount: 4, category: "lifestyle" },
  { id: 75, slug: "tax-calculator", name: "Tax Calculator", description: "소득 분석, 공제 최적화, 절세 시뮬레이션", agentCount: 4, category: "lifestyle" },
  { id: 76, slug: "travel-planner", name: "Travel Planner", description: "목적지 선정, 일정, 예산, 현지 정보", agentCount: 4, category: "lifestyle" },
  { id: 77, slug: "space-concept-board", name: "Space Concept Board", description: "무드보드, 컬러, 가구, 예산", agentCount: 5, category: "lifestyle" },
  { id: 78, slug: "personal-finance", name: "Personal Finance", description: "수입/지출, 예산, 투자, 은퇴 설계", agentCount: 5, category: "lifestyle" },
  { id: 79, slug: "side-project-launcher", name: "Side Project Launcher", description: "아이디어, 기술 스택, MVP, 런칭", agentCount: 5, category: "lifestyle" },
  { id: 80, slug: "wedding-planner", name: "Wedding Planner", description: "타임라인, 예산, 업체 비교, 체크리스트", agentCount: 5, category: "lifestyle" },

  // Communication (81-88)
  { id: 81, slug: "technical-writer", name: "Technical Writer", description: "구조 설계, 집필, 다이어그램, 리뷰", agentCount: 5, category: "communication" },
  { id: 82, slug: "report-generator", name: "Report Generator", description: "데이터, 분석, 시각화, 집필", agentCount: 5, category: "communication" },
  { id: 83, slug: "sop-writer", name: "SOP Writer", description: "프로세스 분석, 절차서, 체크리스트", agentCount: 5, category: "communication" },
  { id: 84, slug: "meeting-strategist", name: "Meeting Strategist", description: "안건, 배경, 의사결정 프레임워크", agentCount: 5, category: "communication" },
  { id: 85, slug: "public-speaking", name: "Public Speaking", description: "연설문, 발표, 토론, Q&A", agentCount: 5, category: "communication" },
  { id: 86, slug: "proposal-writer", name: "Proposal Writer", description: "고객 분석, 솔루션, 가격, 차별화", agentCount: 5, category: "communication" },
  { id: 87, slug: "crisis-communication", name: "Crisis Communication", description: "상황 분석, 메시지, 보도자료", agentCount: 5, category: "communication" },
  { id: 88, slug: "risk-register", name: "Risk Register", description: "식별, 평가, 대응, 모니터링", agentCount: 5, category: "communication" },

  // Operations (89-95)
  { id: 89, slug: "event-organizer", name: "Event Organizer", description: "컨셉, 프로그램, 홍보, 실행, 평가", agentCount: 5, category: "operations" },
  { id: 90, slug: "hiring-pipeline", name: "Hiring Pipeline", description: "JD 작성, 소싱, 스크리닝, 면접, 오퍼", agentCount: 5, category: "operations" },
  { id: 91, slug: "onboarding-system", name: "Onboarding System", description: "체크리스트, 교육, 멘토, 30-60-90", agentCount: 5, category: "operations" },
  { id: 92, slug: "operations-manual", name: "Operations Manual", description: "분석, 플로차트, FAQ 자동 생성", agentCount: 5, category: "operations" },
  { id: 93, slug: "feedback-analyzer", name: "Feedback Analyzer", description: "감성 분석, 주제 분류, 인사이트", agentCount: 5, category: "operations" },
  { id: 94, slug: "audit-report", name: "Audit Report", description: "범위, 체크리스트, 발견사항, 권고", agentCount: 5, category: "operations" },
  { id: 95, slug: "procurement-docs", name: "Procurement Docs", description: "요구사항, 벤더 비교, 평가, 검수", agentCount: 5, category: "operations" },

  // Specialized (96-100)
  { id: 96, slug: "real-estate-analyst", name: "Real Estate Analyst", description: "시장, 입지, 수익성, 리스크, 투자 보고서", agentCount: 5, category: "specialized" },
  { id: 97, slug: "ecommerce-launcher", name: "E-commerce Launcher", description: "상품 기획, 상세 페이지, 가격, 마케팅", agentCount: 5, category: "specialized" },
  { id: 98, slug: "academic-paper", name: "Academic Paper", description: "연구 설계, 실험, 분석, 집필, 투고", agentCount: 5, category: "specialized" },
  { id: 99, slug: "sustainability-audit", name: "Sustainability Audit", description: "ESG: 환경, 사회, 거버넌스, 보고서", agentCount: 5, category: "specialized" },
  { id: 100, slug: "ip-portfolio", name: "IP Portfolio", description: "특허, 상표, 저작권, 라이선스 전략", agentCount: 5, category: "specialized" },
] as const;

// ---------------------------------------------------------------------------
// Frameworks by category
// ---------------------------------------------------------------------------

const FRAMEWORKS_BY_CATEGORY: Record<string, readonly string[]> = {
  content: ["AIDA", "SEO 키워드 매핑"],
  development: ["SOLID", "DDD", "OWASP Top 10", "DORA 메트릭"],
  "data-ai": ["Star/Snowflake 스키마", "SHAP/LIME"],
  business: ["BMC", "Porter's 5 Forces", "OKR"],
  education: ["Bloom's Taxonomy", "ADDIE", "CEFR"],
  legal: ["IRAC", "GDPR/PIPA"],
  lifestyle: [],
  communication: ["Diataxis", "MADR", "SemVer"],
  operations: ["SIPOC", "RACI", "SMART"],
  specialized: [],
};

// ---------------------------------------------------------------------------
// Agent role templates by category
// ---------------------------------------------------------------------------

interface AgentTemplate {
  name: string;
  role: string;
  tools: string[];
  outputPrefix: string;
}

const AGENT_TEMPLATES_BY_CATEGORY: Record<string, readonly AgentTemplate[]> = {
  content: [
    { name: "리서처", role: "콘텐츠 리서치 전문가", tools: ["WebSearch", "WebFetch", "Read"], outputPrefix: "## 리서치 결과" },
    { name: "기획자", role: "콘텐츠 기획 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 기획안" },
    { name: "작성자", role: "콘텐츠 제작 전문가", tools: ["Write", "Edit", "WebFetch"], outputPrefix: "## 제작물" },
    { name: "편집자", role: "품질 검수 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 검수 리포트" },
    { name: "전략가", role: "배포/최적화 전문가", tools: ["WebSearch", "Read", "Write"], outputPrefix: "## 최적화 전략" },
  ],
  development: [
    { name: "아키텍트", role: "시스템 설계 전문가", tools: ["Read", "Write", "Bash"], outputPrefix: "## 아키텍처 설계" },
    { name: "개발자", role: "구현 전문가", tools: ["Write", "Edit", "Bash"], outputPrefix: "## 구현 결과" },
    { name: "테스터", role: "테스트 전문가", tools: ["Read", "Write", "Bash"], outputPrefix: "## 테스트 리포트" },
    { name: "리뷰어", role: "코드 리뷰 전문가", tools: ["Read", "Edit", "Bash"], outputPrefix: "## 리뷰 결과" },
    { name: "데브옵스", role: "배포/운영 전문가", tools: ["Bash", "Write", "Read"], outputPrefix: "## 배포 리포트" },
  ],
  "data-ai": [
    { name: "데이터 분석가", role: "데이터 탐색/분석 전문가", tools: ["Read", "Bash", "WebSearch"], outputPrefix: "## 데이터 분석" },
    { name: "설계자", role: "파이프라인/모델 설계 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 설계 명세" },
    { name: "엔지니어", role: "구현/빌드 전문가", tools: ["Write", "Edit", "Bash"], outputPrefix: "## 구현 결과" },
    { name: "검증자", role: "품질/성능 검증 전문가", tools: ["Read", "Bash", "Write"], outputPrefix: "## 검증 리포트" },
    { name: "최적화 전문가", role: "성능 최적화 전문가", tools: ["Read", "Edit", "Bash"], outputPrefix: "## 최적화 결과" },
  ],
  business: [
    { name: "리서처", role: "시장/경쟁 분석 전문가", tools: ["WebSearch", "WebFetch", "Read"], outputPrefix: "## 시장 분석" },
    { name: "전략가", role: "비즈니스 전략 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 전략 보고서" },
    { name: "기획자", role: "실행 계획 전문가", tools: ["Write", "Edit", "Read"], outputPrefix: "## 실행 계획" },
    { name: "분석가", role: "재무/데이터 분석 전문가", tools: ["Read", "Bash", "Write"], outputPrefix: "## 분석 결과" },
    { name: "어드바이저", role: "검토/자문 전문가", tools: ["Read", "Edit", "WebSearch"], outputPrefix: "## 자문 의견" },
  ],
  education: [
    { name: "분석가", role: "학습 분석 전문가", tools: ["WebSearch", "Read", "WebFetch"], outputPrefix: "## 분석 결과" },
    { name: "설계자", role: "교육 설계 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 교육 설계" },
    { name: "콘텐츠 개발자", role: "학습 자료 개발 전문가", tools: ["Write", "Edit", "Bash"], outputPrefix: "## 학습 자료" },
    { name: "평가자", role: "평가/피드백 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 평가 리포트" },
    { name: "코치", role: "학습 코칭 전문가", tools: ["Read", "Write", "WebSearch"], outputPrefix: "## 코칭 가이드" },
  ],
  legal: [
    { name: "리서처", role: "법률 리서치 전문가", tools: ["WebSearch", "WebFetch", "Read"], outputPrefix: "## 법률 리서치" },
    { name: "분석가", role: "법률 분석 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 법률 분석" },
    { name: "작성자", role: "법률 문서 작성 전문가", tools: ["Write", "Edit", "Read"], outputPrefix: "## 법률 문서" },
    { name: "검토자", role: "법률 검토 전문가", tools: ["Read", "Edit", "WebSearch"], outputPrefix: "## 검토 의견" },
  ],
  lifestyle: [
    { name: "분석가", role: "니즈 분석 전문가", tools: ["WebSearch", "Read", "WebFetch"], outputPrefix: "## 분석 결과" },
    { name: "설계자", role: "플랜 설계 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 플랜 설계" },
    { name: "실행자", role: "실행 가이드 전문가", tools: ["Write", "Edit", "Read"], outputPrefix: "## 실행 가이드" },
    { name: "최적화 전문가", role: "최적화/개선 전문가", tools: ["Read", "Edit", "WebSearch"], outputPrefix: "## 최적화 결과" },
  ],
  communication: [
    { name: "리서처", role: "배경 조사 전문가", tools: ["WebSearch", "WebFetch", "Read"], outputPrefix: "## 배경 조사" },
    { name: "구조 설계자", role: "문서 구조 설계 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 구조 설계" },
    { name: "작성자", role: "문서 집필 전문가", tools: ["Write", "Edit", "Read"], outputPrefix: "## 초안" },
    { name: "편집자", role: "문서 편집/검수 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 편집 리포트" },
    { name: "전략가", role: "커뮤니케이션 전략 전문가", tools: ["Read", "Write", "WebSearch"], outputPrefix: "## 전략 가이드" },
  ],
  operations: [
    { name: "분석가", role: "프로세스 분석 전문가", tools: ["Read", "WebSearch", "WebFetch"], outputPrefix: "## 프로세스 분석" },
    { name: "설계자", role: "운영 설계 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 운영 설계" },
    { name: "실행자", role: "운영 실행 전문가", tools: ["Write", "Edit", "Bash"], outputPrefix: "## 실행 결과" },
    { name: "검수자", role: "품질 검수 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 검수 리포트" },
    { name: "최적화 전문가", role: "운영 최적화 전문가", tools: ["Read", "Edit", "WebSearch"], outputPrefix: "## 최적화 결과" },
  ],
  specialized: [
    { name: "리서처", role: "전문 리서치 전문가", tools: ["WebSearch", "WebFetch", "Read"], outputPrefix: "## 리서치 결과" },
    { name: "분석가", role: "전문 분석 전문가", tools: ["Read", "Write", "Edit"], outputPrefix: "## 분석 보고서" },
    { name: "실행자", role: "전문 실행 전문가", tools: ["Write", "Edit", "Bash"], outputPrefix: "## 실행 결과" },
    { name: "검토자", role: "전문 검토 전문가", tools: ["Read", "Edit", "Write"], outputPrefix: "## 검토 의견" },
    { name: "전략가", role: "전문 전략 전문가", tools: ["Read", "Write", "WebSearch"], outputPrefix: "## 전략 가이드" },
  ],
};

// ---------------------------------------------------------------------------
// Agent generation
// ---------------------------------------------------------------------------

function generateAgents(raw: RawHarness): readonly Agent[] {
  const templates = AGENT_TEMPLATES_BY_CATEGORY[raw.category] ?? AGENT_TEMPLATES_BY_CATEGORY["specialized"];
  const count = raw.agentCount;
  const agents: Agent[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const agentId = `${raw.slug}-agent-${i + 1}`;
    const dependencies = i === 0 ? [] : [`${raw.slug}-agent-${i}`];

    agents.push({
      id: agentId,
      name: `${raw.name} ${template.name}`,
      role: template.role,
      description: `${raw.name} 하네스의 ${template.role}. ${raw.description} 워크플로에서 ${template.name} 역할을 수행합니다.`,
      tools: [...template.tools],
      outputTemplate: `${template.outputPrefix}\n\n### 요약\n- 주요 발견 사항\n- 권장 사항\n\n### 상세\n(상세 내용)`,
      dependencies,
    });
  }

  return agents;
}

// ---------------------------------------------------------------------------
// Skill generation
// ---------------------------------------------------------------------------

function generateSkill(raw: RawHarness, agents: readonly Agent[]): Skill {
  const fullSteps: ExecutionStep[] = agents.map((agent, i) => ({
    agentId: agent.id,
    parallel: false,
    dependsOn: i === 0 ? [] : [agents[i - 1].id],
  }));

  const reducedSteps: ExecutionStep[] = agents
    .filter((_, i) => i === 0 || i === 2 || i === agents.length - 1)
    .map((agent, i, arr) => ({
      agentId: agent.id,
      parallel: false,
      dependsOn: i === 0 ? [] : [arr[i - 1].id],
    }));

  const singleSteps: ExecutionStep[] = [
    {
      agentId: agents[0].id,
      parallel: false,
      dependsOn: [],
    },
  ];

  return {
    id: `${raw.slug}-skill`,
    name: `${raw.name} 워크플로`,
    triggerConditions: [
      `${raw.name} 관련 작업 요청`,
      `${raw.slug} 키워드 감지`,
    ],
    executionOrder: fullSteps,
    modes: {
      full: fullSteps,
      reduced: reducedSteps,
      single: singleSteps,
    },
  };
}

// ---------------------------------------------------------------------------
// Popularity rankings (curated TOP 10, rest by ID order)
// ---------------------------------------------------------------------------

const POPULARITY_TOP_10: ReadonlyMap<number, number> = new Map([
  [16, 1],  // Fullstack Web App
  [21, 2],  // Code Reviewer
  [1, 3],   // YouTube Production
  [43, 4],  // Startup Launcher
  [32, 5],  // Data Analysis
  [41, 6],  // LLM App Builder
  [46, 7],  // Product Manager
  [10, 8],  // Social Media Manager
  [66, 9],  // Contract Analyzer
  [44, 10], // Market Research
]);

function computePopularityRank(id: number): number {
  const topRank = POPULARITY_TOP_10.get(id);
  if (topRank !== undefined) return topRank;

  // Remaining 90 harnesses: rank 11-100 in ID order, skipping TOP 10 IDs
  const topIds = new Set(POPULARITY_TOP_10.keys());
  const remaining = RAW_HARNESSES
    .filter((h) => !topIds.has(h.id))
    .map((h) => h.id)
    .sort((a, b) => a - b);

  const index = remaining.indexOf(id);
  return index + 11;
}

// ---------------------------------------------------------------------------
// Harness builder
// ---------------------------------------------------------------------------

function buildHarness(raw: RawHarness): Harness {
  const agents = generateAgents(raw);
  const skill = generateSkill(raw, agents);
  const frameworks = [...(FRAMEWORKS_BY_CATEGORY[raw.category] ?? [])];

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    category: raw.category,
    agents: agents as Agent[],
    skill,
    frameworks,
    agentCount: raw.agentCount,
    popularityRank: computePopularityRank(raw.id),
  };
}

function buildMeta(harness: Harness): HarnessMeta {
  return {
    id: harness.id,
    slug: harness.slug,
    name: harness.name,
    description: harness.description,
    category: harness.category,
    agentCount: harness.agentCount,
    frameworks: harness.frameworks,
    popularityRank: harness.popularityRank,
  };
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function padId(id: number): string {
  return String(id).padStart(2, "0");
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const projectRoot = resolve(__dirname, "..");
  const dataDir = resolve(projectRoot, "public", "data");
  const harnessDir = resolve(dataDir, "harness");

  ensureDir(dataDir);
  ensureDir(harnessDir);

  const metaList: HarnessMeta[] = [];

  for (const raw of RAW_HARNESSES) {
    const harness = buildHarness(raw);
    const meta = buildMeta(harness);

    metaList.push(meta);

    const fileName = `${padId(raw.id)}.json`;
    writeJson(resolve(harnessDir, fileName), harness);
  }

  writeJson(resolve(dataDir, "harnesses.json"), metaList);

  console.log(`Generated ${RAW_HARNESSES.length} harnesses → public/data/`);
}

main();
