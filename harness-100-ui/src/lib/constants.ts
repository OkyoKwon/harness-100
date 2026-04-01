import type { Category } from "./types";

export interface CategoryInfo {
  readonly slug: Category;
  readonly label: string;
  readonly labelEn: string;
  readonly range: readonly [number, number];
  readonly count: number;
}

export const CATEGORIES: ReadonlyArray<CategoryInfo> = [
  { slug: "content", label: "콘텐츠", labelEn: "Content", range: [1, 15], count: 15 },
  { slug: "development", label: "개발", labelEn: "Dev", range: [16, 30], count: 15 },
  { slug: "data-ai", label: "데이터", labelEn: "Data/AI", range: [31, 42], count: 12 },
  { slug: "business", label: "비즈니스", labelEn: "Business", range: [43, 55], count: 13 },
  { slug: "education", label: "교육", labelEn: "Education", range: [56, 65], count: 10 },
  { slug: "legal", label: "법률", labelEn: "Legal", range: [66, 72], count: 7 },
  { slug: "lifestyle", label: "라이프", labelEn: "Life", range: [73, 80], count: 8 },
  { slug: "communication", label: "문서", labelEn: "Docs", range: [81, 88], count: 8 },
  { slug: "operations", label: "운영", labelEn: "Ops", range: [89, 95], count: 7 },
  { slug: "specialized", label: "전문", labelEn: "Expert", range: [96, 100], count: 5 },
] as const;

export const TOTAL_HARNESS_COUNT = 100;

export const STORAGE_KEYS = {
  favorites: "harness100_favorites",
  recentPaths: "harness100_recent_paths",
  customizations: "harness100_customizations",
} as const;
