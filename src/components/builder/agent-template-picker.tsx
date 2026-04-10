import { useLocale } from "@/hooks/use-locale";
import { Modal, ModalBody } from "@/components/ui/modal";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import type { AgentTemplate } from "@/lib/custom-harness-types";

interface AgentTemplatePickerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (template: AgentTemplate) => void;
}

export function AgentTemplatePicker({ open, onClose, onSelect }: AgentTemplatePickerProps) {
  const { t } = useLocale();

  return (
    <Modal open={open} onClose={onClose} title={t("builder.agent.templateTitle")}>
      <ModalBody>
        <ul className="space-y-2">
          {AGENT_TEMPLATES.map((template) => (
            <li key={template.name}>
              <button
                type="button"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="w-full rounded-lg border border-[var(--border)] p-3 text-left hover:bg-[var(--muted)] transition-base focus-ring"
              >
                <div className="font-medium text-sm text-[var(--foreground)]">{template.name}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{template.role}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-block rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  );
}
