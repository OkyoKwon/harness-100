import type { Category } from "./types";

export interface CategoryInfo {
  readonly slug: Category;
  readonly label: string;
  readonly labelEn: string;
  readonly range: readonly [number, number];
  readonly count: number;
  readonly color: string;
}

export const CATEGORIES: ReadonlyArray<CategoryInfo> = [
  { slug: "content", label: "콘텐츠", labelEn: "Content", range: [1, 15], count: 15, color: "#f59e0b" },
  { slug: "development", label: "개발", labelEn: "Dev", range: [16, 30], count: 15, color: "#2563eb" },
  { slug: "data-ai", label: "데이터", labelEn: "Data/AI", range: [31, 42], count: 12, color: "#8b5cf6" },
  { slug: "business", label: "비즈니스", labelEn: "Business", range: [43, 55], count: 13, color: "#059669" },
  { slug: "education", label: "교육", labelEn: "Education", range: [56, 65], count: 10, color: "#06b6d4" },
  { slug: "legal", label: "법률", labelEn: "Legal", range: [66, 72], count: 7, color: "#6366f1" },
  { slug: "lifestyle", label: "라이프", labelEn: "Life", range: [73, 80], count: 8, color: "#ec4899" },
  { slug: "communication", label: "문서", labelEn: "Docs", range: [81, 88], count: 8, color: "#14b8a6" },
  { slug: "operations", label: "운영", labelEn: "Ops", range: [89, 95], count: 7, color: "#f97316" },
  { slug: "specialized", label: "전문", labelEn: "Expert", range: [96, 100], count: 5, color: "#e11d48" },
] as const;

export const TOTAL_HARNESS_COUNT = 100;

/** 편집자 큐레이션 TOP 10: harness ID → 순위 (1 = 가장 인기) */
export const POPULARITY_RANKINGS: ReadonlyMap<number, number> = new Map([
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

export const STORAGE_KEYS = {
  favorites: "harness100_favorites",
  recentPaths: "harness100_recent_paths",
  customizations: "harness100_customizations",
  locale: "harness100_lang",
  customHarnesses: "harness100_custom_harnesses",
  builderGuidesDismissed: "harness100_builder_guides_dismissed",
  builderDraft: "harness100_builder_draft",
} as const;
