// COL-01 — detalle de espacio: tableros y miembros.
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, SectionHeader, EmptyState, Btn, Card, Avatar, IconBtn } from '@/src/components/ui';
import { useStore, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { SpaceRole } from '@/src/types/models';

const ROLE_LABELS: Record<SpaceRole, string> = { admin: 'Admin', member: 'Miembro', guest: 'Invitado' };

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [memberDraft, setMemberDraft] = useState('');
  const [boardDraft, setBoardDraft] = useState('');

  const space = state.spaces.find((s) => s.id === id);
  if (!space) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Espacio no encontrado" />
      </Screen>
    );
  }

  const boards = state.boards.filter((b) => b.spaceId === space.id).sort((a, b) => a.position - b.position);

  const changeRole = (memberId: string, name: string) =>
    Alert.alert('Rol de ' + name, undefined, [
      ...(['admin', 'member', 'guest'] as SpaceRole[]).map((r) => ({ text: ROLE_LABELS[r], onPress: () => actions.setMemberRole(space.id, memberId, r) })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: space.name }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <SectionHeader title="Tableros" />
        {boards.length === 0 ? (
          <Text style={{ color: colors.textFaint, marginBottom: 8 }}>Sin tableros todavía.</Text>
        ) : (
          boards.map((b) => {
            const cards = activeBoardTasks(state).filter((t) => t.boardId === b.id);
            return (
              <Card key={b.id} onPress={() => router.push(`/board/${b.id}`)} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="grid-outline" size={18} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{b.name}</Text>
                  <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                    {cards.filter((c) => c.status === 'open').length} pendientes · {cards.length} en total
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
              </Card>
            );
          })
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 9, padding: 10, color: colors.text, backgroundColor: colors.bgElev }}
            placeholder="Nombre del nuevo tablero…"
            placeholderTextColor={colors.textFaint}
            value={boardDraft}
            onChangeText={setBoardDraft}
            onSubmitEditing={() => { if (boardDraft.trim()) { const bid = actions.addBoard(space.id, boardDraft); setBoardDraft(''); router.push(`/board/${bid}`); } }}
          />
          <Btn label="Crear" kind="primary" onPress={() => { if (boardDraft.trim()) { const bid = actions.addBoard(space.id, boardDraft); setBoardDraft(''); router.push(`/board/${bid}`); } }} />
        </View>

        <SectionHeader title={`Miembros (${space.members.length})`} />
        {space.members.map((m) => (
          <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 }}>
            <Avatar name={m.name} size={30} />
            <Text style={{ flex: 1, fontWeight: '600', color: colors.text }}>{m.name}</Text>
            <Btn label={ROLE_LABELS[m.role]} small onPress={() => changeRole(m.id, m.name)} />
            <IconBtn icon="close" size={16} onPress={() => actions.removeMember(space.id, m.id)} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 9, padding: 10, color: colors.text, backgroundColor: colors.bgElev }}
            placeholder="Nombre del miembro…"
            placeholderTextColor={colors.textFaint}
            value={memberDraft}
            onChangeText={setMemberDraft}
            onSubmitEditing={() => { actions.addMember(space.id, memberDraft); setMemberDraft(''); }}
          />
          <Btn label="Añadir" kind="primary" onPress={() => { actions.addMember(space.id, memberDraft); setMemberDraft(''); }} />
        </View>
        <Text style={{ color: colors.textFaint, fontSize: 11.5, marginTop: 10 }}>
          Miembros de referencia local, sin invitaciones ni inicio de sesión (PLT-01 fuera de alcance).
        </Text>
      </ScrollView>
    </Screen>
  );
}
