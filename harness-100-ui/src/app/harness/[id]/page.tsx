import { HarnessDetailClient } from "@/components/detail/harness-detail-client";

export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, i) => ({
    id: String(i + 1).padStart(2, "0"),
  }));
}

export default async function HarnessDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HarnessDetailClient idParam={id} />;
}
