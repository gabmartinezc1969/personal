// PLAN-02 — Mi Día, con la dirección visual "Rumbo Dark": fondo negro-violeta
// con resplandor ambiental, tarjeta héroe estilo "posición" con CTA en
// degradado, tiles de métricas planas y pastillas de variación en verde menta.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn, MetaPill, DeltaPill, Card } from '@/src/components/ui';
import { TaskRow } from '@/src/components/TaskRow';
import { QuickAdd } from '@/src/components/QuickAdd';
import { useStore, activeTasks, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { FONTS } from '@/src/theme/fonts';
import { todayISO, addDays, fmtDateLong, fmtDateHuman, isOverdue, fmtTime } from '@/src/utils/dates';
import { computeStreak } from '@/src/utils/stats';

export default function MyDayScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [date, setDate] = useState(todayISO());
  const isToday = date === todayISO();
  const today = todayISO();

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
        .filter((t) => t.status === 'open' && !bucket.taskIds.includes(t.id) && (t.dueDate === date || (isToday && isOverdue(t.dueDate, t.dueTime, t.status))))
        .slice(0, 8),
    [state, bucket.taskIds, date, isToday]
  );

  const listOf = (listId: string) => state.lists.find((l) => l.id === listId);

  const { streak, doneToday, dueToday, openTotal } = useMemo(() => {
    const dates = [
      ...activeTasks(state).filter((t) => t.completedAt).map((t) => t.completedAt as string),
      ...activeBoardTasks(state).filter((t) => t.completedAt).map((t) => t.completedAt as string),
    ];
    const t = activeTasks(state);
    return {
      streak: computeStreak(dates),
      doneToday: t.filter((x) => x.status === 'completed' && x.completedAt?.slice(0, 10) === today).length,
      dueToday: t.filter((x) => x.dueDate === today).length,
      openTotal: t.filter((x) => x.status === 'open').length,
    };
  }, [state, today]);

  const heroTask = useMemo(() => {
    const pool = open.length ? open : suggestions;
    const order = { high: 0, medium: 1, low: 2, none: 3 } as const;
    return [...pool].sort((a, b) => order[a.priority] - order[b.priority] || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))[0];
  }, [open, suggestions]);
  const heroSubDone = heroTask ? heroTask.subtasks.filter((s) => s.done).length : 0;
  const heroSubTotal = heroTask ? heroTask.subtasks.length : 0;
  const heroProgress = heroSubTotal > 0 ? heroSubDone / heroSubTotal : 0;

  const goalTotal = Math.max(dueToday, 1);
  const goalPct = Math.min(1, doneToday / goalTotal);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.semi, fontSize: 13, color: colors.textFaint }}>Hola, {state.user.name}</Text>
            <Text style={{ fontFamily: FONTS.black, fontSize: 24, color: colors.text, marginTop: 1 }}>Resumen de hoy</Text>
          </View>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person" size={18} color={colors.textDim} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <StatTile icon="flame" value={String(streak)} label="racha (días)" />
          <StatTile icon="checkmark-done" value={`${doneToday}/${dueToday}`} label="hechas hoy" />
          <StatTile icon="albums" value={String(openTotal)} label="pendientes" />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <IconBtn icon="chevron-back" onPress={() => setDate(addDays(date, -1))} />
          <Text style={{ flex: 1, textAlign: 'center', fontFamily: FONTS.extra, color: colors.text, textTransform: 'capitalize' }}>{fmtDateLong(date)}</Text>
          <IconBtn icon="chevron-forward" onPress={() => setDate(addDays(date, 1))} />
          {!isToday ? <Btn label="Hoy" small onPress={() => setDate(todayISO())} /> : null}
        </View>

        {heroTask && (
          <Pressable onPress={() => router.push(`/task/${heroTask.id}`)} style={{ marginBottom: 18 }}>
            <View style={{ backgroundColor: colors.bgElev, borderColor: colors.border, borderWidth: 1, borderRadius: 22, padding: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 11.5, color: colors.textFaint, letterSpacing: 0.6 }}>TU PRIORIDAD DE HOY</Text>
                  <Text style={{ fontFamily: FONTS.extra, fontSize: 20, color: colors.text, marginTop: 4 }} numberOfLines={2}>
                    {heroTask.title}
                  </Text>
                </View>
                {heroSubTotal > 0 ? <DeltaPill value={heroProgress * 100} suffix="" /> : null}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 14 }}>
                <Text style={{ color: colors.textDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>{listOf(heroTask.listId)?.name}</Text>
                {heroTask.dueTime ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="time-outline" size={12} color={colors.textFaint} />
                    <Text style={{ color: colors.textDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>{fmtTime(heroTask.dueTime)}</Text>
                  </View>
                ) : null}
                {heroSubTotal > 0 ? (
                  <Text style={{ color: colors.textDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>
                    {heroSubDone}/{heroSubTotal} subtareas
                  </Text>
                ) : null}
              </View>

              {heroSubTotal > 0 && (
                <View style={{ height: 8, borderRadius: 5, backgroundColor: colors.bgElev2, marginBottom: 14, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.max(6, heroProgress * 100)}%`, height: '100%', backgroundColor: colors.brand, borderRadius: 5 }} />
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Btn label="Continuar" kind="primary" onPress={() => router.push(`/task/${heroTask.id}`)} style={{ flex: 1 }} />
                {!bucket.taskIds.includes(heroTask.id) && (
                  <Btn label="Añadir a Mi Día" onPress={() => actions.toggleMyDay(heroTask.id, date)} style={{ flex: 1 }} />
                )}
              </View>
            </View>
          </Pressable>
        )}

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.brandDim, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trophy" size={20} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 13.5, color: colors.text }}>
              {dueToday > 0 ? `Completar tus ${dueToday} tareas de hoy` : 'Sin tareas programadas para hoy'}
            </Text>
            <View style={{ height: 6, borderRadius: 4, backgroundColor: colors.bgElev2, marginTop: 7, overflow: 'hidden' }}>
              <View style={{ width: `${goalPct * 100}%`, height: '100%', backgroundColor: colors.ok, borderRadius: 4 }} />
            </View>
          </View>
          {dueToday > 0 && (
            <Text style={{ fontFamily: FONTS.extra, fontSize: 14, color: doneToday >= dueToday ? colors.ok : colors.textDim }}>
              {doneToday}/{dueToday}
            </Text>
          )}
        </Card>

        <QuickAdd placeholder="Añadir tarea a Mi Día…" onSubmit={(text) => actions.quickAddMyDay(date, text)} />

        {open.length === 0 && !heroTask ? (
          <EmptyState icon="sunny-outline" title="Mi Día está vacío" subtitle="Añade tareas o acepta una sugerencia de abajo." />
        ) : (
          open
            .filter((t) => t.id !== heroTask?.id)
            .map((t) => (
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

        {suggestions.filter((t) => t.id !== heroTask?.id).length > 0 && (
          <>
            <SectionHeader title="Sugerencias" />
            {suggestions.filter((t) => t.id !== heroTask?.id).map((t) => (
              <View
                key={t.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: colors.bgElev,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 8,
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.bold, color: colors.text }}>{t.title}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <MetaPill icon="calendar-outline" label={fmtDateHuman(t.dueDate!)} tone={isOverdue(t.dueDate, t.dueTime, t.status) ? 'overdue' : 'today'} />
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

function StatTile({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgElev, borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}>
      <Ionicons name={icon} size={16} color={colors.brand} />
      <Text style={{ fontFamily: FONTS.black, fontSize: 17, color: colors.text, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontFamily: FONTS.semi, fontSize: 10, color: colors.textFaint, marginTop: 1 }}>{label}</Text>
    </View>
  );
}
