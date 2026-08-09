// CAL-01 (simplificado) — calendario mensual de tareas y tarjetas propias.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn } from '@/src/components/ui';
import { TaskRow } from '@/src/components/TaskRow';
import { useStore, activeTasks, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { isoDate, todayISO, WEEKDAYS, fmtDateLong } from '@/src/utils/dates';

export default function CalendarScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayISO());

  const weekStart = state.settings.weekStart || 1;

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startOffset = (first.getDay() - weekStart + 7) % 7;
    const gridStart = new Date(cursor.y, cursor.m, 1 - startOffset);
    const list: { iso: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      list.push({ iso: isoDate(d), day: d.getDate(), inMonth: d.getMonth() === cursor.m });
    }
    return { cells: list, monthLabel: first.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) };
  }, [cursor, weekStart]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    activeTasks(state).forEach((t) => { if (t.dueDate) map[t.dueDate] = (map[t.dueDate] || 0) + 1; });
    activeBoardTasks(state).forEach((t) => { if (t.dueDate) map[t.dueDate] = (map[t.dueDate] || 0) + 1; });
    return map;
  }, [state]);

  const dayTasks = activeTasks(state).filter((t) => t.dueDate === selected);
  const dayCards = activeBoardTasks(state).filter((t) => t.dueDate === selected);
  const dowLabels = Array.from({ length: 7 }, (_, i) => WEEKDAYS[(weekStart + i) % 7]);
  const today = todayISO();

  const prev = () => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  const next = () => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconBtn icon="chevron-back" onPress={prev} />
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: colors.text, textTransform: 'capitalize' }}>
            {monthLabel}
          </Text>
          <IconBtn icon="chevron-forward" onPress={next} />
          <Btn label="Hoy" small onPress={() => { const d = new Date(); setCursor({ y: d.getFullYear(), m: d.getMonth() }); setSelected(todayISO()); }} />
        </View>

        <View style={{ flexDirection: 'row' }}>
          {dowLabels.map((d) => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textFaint, marginBottom: 4 }}>
              {d}
            </Text>
          ))}
        </View>
        {Array.from({ length: 6 }, (_, week) => (
          <View key={week} style={{ flexDirection: 'row' }}>
            {cells.slice(week * 7, week * 7 + 7).map((c) => {
              const count = tasksByDate[c.iso] || 0;
              const isSel = c.iso === selected;
              const isToday = c.iso === today;
              return (
                <Pressable
                  key={c.iso}
                  onPress={() => setSelected(c.iso)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    margin: 2,
                    borderRadius: 9,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSel ? colors.brand : isToday ? colors.brandDim : colors.bgElev,
                    borderWidth: 1,
                    borderColor: isSel ? colors.brand : colors.border,
                    opacity: c.inMonth ? 1 : 0.35,
                  }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: isSel ? colors.onBrand : isToday ? colors.brandStrong : colors.textDim }}>
                    {c.day}
                  </Text>
                  {count > 0 && (
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? colors.onBrand : colors.brand, marginTop: 2 }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <SectionHeader title={fmtDateLong(selected)} />
        {dayTasks.length === 0 && dayCards.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Nada programado" subtitle="Las tareas con fecha de este día aparecerán aquí." />
        ) : (
          <>
            {dayTasks.map((t) => (
              <TaskRow key={t.id} task={t} list={state.lists.find((l) => l.id === t.listId)} onPress={() => router.push(`/task/${t.id}`)} onToggle={() => actions.toggleTaskStatus(t.id)} />
            ))}
            {dayCards.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/board-task/${c.id}`)}
                style={{ backgroundColor: colors.bgElev, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 11, marginBottom: 7 }}>
                <Text style={{ fontWeight: '600', color: c.status === 'completed' ? colors.textFaint : colors.text, textDecorationLine: c.status === 'completed' ? 'line-through' : 'none' }}>
                  {c.title}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 11.5, marginTop: 3 }}>
                  Tablero: {state.boards.find((b) => b.id === c.boardId)?.name}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
