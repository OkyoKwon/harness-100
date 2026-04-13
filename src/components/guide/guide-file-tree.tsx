"use client";

import { useLocale } from "@/hooks/use-locale";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/guide/code-block";

const FILE_TYPES = [
  {
    badgeKey: "guide.fileStructure.agentsBadge",
    descKey: "guide.fileStructure.agents",
  },
  {
    badgeKey: "guide.fileStructure.skillsBadge",
    descKey: "guide.fileStructure.skills",
  },
  {
    badgeKey: "guide.fileStructure.claudeMdBadge",
    descKey: "guide.fileStructure.claudeMd",
  },
] as const;

export function GuideFileTree() {
  const { t } = useLocale();

  return (
    <section id="file-structure" className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-semibold mb-4">{t("guide.fileStructure.title")}</h2>
      <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
        {t("guide.fileStructure.body")}
      </p>

      <div className="mb-4">
        <CodeBlock>{`my-project/
└── .claude/
    ├── agents/        # agent-name.md × 4-5
    ├── skills/        # skill-name/skill.md
    └── CLAUDE.md`}</CodeBlock>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {FILE_TYPES.map((ft) => (
          <Card key={ft.badgeKey}>
            <CardBody className="p-3">
              <Badge variant="tool" className="mb-1.5">{t(ft.badgeKey)}</Badge>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {t(ft.descKey)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-4 py-3">
        <p className="text-sm text-[var(--info-foreground)]">
          {t("guide.fileStructure.customizeTip")}
        </p>
      </div>
    </section>
  );
}
