// RPT-01 — informes locales: completadas, atrasos y tiempo.
import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';

import { Screen, SectionHeader, Card, MetaPill } from '@/src/components/ui';
import { useStore, activeTasks, activeBoardTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { isoDate, fmtDuration, isOverdue } from '@/src/utils/dates';

export default function ReportsScreen() {
  const { state } = useStore();
  const { colors } = useTheme();

  const stats = useMemo(() => {
    const all = activeTasks(state);
    const boardAll = activeBoardTasks(state);
    const completed = all.filter((t) => t.status === 'completed').length + boardAll.filter((t) => t.status === 'completed').length;
    const overdue = all.filter((t) => isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const timeSec = all.reduce((s, t) => s + t.timeSpentSec, 0) + boardAll.reduce((s, t) => s + t.timeSpentSec, 0);
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(isoDate(d));
    }
    const byDay = days.map(
      (d) =>
        all.filter((t) => t.completedAt?.slice(0, 10) === d).length + boardAll.filter((t) => t.completedAt?.slice(0, 10) === d).length
    );
    return { open: all.filter((t) => t.status === 'open').length, completed, overdue, timeSec, days, byDay };
  }, [state]);

  const max = Math.max(1, ...stats.byDay);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Card style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{stats.open}</Text>
            <Text style={{ color: colors.textFaint, fontWeight: '600', fontSize: 12 }}>Tareas abiertas</Text>
          </Card>
          <Card style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{stats.completed}</Text>
            <Text style={{ color: colors.textFaint, fontWeight: '600', fontSize: 12 }}>Completadas en total</Text>
          </Card>
          <Card style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: stats.overdue ? colors.danger : colors.text }}>{stats.overdue}</Text>
            <Text style={{ color: colors.textFaint, fontWeight: '600', fontSize: 12 }}>Atrasadas</Text>
          </Card>
          <Card style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{fmtDuration(stats.timeSec)}</Text>
            <Text style={{ color: colors.textFaint, fontWeight: '600', fontSize: 12 }}>Tiempo registrado</Text>
          </Card>
        </View>

        <SectionHeader title="Completadas — últimos 7 días" />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 8, paddingTop: 8 }}>
            {stats.byDay.map((c, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textDim }}>{c || ''}</Text>
                <View
                  style={{
                    width: '70%',
                    maxWidth: 30,
                    height: `${Math.max(2, (c / max) * 80)}%`,
                    backgroundColor: colors.brand,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                />
                <Text style={{ fontSize: 10, color: colors.textFaint, fontWeight: '600', marginTop: 4 }}>
                  {new Date(stats.days[i] + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionHeader title="Por lista" />
        {state.lists
          .filter((l) => !l.archived)
          .map((l) => {
            const ts = activeTasks(state).filter((t) => t.listId === l.id);
            const c = ts.filter((t) => t.status === 'completed').length;
            return (
              <Card key={l.id} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: l.color }} />
                <Text style={{ flex: 1, fontWeight: '600', color: colors.text }}>{l.name}</Text>
                <MetaPill label={`${ts.length - c} pendientes`} />
                <MetaPill label={`${c} hechas`} />
              </Card>
            );
          })}
      </ScrollView>
    </Screen>
  );
}
