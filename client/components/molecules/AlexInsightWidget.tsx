import { View, Text, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "../atoms";

export function AlexInsightWidget() {
  return (
    <Card className="bg-primary-fixed/40 border-primary/10 gap-4">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
          <MaterialIcons name="smart-toy" size={22} color="#fff" />
        </View>
        <View>
          <Text className="text-label-md font-headline uppercase text-primary tracking-wider">
            Alex (AI)
          </Text>
          <Text className="text-label-md font-label uppercase text-on-surface-variant">
            Workspace Insights
          </Text>
        </View>
      </View>
      <Text className="text-on-surface-variant font-body text-body-md italic leading-6">
        "Your focus blocks are well distributed this week. Consider batching
        similar tasks on Wednesday afternoon for better flow."
      </Text>
      <View className="flex-row items-center gap-2 bg-surface-container-lowest rounded-xl px-3 py-2 border border-outline-variant/30 opacity-60">
        <TextInput
          placeholder="Ask Alex..."
          placeholderTextColor="#777587"
          editable={false}
          className="flex-1 text-on-surface-variant font-body text-body-md"
        />
        <MaterialIcons name="send" size={20} color="#331fc8" />
      </View>
      <Text className="text-on-surface-variant font-body text-xs text-center">
        W przygotowaniu — czat z kuratorem AI
      </Text>
    </Card>
  );
}
