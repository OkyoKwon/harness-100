export function HeroSection() {
  return (
    <div className="hero-gradient rounded-xl px-5 py-5 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1">
        AI 에이전트 팀 워크플로우
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-2">
        골라서 바로 세팅 — 열고 → 고르고 → 세팅
      </p>
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
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
    </div>
  );
}
