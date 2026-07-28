import { useMemo } from "react";
import { ProviderBrandIcon } from "../atoms/ProviderBrandIcon";
import { MinimalSelectDropdown } from "./MinimalSelectDropdown";
import { CUSTOM_CONNECTION, formatProviderLabel } from "@/lib/utils/llmSettings";
import { useT } from "@/lib/i18n";

interface ProviderSelectListProps {
  providers: string[];
  value: string;
  onChange: (value: string) => void;
  includeCustom?: boolean;
}

export function ProviderSelectList({
  providers,
  value,
  onChange,
  includeCustom = true,
}: ProviderSelectListProps) {
  const t = useT();
  const options = useMemo(() => {
    const items = [
      ...providers.map((p) => ({
        value: p,
        label: formatProviderLabel(p),
        icon: <ProviderBrandIcon provider={p} size="sm" />,
      })),
      ...(includeCustom
        ? [
            {
              value: CUSTOM_CONNECTION,
              label: t("llm.customEndpoint"),
              icon: <ProviderBrandIcon provider={null} size="sm" />,
            },
          ]
        : []),
    ];
    return items;
  }, [providers, includeCustom, t]);

  return (
    <MinimalSelectDropdown
      label={t("llm.provider")}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={t("llm.chooseProvider")}
      searchable={options.length > 6}
      pinSelected
    />
  );
}
