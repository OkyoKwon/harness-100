import { useLocale } from "@/hooks/use-locale";
import { Checkbox } from "@/components/ui/checkbox";
import { TOOL_DEFINITIONS } from "@/lib/tool-definitions";

interface ToolCheckboxGroupProps {
  readonly selected: ReadonlyArray<string>;
  readonly onChange: (tools: ReadonlyArray<string>) => void;
}

export function ToolCheckboxGroup({ selected, onChange }: ToolCheckboxGroupProps) {
  const { t } = useLocale();

  const toggle = (toolId: string, checked: boolean) => {
    const next = checked
      ? [...selected, toolId]
      : selected.filter((t) => t !== toolId);
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {TOOL_DEFINITIONS.map((tool) => (
        <Checkbox
          key={tool.id}
          checked={selected.includes(tool.id)}
          onChange={(checked) => toggle(tool.id, checked)}
          label={t(tool.labelKey)}
          description={t(tool.descKey)}
        />
      ))}
    </div>
  );
}
