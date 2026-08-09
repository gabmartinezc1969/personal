// PERS-01 — Listas personales.
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, EmptyState, Btn, Card } from '@/src/components/ui';
import { useStore, activeTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { LIST_COLORS } from '@/src/theme/colors';

export default function ListsScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);

  const lists = state.lists.filter((l) => !l.archived).sort((a, b) => a.position - b.position);
  const openCount = (listId: string) => activeTasks(state).filter((t) => t.listId === listId && t.status === 'open').length;

  const create = () => {
    if (!name.trim()) return;
    const id = actions.addList(name, color);
    setCreating(false);
    setName('');
    setColor(LIST_COLORS[0]);
    router.push(`/list/${id}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {lists.length === 0 ? (
          <EmptyState icon="list-outline" title="Sin listas" subtitle="Crea tu primera lista para organizar tus tareas." />
        ) : (
          lists.map((l) => (
            <Card key={l.id} onPress={() => router.push(`/list/${l.id}`)} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: l.color }} />
              <Text style={{ flex: 1, fontWeight: '700', fontSize: 15, color: colors.text }}>{l.name}</Text>
              <Text style={{ color: colors.textFaint, fontWeight: '600' }}>{openCount(l.id) || ''}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Card>
          ))
        )}
        <Btn label="Nueva lista" icon="add" kind="primary" onPress={() => setCreating(true)} style={{ marginTop: 10 }} />
      </ScrollView>

      <Modal visible={creating} animationType="slide" transparent onRequestClose={() => setCreating(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,14,17,0.45)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bgElev, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 36 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Nueva lista</Text>
            <TextInput
              placeholder="Nombre (ej. Universidad)"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={setName}
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: colors.borderStrong,
                borderRadius: 9,
                padding: 11,
                color: colors.text,
                marginBottom: 14,
              }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              {LIST_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: c,
                    borderWidth: 2.5,
                    borderColor: color === c ? colors.text : 'transparent',
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Btn label="Cancelar" onPress={() => setCreating(false)} />
              <Btn label="Crear lista" kind="primary" onPress={create} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
