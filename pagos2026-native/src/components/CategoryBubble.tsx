import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CategoryBubble({ icon, color, size = 42 }: { icon: string; color: string; size?: number }) {
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
