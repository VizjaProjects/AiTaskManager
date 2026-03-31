import { View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width,
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-surface-container-high ${className ?? ""}`}
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          opacity,
        },
      ]}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <View className="bg-surface-container-lowest rounded-2xl p-5 flex-row items-center gap-4">
      <View className="w-1.5 h-12 rounded-full bg-surface-container-high" />
      <View className="flex-1 gap-2">
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View className="bg-white/70 rounded-2xl p-6 h-32 justify-between">
      <Skeleton width="60%" height={12} />
      <Skeleton width={80} height={36} borderRadius={4} />
    </View>
  );
}
