// HOME-01 — compras inteligentes con categorización por pasillo.
import React, { useMemo } from 'react';
import { SectionList, View, Text, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, EmptyState, CheckCircle, IconBtn, Btn } from '@/src/components/ui';
import { QuickAdd } from '@/src/components/QuickAdd';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { AISLE_ORDER } from '@/src/utils/grocery';
import { GroceryItem } from '@/src/types/models';

export default function GroceryScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();

  const glist = state.grocery.lists[0];
  const items = state.grocery.items.filter((i) => i.listId === glist?.id);
  const open = items.filter((i) => i.status === 'open');
  const done = items.filter((i) => i.status === 'done');

  const sections = useMemo(() => {
    const byCat: Record<string, GroceryItem[]> = {};
    open.forEach((i) => { (byCat[i.category] = byCat[i.category] || []).push(i); });
    const secs = AISLE_ORDER.filter((c) => byCat[c]).map((c) => ({ title: c, data: byCat[c].sort((a, b) => a.position - b.position) }));
    if (done.length) secs.push({ title: `Comprados (${done.length})`, data: done });
    return secs;
  }, [state.grocery.items]);

  const reclassify = (item: GroceryItem) =>
    Alert.alert('Cambiar pasillo', `"${item.text}"`, [
      ...AISLE_ORDER.filter((c) => c !== item.category).map((c) => ({ text: c, onPress: () => actions.reclassifyGroceryItem(item.id, c) })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <QuickAdd placeholder="Añadir artículo (ej. leche, manzanas)…" onSubmit={(t) => actions.addGroceryItem(t)} />
      </View>
      {sections.length === 0 ? (
        <EmptyState icon="cart-outline" title="Tu lista está vacía" subtitle="Añade artículos y Rumbo los clasificará por pasillo automáticamente." />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 60 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
              <Text style={{ fontWeight: '800', fontSize: 13, color: colors.brandStrong }}>{section.title}</Text>
              {section.title.startsWith('Comprados') && <Btn label="Vaciar" small kind="ghost" onPress={() => actions.clearGroceryDone()} />}
            </View>
          )}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: colors.bgElev,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 10,
                marginBottom: 6,
              }}>
              <CheckCircle checked={item.status === 'done'} onPress={() => actions.toggleGroceryItem(item.id)} size={21} />
              <Text
                style={{
                  flex: 1,
                  color: item.status === 'done' ? colors.textFaint : colors.text,
                  textDecorationLine: item.status === 'done' ? 'line-through' : 'none',
                  fontWeight: '600',
                }}>
                {item.text}
              </Text>
              {item.status === 'open' && (
                <Pressable onPress={() => reclassify(item)} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={{ color: colors.textFaint, fontSize: 11.5 }}>{item.category}</Text>
                  <Ionicons name="chevron-down" size={12} color={colors.textFaint} />
                </Pressable>
              )}
              <IconBtn icon="trash-outline" size={16} onPress={() => actions.deleteGroceryItem(item.id)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
