// CORE-01 + PLAN-01 + TIME-01 + AI-01 — detalle de tarea personal.
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, Platform, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn, Chip, CheckCircle, PRIORITY_META } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { aiSuggestSubtasks } from '@/src/utils/ai';
import {
  isoDate,
  parseISODate,
  fmtDuration,
  fmtDateHuman,
  fmtTime,
  WEEKDAYS,
  FREQ_LABELS,
} from '@/src/utils/dates';
import { Priority, RecFreq } from '@/src/types/models';

const REMINDER_OFFSETS: { v: number; label: string }[] = [
  { v: 0, label: 'A la hora exacta' },
  { v: 15, label: '15 min antes' },
  { v: 30, label: '30 min antes' },
  { v: 60, label: '1 hora antes' },
  { v: 1440, label: '1 día antes' },
];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const task = state.tasks.find((t) => t.id === id);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [aiVisible, setAiVisible] = useState(false);
  const [aiItems, setAiItems] = useState<string[]>([]);
  const [, forceTick] = useState(0);

  // refresco del temporizador en vivo
  useEffect(() => {
    if (!task?.timerStartedAt) return;
    const iv = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, [task?.timerStartedAt]);

  if (!task || task.deletedAt) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Tarea no encontrada" />
      </Screen>
    );
  }

  const list = state.lists.find((l) => l.id === task.listId);
  const elapsed = task.timeSpentSec + (task.timerStartedAt ? (Date.now() - new Date(task.timerStartedAt).getTime()) / 1000 : 0);

  const confirmDelete = () =>
    Alert.alert('Eliminar tarea', 'Se moverá a la papelera y podrás restaurarla luego.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { actions.deleteTask(task.id); router.back(); } },
    ]);

  const convertToBoard = () => {
    if (!state.boards.length) {
      Alert.alert('Sin tableros', 'Crea primero un espacio y un tablero en la pestaña Más.');
      return;
    }
    Alert.alert(
      'Convertir a tarjeta',
      'Elige el tablero destino. La tarea personal se archivará.',
      [
        ...state.boards.map((b) => ({
          text: `${state.spaces.find((s) => s.id === b.spaceId)?.name || ''} / ${b.name}`,
          onPress: () => {
            actions.convertToBoardTask(task.id, b.id);
            router.back();
          },
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  };

  const openAi = () => {
    setAiItems(aiSuggestSubtasks(task.title));
    setAiVisible(true);
  };

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
          title: list?.name || 'Tarea',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconBtn icon="sparkles-outline" onPress={openAi} />
              <IconBtn icon="swap-horizontal-outline" onPress={convertToBoard} />
              <IconBtn icon="trash-outline" onPress={confirmDelete} />
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
          <View style={{ marginTop: 8 }}>
            <CheckCircle checked={task.status === 'completed'} priority={task.priority} onPress={() => actions.toggleTaskStatus(task.id)} />
          </View>
          <TextInput
            style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, paddingVertical: 6 }}
            value={task.title}
            onChangeText={(v) => actions.updateTaskTitle(task.id, v)}
            multiline
            placeholder="Título"
            placeholderTextColor={colors.textFaint}
          />
        </View>

        <TextInput
          style={[inputStyle, { minHeight: 70, textAlignVertical: 'top', backgroundColor: colors.bgElev2 }]}
          value={task.note}
          onChangeText={(v) => actions.updateTaskNote(task.id, v)}
          multiline
          placeholder="Añadir nota…"
          placeholderTextColor={colors.textFaint}
        />

        <SectionHeader title="Prioridad" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
            <Chip key={p} label={PRIORITY_META[p].label} selected={task.priority === p} onPress={() => actions.setTaskPriority(task.id, p)} />
          ))}
        </View>

        <SectionHeader title="Fecha y hora" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn
            label={task.dueDate ? fmtDateHuman(task.dueDate) : 'Añadir fecha'}
            icon="calendar-outline"
            onPress={() => setShowDatePicker(true)}
            style={{ flex: 1 }}
          />
          <Btn
            label={task.dueTime ? fmtTime(task.dueTime) : 'Hora'}
            icon="time-outline"
            onPress={() => (task.dueDate ? setShowTimePicker(true) : Alert.alert('Primero añade una fecha'))}
            style={{ flex: 1 }}
          />
          {task.dueDate ? <IconBtn icon="close-circle-outline" onPress={() => actions.setTaskSchedule(task.id, { dueDate: null })} /> : null}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={task.dueDate ? parseISODate(task.dueDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, d) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (event.type !== 'dismissed' && d) actions.setTaskSchedule(task.id, { dueDate: isoDate(d) });
              if (Platform.OS === 'ios') setShowDatePicker(false);
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${task.dueTime || '09:00'}:00`)}
            mode="time"
            display="default"
            onChange={(event, d) => {
              setShowTimePicker(false);
              if (event.type !== 'dismissed' && d) {
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                actions.setTaskSchedule(task.id, { dueTime: `${hh}:${mm}` });
              }
            }}
          />
        )}

        {task.dueDate ? (
          <>
            <SectionHeader title="Recordarme" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              <Chip label="Sin recordatorio" selected={task.reminderOffset == null} onPress={() => actions.setTaskSchedule(task.id, { reminderOffset: null })} />
              {REMINDER_OFFSETS.map((o) => (
                <Chip key={o.v} label={o.label} selected={task.reminderOffset === o.v} onPress={() => actions.setTaskSchedule(task.id, { reminderOffset: o.v })} />
              ))}
            </View>

            <SectionHeader title="Repetir" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {(Object.keys(FREQ_LABELS) as RecFreq[]).map((f) => (
                <Chip key={f} label={FREQ_LABELS[f]} selected={task.recurrence.freq === f} onPress={() => actions.setTaskRecurrenceFreq(task.id, f)} />
              ))}
            </View>
            {task.recurrence.freq === 'custom' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                {WEEKDAYS.map((w, i) => (
                  <Chip key={w} label={w} selected={task.recurrence.byweekday.includes(i)} onPress={() => actions.toggleTaskWeekday(task.id, i)} />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={{ color: colors.textFaint, fontSize: 12.5, marginTop: 10 }}>Añade una fecha para configurar recordatorio y repetición.</Text>
        )}

        <SectionHeader title="Subtareas" />
        {task.subtasks.map((s) => (
          <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
            <CheckCircle checked={s.done} onPress={() => actions.toggleSubtask(task.id, s.id)} size={19} />
            <TextInput
              style={{
                flex: 1,
                color: s.done ? colors.textFaint : colors.text,
                textDecorationLine: s.done ? 'line-through' : 'none',
                paddingVertical: 3,
              }}
              value={s.title}
              onChangeText={(v) => actions.updateSubtaskTitle(task.id, s.id, v)}
            />
            <IconBtn icon="close" size={16} onPress={() => actions.deleteSubtask(task.id, s.id)} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={{ width: 19 }} />
          <TextInput
            style={{ flex: 1, color: colors.text, paddingVertical: 6 }}
            placeholder="Añadir subtarea…"
            placeholderTextColor={colors.textFaint}
            value={subtaskDraft}
            onChangeText={setSubtaskDraft}
            onSubmitEditing={() => { actions.addSubtask(task.id, subtaskDraft); setSubtaskDraft(''); }}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        </View>

        <SectionHeader title="Etiquetas" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
          {task.tags.map((t) => (
            <Chip key={t} label={'#' + t} onPress={() => actions.removeTag(task.id, t)} />
          ))}
        </View>
        <TextInput
          style={inputStyle}
          placeholder="Añadir etiqueta y Enter…"
          placeholderTextColor={colors.textFaint}
          value={tagDraft}
          onChangeText={setTagDraft}
          onSubmitEditing={() => { actions.addTag(task.id, tagDraft); setTagDraft(''); }}
          returnKeyType="done"
        />

        <SectionHeader title="Tiempo" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bgElev2,
            borderRadius: 10,
            padding: 12,
          }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] }}>{fmtDuration(elapsed)}</Text>
          <Btn
            label={task.timerStartedAt ? 'Detener' : 'Iniciar'}
            icon={task.timerStartedAt ? 'pause' : 'play'}
            kind={task.timerStartedAt ? 'danger' : 'primary'}
            small
            onPress={() => actions.toggleTimer('task', task.id)}
          />
        </View>

        <Text style={{ color: colors.textFaint, fontSize: 11.5, marginTop: 24 }}>
          Creada {task.createdAt.slice(0, 10)} · Actualizada {task.updatedAt.slice(0, 10)} · v{task.version}
        </Text>
      </ScrollView>

      <Modal visible={aiVisible} transparent animationType="fade" onRequestClose={() => setAiVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,14,17,0.45)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.bgElev, borderRadius: 16, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
              <Ionicons name="sparkles" size={15} color={colors.brand} /> Sugerencias de subtareas
            </Text>
            <Text style={{ color: colors.textFaint, fontSize: 12.5, marginBottom: 14 }}>
              Heurística local (AI-01 simplificado). Nada se añade automáticamente: acepta o rechaza cada una.
            </Text>
            {aiItems.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 }}>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>{s}</Text>
                <Pressable
                  onPress={() => { actions.addSubtask(task.id, s); setAiItems((prev) => prev.filter((_, j) => j !== i)); }}
                  hitSlop={8}>
                  <Ionicons name="checkmark-circle" size={26} color={colors.ok} />
                </Pressable>
                <Pressable onPress={() => setAiItems((prev) => prev.filter((_, j) => j !== i))} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={26} color={colors.textFaint} />
                </Pressable>
              </View>
            ))}
            {aiItems.length === 0 && <Text style={{ color: colors.textFaint, paddingVertical: 8 }}>No quedan sugerencias.</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Btn label="Listo" kind="primary" onPress={() => setAiVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
