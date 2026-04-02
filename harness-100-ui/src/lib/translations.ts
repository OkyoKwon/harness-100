import type { Locale } from "./locale";

type TranslationEntry = { readonly ko: string; readonly en: string };
type TranslationParams = Record<string, string | number>;

const translations: Record<string, TranslationEntry> = {
  // ── Navigation ──
  "nav.ranking": { ko: "랭킹", en: "Ranking" },
  "nav.composer": { ko: "조합기", en: "Composer" },
  "nav.guide": { ko: "가이드", en: "Guide" },

  // ── Accessibility ──
  "a11y.skipToContent": { ko: "본문으로 건너뛰기", en: "Skip to content" },
  "a11y.prevCategory": { ko: "이전 카테고리", en: "Previous category" },
  "a11y.nextCategory": { ko: "다음 카테고리", en: "Next category" },
  "a11y.lightMode": { ko: "라이트 모드로 전환", en: "Switch to light mode" },
  "a11y.darkMode": { ko: "다크 모드로 전환", en: "Switch to dark mode" },
  "a11y.close": { ko: "닫기", en: "Close" },

  // ── Hero ──
  "hero.title": {
    ko: "100개의 AI 에이전트 팀, 3번의 클릭으로 세팅",
    en: "100 AI Agent Teams, Set Up in 3 Clicks",
  },
  "hero.subtitle": {
    ko: "고르고 → 클릭하고 → 바로 실행",
    en: "Browse → Click → Run",
  },
  "hero.description": {
    ko: "오픈소스 기반 · 설치 없이 브라우저에서 바로 세팅",
    en: "Open-source · Set up directly in your browser",
  },

  // ── Search ──
  "search.placeholder": {
    ko: "하네스 검색... 예: 유튜브, API, 스타트업",
    en: "Search harnesses... e.g., YouTube, API, Startup",
  },

  // ── Category ──
  "category.favorites": { ko: "즐겨찾기", en: "Favorites" },
  "category.all": { ko: "전체", en: "All" },

  // ── Sort & Filter ──
  "sort.label": { ko: "정렬", en: "Sort" },
  "sort.byId": { ko: "번호순", en: "By Number" },
  "sort.byPopularity": { ko: "인기순", en: "Popularity" },
  "sort.byName": { ko: "이름순", en: "By Name" },
  "sort.byAgentCount": { ko: "에이전트 수", en: "Agent Count" },
  "catalog.resultCount": { ko: "{count}개 결과", en: "{count} results" },
  "catalog.harnessCount": { ko: "{count}개 하네스", en: "{count} harnesses" },
  "catalog.noResults": { ko: "검색 결과가 없습니다", en: "No results found" },
  "catalog.tryOther": {
    ko: "다른 키워드로 검색해 보세요",
    en: "Try different keywords",
  },
  "catalog.retry": { ko: "다시 시도", en: "Retry" },
  "catalog.loadError": {
    ko: "카탈로그를 불러오는 데 실패했습니다.",
    en: "Failed to load catalog.",
  },

  // ── Card ──
  "card.agents": { ko: "👥 {count}명", en: "👥 {count}" },

  // ── Detail ──
  "detail.backToList": { ko: "목록", en: "List" },
  "detail.agents": { ko: "에이전트 ({count})", en: "Agents ({count})" },
  "detail.agentCount": { ko: "에이전트 {count}개", en: "{count} Agents" },
  "detail.workflow": { ko: "워크플로우", en: "Workflow" },
  "detail.customize": { ko: "수정해서 받기", en: "Customize" },
  "detail.tools": { ko: "도구", en: "Tools" },
  "detail.dependencies": { ko: "의존성", en: "Dependencies" },
  "detail.viewSkillMd": { ko: "스킬 마크다운 보기", en: "View Skill Markdown" },
  "detail.extensionSkill": { ko: "확장 스킬", en: "Extension Skill" },
  "detail.skillMarkdown": { ko: "스킬 마크다운", en: "Skill Markdown" },
  "detail.outputs": { ko: "산출물", en: "Outputs" },
  "detail.outputsFallback": { ko: "산출물", en: "Outputs" },
  "detail.frameworks": { ko: "적용 프레임워크", en: "Frameworks" },
  "detail.usage": { ko: "사용법", en: "Usage" },
  "detail.requestExamples": { ko: "요청 예시", en: "Request Examples" },
  "detail.modeAgents": { ko: "({count}명)", en: "({count})" },
  "detail.noAgents": { ko: "에이전트가 없습니다.", en: "No agents." },
  "detail.invalidId": {
    ko: "올바르지 않은 하네스 ID입니다.",
    en: "Invalid harness ID.",
  },
  "detail.loadError": {
    ko: "하네스를 불러오는 데 실패했습니다.",
    en: "Failed to load harness.",
  },
  "detail.cannotLoad": {
    ko: "하네스를 불러올 수 없습니다.",
    en: "Could not load harness.",
  },

  // ── Actions ──
  "action.setup": { ko: "세팅 →", en: "Setup →" },
  "action.setupInProgress": { ko: "세팅 중...", en: "Setting up..." },
  "action.zip": { ko: "ZIP ↓", en: "ZIP ↓" },
  "action.zipBuilding": { ko: "생성 중...", en: "Building..." },
  "action.copy": { ko: "복사", en: "Copy" },
  "action.copied": { ko: "복사됨 ✓", en: "Copied ✓" },

  // ── Favorites ──
  "favorite.add": { ko: "즐겨찾기 추가", en: "Add to favorites" },
  "favorite.remove": { ko: "즐겨찾기 해제", en: "Remove from favorites" },

  // ── Quick Preview ──
  "preview.loading": { ko: "로딩 중...", en: "Loading..." },
  "preview.error": {
    ko: "정보를 불러올 수 없습니다",
    en: "Could not load info",
  },

  // ── Setup Guide ──
  "setup.guideTitle": { ko: "세팅 가이드", en: "Setup Guide" },
  "setup.step1": {
    ko: '위의 "세팅 →" 버튼 클릭',
    en: 'Click the "Setup →" button above',
  },
  "setup.step2": {
    ko: "프로젝트 폴더 선택 — .claude/ 폴더가 자동 생성됩니다",
    en: "Select your project folder — a .claude/ folder will be created automatically",
  },
  "setup.step3prefix": { ko: "터미널에서", en: "Run" },
  "setup.step3suffix": { ko: "실행", en: "in your terminal" },
  "setup.tip": {
    ko: '💡 브라우저가 File System Access API를 지원하지 않으면 "ZIP ↓" 버튼으로 다운로드 후 프로젝트에 복사하세요.',
    en: '💡 If your browser doesn\'t support the File System Access API, use the "ZIP ↓" button to download and copy to your project.',
  },

  // ── Completion Banner ──
  "completion.setupDone": {
    ko: "✅ 세팅 완료! {path}/.claude/ 에 설치됨",
    en: "✅ Setup complete! Installed at {path}/.claude/",
  },
  "completion.filesCreated": {
    ko: "{count}개 파일이 생성되었습니다.",
    en: "{count} files created.",
  },
  "completion.zipDone": {
    ko: "✅ {slug}.zip 다운로드 완료!",
    en: "✅ {slug}.zip downloaded!",
  },
  "completion.unzipHint": {
    ko: "압축을 풀고 프로젝트 루트에 .claude/ 폴더를 복사하세요.",
    en: "Unzip and copy the .claude/ folder to your project root.",
  },
  "completion.tipPrefix": { ko: "💡", en: "💡" },
  "completion.tipText": {
    ko: "스킬을 호출하면 에이전트가 순서대로 실행됩니다. 스킬이 보이지 않으면 Claude 세션을 재시작(/exit 후 다시 실행)해 보세요.",
    en: "Invoke the skill and agents will run in order. If the skill isn't visible, restart your Claude session (type /exit and relaunch).",
  },

  // ── Toast ──
  "toast.setupComplete": {
    ko: "세팅 완료 — {count}개 파일 생성됨",
    en: "Setup complete — {count} files created",
  },
  "toast.zipComplete": {
    ko: "ZIP 다운로드 완료",
    en: "ZIP download complete",
  },

  // ── Composer ──
  "composer.title": { ko: "하네스 조합기", en: "Harness Composer" },
  "composer.description": {
    ko: "서로 다른 하네스의 에이전트를 조합하여 나만의 워크플로우를 만드세요.",
    en: "Combine agents from different harnesses to create your own workflow.",
  },
  "composer.reset": { ko: "초기화", en: "Reset" },
  "composer.searchPlaceholder": {
    ko: "에이전트 팀 검색...",
    en: "Search agent teams...",
  },
  "composer.selected": { ko: "선택됨 ({count})", en: "Selected ({count})" },
  "composer.selectedCount": {
    ko: "{count}개 선택",
    en: "{count} selected",
  },
  "composer.clearAll": { ko: "전체 해제", en: "Clear all" },
  "composer.noResults": { ko: "검색 결과 없음", en: "No results" },
  "composer.previewTitle": {
    ko: "조합 결과 미리보기",
    en: "Composition Preview",
  },
  "composer.setupComposed": { ko: "조합 세팅 →", en: "Setup Composed →" },
  "composer.selectPrompt": {
    ko: "왼쪽에서 하네스를 선택하세요",
    en: "Select a harness from the left",
  },
  "composer.harnessCount": {
    ko: "하네스 {count}개",
    en: "{count} Harnesses",
  },
  "composer.totalAgents": {
    ko: "에이전트 총 {count}명",
    en: "{count} Agents total",
  },
  "composer.frameworkCount": {
    ko: "프레임워크 {count}개",
    en: "{count} Frameworks",
  },
  "composer.catalogError": {
    ko: "카탈로그를 불러오는데 실패했습니다.",
    en: "Failed to load catalog.",
  },
  "composer.agentCount": { ko: "{count}명", en: "{count}" },

  // ── Customizer ──
  "customizer.editMode": { ko: "수정 모드", en: "Edit Mode" },
  "customizer.restore": { ko: "원본 복원", en: "Restore Original" },
  "customizer.agentList": { ko: "에이전트 목록", en: "Agent List" },
  "customizer.editArea": { ko: "편집 영역", en: "Edit Area" },
  "customizer.name": { ko: "이름", en: "Name" },
  "customizer.role": { ko: "역할", en: "Role" },
  "customizer.outputTemplate": { ko: "산출물 템플릿", en: "Output Template" },
  "customizer.changeCount": {
    ko: "변경사항: {count}개 수정됨",
    en: "Changes: {count} modified",
  },
  "customizer.setupModified": { ko: "수정본 세팅 →", en: "Modified Setup →" },
  "customizer.zipModified": { ko: "수정본 ZIP ↓", en: "Modified ZIP ↓" },
  "customizer.disabledAgent": {
    ko: "비활성화된 에이전트입니다.",
    en: "This agent is disabled.",
  },
  "customizer.selectAgent": {
    ko: "에이전트를 선택해주세요.",
    en: "Please select an agent.",
  },
  "customizer.enableAgent": {
    ko: "{name} 활성화",
    en: "Enable {name}",
  },
  "customizer.disableAgent": {
    ko: "{name} 비활성화",
    en: "Disable {name}",
  },

  // ── Guide Page ──
  "guide.title": { ko: "사용 가이드", en: "User Guide" },
  "guide.whatIsHarness.title": { ko: "하네스란?", en: "What is a Harness?" },
  "guide.whatIsHarness.body": {
    ko: "하네스(Harness)는 4~5명의 전문 AI 에이전트와 오케스트레이터 스킬로 구성된 워크플로우 패키지입니다. Claude Code의 에이전트 팀 기능을 활용하여 일상 업무에 즉시 적용할 수 있습니다.",
    en: "A Harness is a workflow package composed of 4-5 specialized AI agents and an orchestrator skill. It leverages Claude Code's agent team feature so you can apply it to everyday tasks instantly.",
  },
  "guide.install.title": { ko: "설치 방법", en: "Installation" },
  "guide.install.method1.title": { ko: "방법 1: 세팅 (권장)", en: "Method 1: Setup (Recommended)" },
  "guide.install.method1.desc": {
    ko: "Chrome 또는 Edge 브라우저에서 [세팅 →] 버튼을 클릭하면 프로젝트 폴더에 바로 설치됩니다.",
    en: "In Chrome or Edge, click the [Setup →] button to install directly into your project folder.",
  },
  "guide.install.method1.step1": { ko: "하네스 카드에서 [세팅 →] 클릭", en: "Click [Setup →] on a harness card" },
  "guide.install.method1.step2": { ko: "프로젝트 폴더 선택", en: "Select your project folder" },
  "guide.install.method1.step3": { ko: ".claude/ 폴더가 자동 생성됩니다", en: "A .claude/ folder will be created automatically" },
  "guide.install.method2.title": { ko: "방법 2: ZIP 다운로드", en: "Method 2: ZIP Download" },
  "guide.install.method2.desc": {
    ko: "모든 브라우저에서 사용 가능합니다.",
    en: "Works in all browsers.",
  },
  "guide.install.method2.step1": { ko: "[ZIP ↓] 클릭하여 다운로드", en: "Click [ZIP ↓] to download" },
  "guide.install.method2.step2": { ko: "ZIP 파일 압축 해제", en: "Extract the ZIP file" },
  "guide.install.method2.step3": { ko: ".claude/ 폴더를 프로젝트 루트에 복사", en: "Copy the .claude/ folder to your project root" },
  "guide.install.method3.title": { ko: "방법 3: CLI", en: "Method 3: CLI" },
  "guide.browser.title": { ko: "브라우저 호환성", en: "Browser Compatibility" },
  "guide.browser.feature": { ko: "기능", en: "Feature" },
  "guide.browser.catalogBrowse": { ko: "카탈로그 탐색", en: "Catalog Browse" },
  "guide.browser.favorites": { ko: "즐겨찾기", en: "Favorites" },
  "guide.browser.zipDownload": { ko: "ZIP 다운로드", en: "ZIP Download" },
  "guide.browser.localSetup": { ko: "로컬 세팅", en: "Local Setup" },
  "guide.browser.zipFallback": { ko: "❌ (ZIP 폴백)", en: "❌ (ZIP fallback)" },
  "guide.faq.title": { ko: "FAQ", en: "FAQ" },
  "guide.faq.q1": {
    ko: "기존 .claude/ 폴더가 있으면 어떻게 되나요?",
    en: "What happens if a .claude/ folder already exists?",
  },
  "guide.faq.a1": {
    ko: "기존 파일은 유지하고 새 파일만 추가합니다 (병합 모드). 같은 이름의 파일이 있으면 덮어쓸지 확인합니다.",
    en: "Existing files are kept and only new files are added (merge mode). If a file with the same name exists, you'll be asked to confirm overwriting.",
  },
  "guide.faq.q2": {
    ko: "여러 하네스를 한 프로젝트에 설치할 수 있나요?",
    en: "Can I install multiple harnesses in one project?",
  },
  "guide.faq.a2": {
    ko: "네, 즐겨찾기에 추가한 뒤 [즐겨찾기 전체 세팅 →]으로 한 번에 병합 설치할 수 있습니다.",
    en: "Yes, add them to favorites and use [Setup All Favorites →] to install them all at once.",
  },
  "guide.faq.q3": {
    ko: "로그인이 필요한가요?",
    en: "Do I need to log in?",
  },
  "guide.faq.a3": {
    ko: "아니요. 로그인, 회원가입, 결제 없이 모든 기능을 사용할 수 있습니다.",
    en: "No. All features are available without login, sign-up, or payment.",
  },

  // ── Metadata ──
  "metadata.title": {
    ko: "Harness 100 — AI 에이전트 팀 하네스",
    en: "Harness 100 — AI Agent Team Harness",
  },
  "metadata.description": {
    ko: "100개의 에이전트 팀 워크플로우를 골라서 바로 적용하세요",
    en: "Browse and apply 100 agent team workflows instantly",
  },
} as const;

export function t(
  locale: Locale,
  key: string,
  params?: TranslationParams,
): string {
  const entry = translations[key];
  if (!entry) return key;

  let text = entry[locale] ?? entry.ko;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
