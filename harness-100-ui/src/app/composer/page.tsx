"use client";

export default function ComposerPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">하네스 조합기</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        서로 다른 하네스의 에이전트를 조합하여 나만의 워크플로우를 만드세요.
      </p>

      <div className="border border-[var(--border)] rounded-lg p-12 text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h2 className="text-xl font-semibold mb-2">Phase 3에서 제공 예정</h2>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          에이전트를 드래그 앤 드롭으로 조합하고, 의존관계를 자동으로 연결하며,
          조합 결과를 바로 세팅하거나 ZIP으로 다운로드할 수 있습니다.
        </p>
      </div>
    </main>
  );
}
