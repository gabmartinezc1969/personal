// PLAN-02 — Mi Día: selección diaria privada, fijados y sugerencias.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn, MetaPill } from '@/src/components/ui';
import { TaskRow } from '@/src/components/TaskRow';
import { QuickAdd } from '@/src/components/QuickAdd';
import { useStore, activeTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { todayISO, addDays, fmtDateLong, fmtDateHuman, isOverdue } from '@/src/utils/dates';

export default function MyDayScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [date, setDate] = useState(todayISO());
  const isToday = date === todayISO();

  const bucket = state.myDay[date] || { taskIds: [], pinnedIds: [] };
  const tasks = useMemo(() => {
    const all = activeTasks(state);
    return bucket.taskIds.map((id) => all.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);
  }, [state, bucket.taskIds]);

  const open = tasks
    .filter((t) => t.status === 'open')
    .sort((a, b) => (bucket.pinnedIds.includes(b.id) ? 1 : 0) - (bucket.pinnedIds.includes(a.id) ? 1 : 0) || a.position - b.position);
  const done = tasks.filter((t) => t.status === 'completed');

  const suggestions = useMemo(
    () =>
      activeTasks(state)
        .filter(
          (t) =>
            t.status === 'open' &&
            !bucket.taskIds.includes(t.id) &&
            (t.dueDate === date || (isToday && isOverdue(t.dueDate, t.dueTime, t.status)))
        )
        .slice(0, 8),
    [state, bucket.taskIds, date, isToday]
  );

  const listOf = (listId: string) => state.lists.find((l) => l.id === listId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <IconBtn icon="chevron-back" onPress={() => setDate(addDays(date, -1))} />
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', color: colors.text, textTransform: 'capitalize' }}>
            {fmtDateLong(date)}
          </Text>
          <IconBtn icon="chevron-forward" onPress={() => setDate(addDays(date, 1))} />
          {!isToday ? <Btn label="Hoy" small onPress={() => setDate(todayISO())} /> : null}
        </View>

        <QuickAdd placeholder="Añadir tarea a Mi Día…" onSubmit={(text) => actions.quickAddMyDay(date, text)} />

        {open.length === 0 ? (
          <EmptyState icon="sunny-outline" title="Mi Día está vacío" subtitle="Añade tareas o acepta una sugerencia de abajo." />
        ) : (
          open.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              list={listOf(t.listId)}
              onPress={() => router.push(`/task/${t.id}`)}
              onToggle={() => actions.toggleTaskStatus(t.id)}
              inMyDay
              onToggleMyDay={() => actions.toggleMyDay(t.id, date)}
            />
          ))
        )}

        {suggestions.length > 0 && (
          <>
            <SectionHeader title="Sugerencias" />
            {suggestions.map((t) => (
              <View
                key={t.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: colors.bgElev,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 11,
                  marginBottom: 7,
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>{t.title}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <MetaPill
                      icon="calendar-outline"
                      label={fmtDateHuman(t.dueDate!)}
                      tone={isOverdue(t.dueDate, t.dueTime, t.status) ? 'overdue' : 'today'}
                    />
                  </View>
                </View>
                <Btn label="Añadir" small kind="primary" onPress={() => actions.toggleMyDay(t.id, date)} />
              </View>
            ))}
          </>
        )}

        {done.length > 0 && (
          <>
            <SectionHeader title={`Completadas (${done.length})`} />
            {done.map((t) => (
              <TaskRow key={t.id} task={t} list={listOf(t.listId)} onPress={() => router.push(`/task/${t.id}`)} onToggle={() => actions.toggleTaskStatus(t.id)} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
