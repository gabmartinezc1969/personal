// COL-02/03 + TIME-01 — detalle de tarjeta: checklist, asignados, comentarios, actividad.
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn, Chip, CheckCircle, Avatar, PRIORITY_META } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { isoDate, parseISODate, fmtDateHuman, fmtDuration } from '@/src/utils/dates';
import { Priority } from '@/src/types/models';

export default function BoardTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const { colors } = useTheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkDraft, setCheckDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [, forceTick] = useState(0);

  const card = state.boardTasks.find((t) => t.id === id);

  useEffect(() => {
    if (!card?.timerStartedAt) return;
    const iv = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, [card?.timerStartedAt]);

  if (!card || card.deletedAt) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Tarjeta no encontrada" />
      </Screen>
    );
  }

  const board = state.boards.find((b) => b.id === card.boardId);
  const space = board ? state.spaces.find((s) => s.id === board.spaceId) : undefined;
  const members = space?.members || [];
  const section = board?.sections.find((s) => s.id === card.sectionId);
  const elapsed = card.timeSpentSec + (card.timerStartedAt ? (Date.now() - new Date(card.timerStartedAt).getTime()) / 1000 : 0);

  const confirmDelete = () =>
    Alert.alert('Eliminar tarjeta', 'Se moverá a la papelera.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { actions.deleteBoardTask(card.id); router.back(); } },
    ]);

  const moveSection = () =>
    Alert.alert('Mover a…', undefined, [
      ...(board?.sections || []).filter((s) => s.id !== card.sectionId).map((s) => ({ text: s.name, onPress: () => actions.moveBoardCard(card.id, s.id) })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 9,
    padding: 11,
    color: colors.text,
    backgroundColor: colors.bgElev,
  } as const;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: board?.name || 'Tarjeta',
          headerRight: () => <IconBtn icon="trash-outline" onPress={confirmDelete} />,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
          <View style={{ marginTop: 8 }}>
            <CheckCircle checked={card.status === 'completed'} priority={card.priority} onPress={() => actions.toggleBoardTaskStatus(card.id)} />
          </View>
          <TextInput
            style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, paddingVertical: 6 }}
            value={card.title}
            onChangeText={(v) => actions.updateBoardTaskTitle(card.id, v)}
            multiline
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 34, marginBottom: 14 }}>
          <Text style={{ color: colors.textFaint, fontSize: 12.5 }}>Sección:</Text>
          <Btn label={section?.name || '—'} small onPress={moveSection} />
        </View>

        <TextInput
          style={[inputStyle, { minHeight: 70, textAlignVertical: 'top', backgroundColor: colors.bgElev2 }]}
          value={card.note}
          onChangeText={(v) => actions.updateBoardTaskNote(card.id, v)}
          multiline
          placeholder="Añadir nota…"
          placeholderTextColor={colors.textFaint}
        />

        <SectionHeader title="Prioridad" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
            <Chip key={p} label={PRIORITY_META[p].label} selected={card.priority === p} onPress={() => actions.setBoardTaskPriority(card.id, p)} />
          ))}
        </View>

        <SectionHeader title="Asignados" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {members.length === 0 ? (
            <Text style={{ color: colors.textFaint, fontSize: 12.5 }}>Sin miembros en este espacio.</Text>
          ) : (
            members.map((m) => (
              <Chip key={m.id} label={m.name} selected={card.assignees.includes(m.id)} onPress={() => actions.toggleAssignee(card.id, m.id)} />
            ))
          )}
        </View>

        <SectionHeader title="Fecha" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn label={card.dueDate ? fmtDateHuman(card.dueDate) : 'Añadir fecha'} icon="calendar-outline" onPress={() => setShowDatePicker(true)} style={{ flex: 1 }} />
          {card.dueDate ? <IconBtn icon="close-circle-outline" onPress={() => actions.setBoardTaskSchedule(card.id, { dueDate: null })} /> : null}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={card.dueDate ? parseISODate(card.dueDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, d) => {
              setShowDatePicker(false);
              if (event.type !== 'dismissed' && d) actions.setBoardTaskSchedule(card.id, { dueDate: isoDate(d) });
            }}
          />
        )}

        <SectionHeader title="Checklist" />
        {card.checklist.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
            <CheckCircle checked={c.done} onPress={() => actions.toggleChecklistItem(card.id, c.id)} size={19} />
            <TextInput
              style={{ flex: 1, color: c.done ? colors.textFaint : colors.text, textDecorationLine: c.done ? 'line-through' : 'none', paddingVertical: 3 }}
              value={c.title}
              onChangeText={(v) => actions.updateChecklistTitle(card.id, c.id, v)}
            />
            <IconBtn icon="close" size={16} onPress={() => actions.deleteChecklistItem(card.id, c.id)} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={{ width: 19 }} />
          <TextInput
            style={{ flex: 1, color: colors.text, paddingVertical: 6 }}
            placeholder="Añadir elemento…"
            placeholderTextColor={colors.textFaint}
            value={checkDraft}
            onChangeText={setCheckDraft}
            onSubmitEditing={() => { actions.addChecklistItem(card.id, checkDraft); setCheckDraft(''); }}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        </View>

        <SectionHeader title="Etiquetas" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
          {card.tags.map((t) => (
            <Chip key={t} label={'#' + t} onPress={() => actions.removeBtTag(card.id, t)} />
          ))}
        </View>
        <TextInput
          style={inputStyle}
          placeholder="Añadir etiqueta y Enter…"
          placeholderTextColor={colors.textFaint}
          value={tagDraft}
          onChangeText={setTagDraft}
          onSubmitEditing={() => { actions.addBtTag(card.id, tagDraft); setTagDraft(''); }}
          returnKeyType="done"
        />

        <SectionHeader title="Tiempo" />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgElev2, borderRadius: 10, padding: 12 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] }}>{fmtDuration(elapsed)}</Text>
          <Btn
            label={card.timerStartedAt ? 'Detener' : 'Iniciar'}
            icon={card.timerStartedAt ? 'pause' : 'play'}
            kind={card.timerStartedAt ? 'danger' : 'primary'}
            small
            onPress={() => actions.toggleTimer('boardTask', card.id)}
          />
        </View>

        <SectionHeader title={`Comentarios (${card.comments.length})`} />
        {card.comments.map((c) => (
          <View key={c.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Avatar name={c.author} size={22} />
              <Text style={{ fontWeight: '700', fontSize: 13, color: colors.text }}>{c.author}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 11 }}>
                {new Date(c.at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={{ color: colors.text, marginTop: 4, marginLeft: 30 }}>{c.body}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="Escribe un comentario…"
            placeholderTextColor={colors.textFaint}
            value={commentDraft}
            onChangeText={setCommentDraft}
            onSubmitEditing={() => { actions.addComment(card.id, commentDraft); setCommentDraft(''); }}
          />
          <Btn label="Enviar" kind="primary" onPress={() => { actions.addComment(card.id, commentDraft); setCommentDraft(''); }} />
        </View>

        <SectionHeader title="Actividad" />
        {[...card.activity].reverse().slice(0, 12).map((a) => (
          <View key={a.id} style={{ flexDirection: 'row', gap: 8, paddingVertical: 5 }}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textFaint} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textDim, fontSize: 12.5 }}>{a.text}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 10.5 }}>
                {new Date(a.at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
