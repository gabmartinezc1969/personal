// PLAN-02 — Mi Día, con la dirección visual "Rumbo Play": saludo + franja en
// degradado, fila de métricas reales (racha, hoy, pendientes), tarjeta héroe
// verde bosque con la tarea prioritaria y una meta del día basada en datos reales.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn, MetaPill } from '@/src/components/ui';
import { TaskRow } from '@/src/components/TaskRow';
import { QuickAdd } from '@/src/components/QuickAdd';
import { useStore, activeTasks, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { FONTS } from '@/src/theme/fonts';
import { todayISO, addDays, fmtDateLong, fmtDateHuman, isOverdue, fmtTime } from '@/src/utils/dates';
import { computeStreak } from '@/src/utils/stats';

export default function MyDayScreen() {
  const { state, actions } = useStore();
  const { colors, scheme } = useTheme();
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
    // Prioriza lo que ya está en Mi Día; si aún no hay nada añadido, usa la
    // mejor sugerencia (vencida o de hoy) para que la tarjeta destacada
    // siempre muestre el siguiente paso accionable del usuario.
    const pool = open.length ? open : suggestions;
    const order = { high: 0, medium: 1, low: 2, none: 3 } as const;
    return [...pool].sort((a, b) => order[a.priority] - order[b.priority] || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))[0];
  }, [open, suggestions]);
  const heroSubDone = heroTask ? heroTask.subtasks.filter((s) => s.done).length : 0;
  const heroSubTotal = heroTask ? heroTask.subtasks.length : 0;
  const heroProgress = heroSubTotal > 0 ? heroSubDone / heroSubTotal : heroTask ? 0 : 0;

  const goalTotal = Math.max(dueToday, 1);
  const goalPct = Math.min(1, doneToday / goalTotal);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={scheme === 'dark' ? [colors.brandDim, colors.bg] : ['#DEF3C4', colors.bg]}
          style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 34, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.black, fontSize: 26, color: colors.text }}>Hola, {state.user.name}</Text>
              <Text style={{ fontFamily: FONTS.semi, fontSize: 13.5, color: colors.textDim, marginTop: 2 }}>
                {isToday ? '¡Sigue con tu racha!' : 'Planeando otro día'}
              </Text>
            </View>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomWidth: 4,
                borderColor: colors.brandEdge,
                transform: [{ rotate: '-6deg' }],
              }}>
              <Ionicons name="navigate" size={26} color={colors.onBrand} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard icon="flame" iconColor={colors.accent} value={String(streak)} label="días de racha" />
            <StatCard icon="checkmark-done" iconColor={colors.ok} value={`${doneToday}`} label="hechas hoy" />
            <StatCard icon="albums" iconColor={colors.info} value={String(openTotal)} label="pendientes" />
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 18, marginTop: -14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <IconBtn icon="chevron-back" onPress={() => setDate(addDays(date, -1))} />
            <Text style={{ flex: 1, textAlign: 'center', fontFamily: FONTS.extra, color: colors.text, textTransform: 'capitalize' }}>{fmtDateLong(date)}</Text>
            <IconBtn icon="chevron-forward" onPress={() => setDate(addDays(date, 1))} />
            {!isToday ? <Btn label="Hoy" small onPress={() => setDate(todayISO())} /> : null}
          </View>

          {heroTask && (
            <Pressable onPress={() => router.push(`/task/${heroTask.id}`)} style={{ marginBottom: 18 }}>
              <View style={{ backgroundColor: colors.hero, borderRadius: 22, padding: 18, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <Text style={{ fontFamily: FONTS.bold, fontSize: 12.5, color: colors.heroTextDim, letterSpacing: 0.5 }}>TU PRIORIDAD DE HOY</Text>
                <Text style={{ fontFamily: FONTS.extra, fontSize: 19, color: colors.heroText, marginTop: 4, marginBottom: 10 }} numberOfLines={2}>
                  {heroTask.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Text style={{ color: colors.heroTextDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>{listOf(heroTask.listId)?.name}</Text>
                  {heroTask.dueTime ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color={colors.heroTextDim} />
                      <Text style={{ color: colors.heroTextDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>{fmtTime(heroTask.dueTime)}</Text>
                    </View>
                  ) : null}
                  {heroSubTotal > 0 ? (
                    <Text style={{ color: colors.heroTextDim, fontFamily: FONTS.semi, fontSize: 12.5 }}>
                      {heroSubDone}/{heroSubTotal} subtareas
                    </Text>
                  ) : null}
                </View>
                {heroSubTotal > 0 && (
                  <View style={{ height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.max(6, heroProgress * 100)}%`, height: '100%', backgroundColor: colors.brand, borderRadius: 5 }} />
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Btn label="Continuar" kind="primary" onPress={() => router.push(`/task/${heroTask.id}`)} />
                  {!bucket.taskIds.includes(heroTask.id) && (
                    <Btn
                      label="Añadir a Mi Día"
                      textColor={colors.heroText}
                      onPress={() => actions.toggleMyDay(heroTask.id, date)}
                      style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)', borderWidth: 1.5 }}
                    />
                  )}
                </View>
              </View>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: FONTS.extra, fontSize: 13, color: colors.text }}>Meta de hoy</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: colors.bgElev,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
            }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="trophy" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 13.5, color: colors.text }}>
                {dueToday > 0 ? `Completar tus ${dueToday} tareas de hoy` : 'Sin tareas programadas para hoy'}
              </Text>
              <View style={{ height: 6, borderRadius: 4, backgroundColor: colors.border, marginTop: 7, overflow: 'hidden' }}>
                <View style={{ width: `${goalPct * 100}%`, height: '100%', backgroundColor: colors.ok, borderRadius: 4 }} />
              </View>
            </View>
            <Text style={{ fontFamily: FONTS.extra, fontSize: 13, color: colors.textDim }}>
              {doneToday}/{dueToday}
            </Text>
          </View>

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
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ icon, iconColor, value, label }: { icon: keyof typeof Ionicons.glyphMap; iconColor: string; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElev,
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        shadowColor: '#1b3a10',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={{ fontFamily: FONTS.black, fontSize: 18, color: colors.text, marginTop: 3 }}>{value}</Text>
      <Text style={{ fontFamily: FONTS.semi, fontSize: 10, color: colors.textFaint, marginTop: 1 }}>{label}</Text>
    </View>
  );
}
