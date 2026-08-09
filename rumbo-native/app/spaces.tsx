// COL-01 — espacios compartidos (referencia local, sin autenticación real).
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, EmptyState, Btn, Card } from '@/src/components/ui';
import { useStore, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

export default function SpacesScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');

  const create = () => {
    if (!draft.trim()) return;
    const id = actions.addSpace(draft);
    setDraft('');
    router.push(`/space/${id}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textFaint, fontSize: 12.5, marginBottom: 14 }}>
          Espacios compartidos locales: miembros de referencia sin autenticación real (ver Arquitectura).
        </Text>
        {state.spaces.length === 0 ? (
          <EmptyState icon="people-outline" title="Sin espacios" subtitle="Crea un espacio para colaborar con tableros." />
        ) : (
          state.spaces
            .sort((a, b) => a.position - b.position)
            .map((s) => {
              const boards = state.boards.filter((b) => b.spaceId === s.id);
              const openCards = activeBoardTasks(state).filter((t) => boards.some((b) => b.id === t.boardId) && t.status === 'open').length;
              return (
                <Card key={s.id} onPress={() => router.push(`/space/${s.id}`)} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: s.color }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }}>{s.name}</Text>
                    <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                      {boards.length} tableros · {s.members.length} miembros · {openCards} pendientes
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                </Card>
              );
            })
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 9, padding: 10, color: colors.text, backgroundColor: colors.bgElev }}
            placeholder="Nombre del nuevo espacio…"
            placeholderTextColor={colors.textFaint}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={create}
          />
          <Btn label="Crear" kind="primary" onPress={create} />
        </View>
      </ScrollView>
    </Screen>
  );
}
