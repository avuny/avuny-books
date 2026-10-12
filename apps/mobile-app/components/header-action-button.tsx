import React from "react"
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native"

import { Ionicons } from "@expo/vector-icons"

interface HeaderActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  isDark?: boolean
  style?: ViewStyle
}

export function HeaderActionButton({
  icon,
  onPress,
  isDark,
  style,
}: HeaderActionButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={18} color={isDark ? "#fff" : "#111"} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
})
