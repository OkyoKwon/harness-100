export function HeroSection() {
  return (
    <div className="hero-gradient rounded-xl px-5 py-5 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1">
        100개의 AI 에이전트 팀, 3클릭으로 세팅
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-2">
        고르고 → 클릭하고 → 바로 실행
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
        {" "}오픈소스 기반 · 설치 없이 브라우저에서 바로 세팅
      </p>
    </div>
  );
}
