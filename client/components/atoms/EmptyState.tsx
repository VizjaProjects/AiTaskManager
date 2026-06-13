import { View, Text, type ViewProps } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps extends ViewProps {
  icon?: string;
  title: string;
  description: string;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  ...props
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16" {...props}>
      <View className="w-20 h-20 rounded-full bg-surface-container-low items-center justify-center mb-6 border border-outline-variant">
        <View className="w-12 h-12 rounded-full bg-surface-container-lowest items-center justify-center border border-outline-variant">
          <View className="w-4 h-4 rounded-full bg-inverse-surface" />
        </View>
      </View>
      <Text className="text-on-surface font-display text-2xl text-center mb-2">
        {title}
      </Text>
      <Text className="text-on-surface-variant font-body text-sm text-center mb-8 max-w-xs">
        {description}
      </Text>
      {(primaryAction || secondaryAction) && (
        <View className="flex-row gap-3">
          {secondaryAction && (
            <Button
              variant="outline"
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
            />
          )}
          {primaryAction && (
            <Button
              variant="primary"
              label={primaryAction.label}
              onPress={primaryAction.onPress}
            />
          )}
        </View>
      )}
    </View>
  );
}
