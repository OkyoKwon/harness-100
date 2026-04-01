export default function GuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">사용 가이드</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">하네스란?</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          하네스(Harness)는 4~5명의 전문 AI 에이전트와 오케스트레이터 스킬로
          구성된 워크플로우 패키지입니다. Claude Code의 에이전트 팀 기능을
          활용하여 일상 업무에 즉시 적용할 수 있습니다.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">설치 방법</h2>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">방법 1: 세팅 (권장)</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              Chrome 또는 Edge 브라우저에서 [세팅 →] 버튼을 클릭하면
              프로젝트 폴더에 바로 설치됩니다.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>하네스 카드에서 [세팅 →] 클릭</li>
              <li>프로젝트 폴더 선택</li>
              <li>.claude/ 폴더가 자동 생성됩니다</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">방법 2: ZIP 다운로드</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              모든 브라우저에서 사용 가능합니다.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>[ZIP ↓] 클릭하여 다운로드</li>
              <li>ZIP 파일 압축 해제</li>
              <li>.claude/ 폴더를 프로젝트 루트에 복사</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">방법 3: CLI</h3>
            <pre className="bg-[var(--muted)] p-3 rounded text-sm overflow-x-auto">
{`cp -r {NN}-{harness-name}/.claude/ /path/to/my-project/.claude/
cd /path/to/my-project
claude`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">브라우저 호환성</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4">기능</th>
                <th className="text-left py-2 pr-4">Chrome/Edge</th>
                <th className="text-left py-2 pr-4">Safari</th>
                <th className="text-left py-2">Firefox</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">카탈로그 탐색</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">즐겨찾기</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">ZIP 다운로드</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">로컬 세팅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">❌ (ZIP 폴백)</td>
                <td className="py-2">❌ (ZIP 폴백)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">
              기존 .claude/ 폴더가 있으면 어떻게 되나요?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              기존 파일은 유지하고 새 파일만 추가합니다 (병합 모드).
              같은 이름의 파일이 있으면 덮어쓸지 확인합니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              여러 하네스를 한 프로젝트에 설치할 수 있나요?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              네, 즐겨찾기에 추가한 뒤 [즐겨찾기 전체 세팅 →]으로
              한 번에 병합 설치할 수 있습니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              로그인이 필요한가요?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              아니요. 로그인, 회원가입, 결제 없이 모든 기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
