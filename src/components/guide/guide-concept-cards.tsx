"use client";

import { useLocale } from "@/hooks/use-locale";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptRelationshipDiagram } from "@/components/common/concept-diagram";

const CONCEPTS = [
  {
    icon: "🤖",
    titleKey: "guide.coreConcepts.agentTitle",
    bodyKey: "guide.coreConcepts.agentBody",
    badgeKey: "guide.coreConcepts.agentBadge",
  },
  {
    icon: "🎯",
    titleKey: "guide.coreConcepts.skillTitle",
    bodyKey: "guide.coreConcepts.skillBody",
    badgeKey: "guide.coreConcepts.skillBadge",
  },
  {
    icon: "🧩",
    titleKey: "guide.coreConcepts.extensionTitle",
    bodyKey: "guide.coreConcepts.extensionBody",
    badgeKey: "guide.coreConcepts.extensionBadge",
  },
] as const;

export function GuideConceptCards() {
  const { t } = useLocale();

  return (
    <section id="core-concepts" className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-semibold mb-4">{t("guide.coreConcepts.title")}</h2>
      <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
        {t("guide.coreConcepts.intro")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CONCEPTS.map((concept) => (
          <Card key={concept.titleKey} hoverable>
            <CardBody>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" role="img" aria-hidden="true">
                  {concept.icon}
                </span>
                <Badge variant="tool">{t(concept.badgeKey)}</Badge>
              </div>
              <h3 className="font-semibold mb-1.5 text-sm">{t(concept.titleKey)}</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {t(concept.bodyKey)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <ConceptRelationshipDiagram />

      <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-4 py-3">
        {t("guide.coreConcepts.summary")}
      </p>
    </section>
  );
}
