import { CATEGORIES, TOTAL_HARNESS_COUNT } from "@/lib/constants";

const TOTAL_AGENTS = CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);

const stats = [
  { label: "하네스", value: TOTAL_HARNESS_COUNT },
  { label: "카테고리", value: CATEGORIES.length },
  { label: "워크플로우", value: `${TOTAL_AGENTS}+` },
] as const;

export function HeroSection() {
  return (
    <div className="hero-gradient rounded-xl px-5 py-6 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1">
        AI 에이전트 팀 워크플로우
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-2">
        골라서 바로 세팅 — 열고 → 고르고 → 세팅
      </p>
      <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
        <a
          href="https://github.com/revfactory/harness-100"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:underline"
        >
          revfactory/harness-100
        </a>
        {" "}오픈소스 프로젝트를 기반으로, 복잡한 설정 없이 클릭 몇 번으로 바로 세팅할 수 있도록 UI화했습니다.
      </p>
      <div className="flex gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-[var(--card)] border border-[var(--border)] px-3 py-2 shadow-[var(--shadow-sm)]"
          >
            <p className="text-lg font-bold text-[var(--primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
