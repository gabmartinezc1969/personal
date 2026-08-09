// COL-02 — tablero con secciones (Kanban horizontal) y AUTO-01 simplificado.
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, EmptyState, Btn, IconBtn, MetaPill, Avatar, Chip } from '@/src/components/ui';
import { useStore, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { fmtDateHuman, todayISO, fmtDuration } from '@/src/utils/dates';
import { AutomationAction } from '@/src/types/models';

export default function BoardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [cardDrafts, setCardDrafts] = useState<Record<string, string>>({});
  const [sectionDraft, setSectionDraft] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);
  const [autoVisible, setAutoVisible] = useState(false);
  const [autoSection, setAutoSection] = useState<string | null>(null);
  const [autoAction, setAutoAction] = useState<AutomationAction>('complete');
  const [autoTag, setAutoTag] = useState('');

  const board = state.boards.find((b) => b.id === id);
  if (!board) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Tablero no encontrado" />
      </Screen>
    );
  }

  const space = state.spaces.find((s) => s.id === board.spaceId);
  const sections = [...board.sections].sort((a, b) => a.position - b.position);
  const cardsOf = (sectionId: string) =>
    activeBoardTasks(state)
      .filter((t) => t.boardId === board.id && t.sectionId === sectionId)
      .sort((a, b) => a.position - b.position);

  const removeSection = (sectionId: string, name: string) =>
    Alert.alert('Eliminar sección', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (!actions.deleteSection(board.id, sectionId)) Alert.alert('Sección con tarjetas', 'Mueve o elimina las tarjetas de esta sección primero.');
        },
      },
    ]);

  const moveCard = (cardId: string, currentSectionId: string) =>
    Alert.alert('Mover a…', undefined, [
      ...sections.filter((s) => s.id !== currentSectionId).map((s) => ({ text: s.name, onPress: () => actions.moveBoardCard(cardId, s.id) })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  const saveAutomation = () => {
    if (!autoSection) return;
    if (autoAction === 'tag' && !autoTag.trim()) { Alert.alert('Escribe el valor de la etiqueta'); return; }
    actions.addAutomation(board.id, autoSection, autoAction, autoAction === 'tag' ? autoTag.trim() : undefined);
    setAutoTag('');
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: board.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconBtn icon="flash-outline" onPress={() => { setAutoSection(sections[0]?.id ?? null); setAutoVisible(true); }} />
              <IconBtn icon="add" onPress={() => setShowSectionInput((v) => !v)} />
            </View>
          ),
        }}
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <Text style={{ color: colors.textFaint, fontSize: 12.5 }}>
          {space?.name} · {board.automations.length} automatizaciones
        </Text>
        {showSectionInput && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TextInput
              style={{ flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, padding: 10, color: colors.text, backgroundColor: colors.bgElev }}
              placeholder="Nombre de la nueva sección…"
              placeholderTextColor={colors.textFaint}
              value={sectionDraft}
              onChangeText={setSectionDraft}
              autoFocus
              onSubmitEditing={() => { actions.addSection(board.id, sectionDraft); setSectionDraft(''); setShowSectionInput(false); }}
            />
            <Btn label="Crear" kind="primary" onPress={() => { actions.addSection(board.id, sectionDraft); setSectionDraft(''); setShowSectionInput(false); }} />
          </View>
        )}
      </View>

      <ScrollView horizontal contentContainerStyle={{ padding: 16, gap: 14 }} showsHorizontalScrollIndicator={false}>
        {sections.map((sec) => {
          const cards = cardsOf(sec.id);
          return (
            <View
              key={sec.id}
              style={{ width: 280, backgroundColor: colors.bgElev2, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 10, alignSelf: 'flex-start', maxHeight: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, paddingBottom: 8 }}>
                <Text style={{ flex: 1, fontWeight: '700', color: colors.text }}>{sec.name}</Text>
                <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '600' }}>{cards.length}</Text>
                <IconBtn icon="close" size={14} onPress={() => removeSection(sec.id, sec.name)} />
              </View>
              <ScrollView style={{ flexGrow: 0 }}>
                {cards.map((c) => {
                  const members = space?.members || [];
                  const assignees = c.assignees.map((aid) => members.find((m) => m.id === aid)).filter((m): m is NonNullable<typeof m> => !!m);
                  const checkedN = c.checklist.filter((x) => x.done).length;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => router.push(`/board-task/${c.id}`)}
                      onLongPress={() => moveCard(c.id, sec.id)}
                      style={{ backgroundColor: colors.bgElev, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 10, marginBottom: 8 }}>
                      <Text
                        style={{
                          fontWeight: '600',
                          fontSize: 13.5,
                          color: c.status === 'completed' ? colors.textFaint : colors.text,
                          textDecorationLine: c.status === 'completed' ? 'line-through' : 'none',
                        }}>
                        {c.title}
                      </Text>
                      {(c.priority !== 'none' || c.dueDate || c.checklist.length > 0 || c.comments.length > 0 || c.timeSpentSec > 0 || assignees.length > 0) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7, alignItems: 'center' }}>
                          {c.priority !== 'none' && (
                            <Ionicons name="flag" size={13} color={c.priority === 'high' ? colors.danger : c.priority === 'medium' ? colors.warn : colors.info} />
                          )}
                          {c.dueDate ? <MetaPill icon="calendar-outline" label={fmtDateHuman(c.dueDate)} tone={c.status === 'open' && c.dueDate < todayISO() ? 'overdue' : 'default'} /> : null}
                          {c.checklist.length ? <MetaPill label={`${checkedN}/${c.checklist.length}`} /> : null}
                          {c.comments.length ? <MetaPill icon="chatbubble-outline" label={String(c.comments.length)} /> : null}
                          {c.timeSpentSec ? <MetaPill icon="time-outline" label={fmtDuration(c.timeSpentSec)} /> : null}
                          <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                            {assignees.map((m) => (
                              <View key={m.id} style={{ marginLeft: -6 }}>
                                <Avatar name={m.name} size={20} />
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                style={{ padding: 8, color: colors.text, fontSize: 13 }}
                placeholder="+ Añadir tarjeta"
                placeholderTextColor={colors.textFaint}
                value={cardDrafts[sec.id] || ''}
                onChangeText={(v) => setCardDrafts((prev) => ({ ...prev, [sec.id]: v }))}
                onSubmitEditing={() => { actions.addBoardCard(board.id, sec.id, cardDrafts[sec.id] || ''); setCardDrafts((prev) => ({ ...prev, [sec.id]: '' })); }}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          );
        })}
      </ScrollView>
      <Text style={{ color: colors.textFaint, fontSize: 11.5, textAlign: 'center', paddingBottom: 10 }}>
        Mantén pulsada una tarjeta para moverla de sección.
      </Text>

      <Modal visible={autoVisible} transparent animationType="slide" onRequestClose={() => setAutoVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,14,17,0.45)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bgElev, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 36 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Automatizaciones</Text>
            <Text style={{ color: colors.textFaint, fontSize: 12.5, marginBottom: 12 }}>
              Reglas locales «cuando se mueve a sección → acción» (AUTO-01 simplificado).
            </Text>
            {board.automations.map((a) => {
              const trig = board.sections.find((s) => s.id === a.triggerSectionId);
              return (
                <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                  <Text style={{ flex: 1, color: colors.text, fontSize: 13 }}>
                    Al mover a <Text style={{ fontWeight: '700' }}>{trig?.name}</Text> →{' '}
                    {a.action === 'complete' ? 'marcar completada' : `etiqueta "${a.tagValue}"`}
                  </Text>
                  <IconBtn icon="close" size={16} onPress={() => actions.deleteAutomation(board.id, a.id)} />
                </View>
              );
            })}
            <Text style={{ fontWeight: '700', fontSize: 12, color: colors.textDim, marginTop: 12, marginBottom: 6 }}>NUEVA REGLA — cuando se mueve a:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
              {sections.map((s) => (
                <Chip key={s.id} label={s.name} selected={autoSection === s.id} onPress={() => setAutoSection(s.id)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 7, marginBottom: 10 }}>
              <Chip label="Marcar completada" selected={autoAction === 'complete'} onPress={() => setAutoAction('complete')} />
              <Chip label="Añadir etiqueta" selected={autoAction === 'tag'} onPress={() => setAutoAction('tag')} />
            </View>
            {autoAction === 'tag' && (
              <TextInput
                style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, padding: 10, color: colors.text, marginBottom: 10 }}
                placeholder="Etiqueta (ej. revisado)"
                placeholderTextColor={colors.textFaint}
                value={autoTag}
                onChangeText={setAutoTag}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Btn label="Cerrar" onPress={() => setAutoVisible(false)} />
              <Btn label="Añadir regla" kind="primary" onPress={saveAutomation} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
