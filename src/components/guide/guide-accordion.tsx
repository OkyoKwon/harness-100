"use client";

import { useState, useCallback } from "react";

interface AccordionItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

interface GuideAccordionProps {
  readonly items: ReadonlyArray<AccordionItem>;
}

export function GuideAccordion({ items }: GuideAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="bg-[var(--card-bg)]">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
