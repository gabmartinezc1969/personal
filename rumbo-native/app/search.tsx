// SRCH-01 — búsqueda global sobre datos locales.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, EmptyState } from '@/src/components/ui';
import { useStore, activeTasks, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

type Result = { key: string; kind: string; icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string; go: () => void };

export default function SearchScreen() {
  const { state } = useStore();
  const { colors } = useTheme();
  const [q, setQ] = useState('');

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    const out: Result[] = [];
    state.lists.filter((l) => !l.archived).forEach((l) => {
      if (!query || l.name.toLowerCase().includes(query))
        out.push({ key: 'l' + l.id, kind: 'Lista', icon: 'list-outline', title: l.name, go: () => router.push(`/list/${l.id}`) });
    });
    activeTasks(state).forEach((t) => {
      if (!query || t.title.toLowerCase().includes(query) || t.tags.some((tg) => tg.toLowerCase().includes(query)))
        out.push({
          key: 't' + t.id,
          kind: 'Tarea',
          icon: 'checkmark-circle-outline',
          title: t.title,
          sub: state.lists.find((l) => l.id === t.listId)?.name,
          go: () => router.push(`/task/${t.id}`),
        });
    });
    state.boards.forEach((b) => {
      if (!query || b.name.toLowerCase().includes(query))
        out.push({ key: 'b' + b.id, kind: 'Tablero', icon: 'grid-outline', title: b.name, go: () => router.push(`/board/${b.id}`) });
    });
    activeBoardTasks(state).forEach((t) => {
      if (!query || t.title.toLowerCase().includes(query))
        out.push({
          key: 'bt' + t.id,
          kind: 'Tarjeta',
          icon: 'grid-outline',
          title: t.title,
          sub: state.boards.find((b) => b.id === t.boardId)?.name,
          go: () => router.push(`/board-task/${t.id}`),
        });
    });
    state.grocery.items.forEach((i) => {
      if (i.status === 'open' && (!query || i.text.toLowerCase().includes(query)))
        out.push({ key: 'g' + i.id, kind: 'Compra', icon: 'cart-outline', title: i.text, sub: i.category, go: () => router.push('/(tabs)/grocery') });
    });
    return out.slice(0, 50);
  }, [q, state]);

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: 16,
            paddingHorizontal: 12,
            backgroundColor: colors.bgElev,
          }}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            style={{ flex: 1, paddingVertical: 11, color: colors.text, fontSize: 15 }}
            placeholder="Buscar tareas, tarjetas, listas, artículos…"
            placeholderTextColor={colors.textFaint}
            value={q}
            onChangeText={setQ}
            autoFocus
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {results.length === 0 ? (
          <EmptyState icon="search-outline" title="Sin resultados" />
        ) : (
          results.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => { router.back(); setTimeout(r.go, 80); }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 11,
                borderRadius: 14,
                backgroundColor: pressed ? colors.brandDim : 'transparent',
              })}>
              <Ionicons name={r.icon} size={17} color={colors.textDim} />
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                {r.title}
                {r.sub ? <Text style={{ color: colors.textFaint, fontWeight: '400' }}> — {r.sub}</Text> : null}
              </Text>
              <Text style={{ color: colors.textFaint, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' }}>{r.kind}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
