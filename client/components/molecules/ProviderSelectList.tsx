import { useMemo } from "react";
import { ProviderBrandIcon } from "../atoms/ProviderBrandIcon";
import { MinimalSelectDropdown } from "./MinimalSelectDropdown";
import { CUSTOM_CONNECTION, formatProviderLabel } from "@/lib/utils/llmSettings";

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
              label: "Custom endpoint",
              icon: <ProviderBrandIcon provider={null} size="sm" />,
            },
          ]
        : []),
    ];
    return items;
  }, [providers, includeCustom]);

  return (
    <MinimalSelectDropdown
      label="Provider"
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Choose provider..."
      searchable={options.length > 6}
      pinSelected
    />
  );
}
