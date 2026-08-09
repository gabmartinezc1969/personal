import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { PersonalTask, PersonalList } from '../types/models';
import { CheckCircle, MetaPill, IconBtn } from './ui';
import { fmtDateHuman, fmtTime, fmtDuration, isOverdue, isDueToday, recurrenceLabel } from '../utils/dates';

export function TaskRow({
  task,
  list,
  onPress,
  onToggle,
  inMyDay,
  onToggleMyDay,
}: {
  task: PersonalTask;
  list?: PersonalList;
  onPress: () => void;
  onToggle: () => void;
  inMyDay?: boolean;
  onToggleMyDay?: () => void;
}) {
  const { colors } = useTheme();
  const overdue = isOverdue(task.dueDate, task.dueTime, task.status);
  const today = isDueToday(task.dueDate) && task.status === 'open';
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const rec = recurrenceLabel(task.recurrence);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.bgElev, borderColor: pressed ? colors.borderStrong : colors.border },
      ]}>
      <CheckCircle checked={task.status === 'completed'} priority={task.priority} onPress={onToggle} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 14.5,
            fontWeight: '600',
            color: task.status === 'completed' ? colors.textFaint : colors.text,
            textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
          }}
          numberOfLines={2}>
          {task.title || '(sin título)'}
        </Text>
        {(task.dueDate || rec || task.subtasks.length > 0 || task.tags.length > 0 || task.timeSpentSec > 0 || list) && (
          <View style={styles.meta}>
            {list ? <MetaPill label={list.name} /> : null}
            {task.dueDate ? (
              <MetaPill
                icon="calendar-outline"
                label={fmtDateHuman(task.dueDate) + (task.dueTime ? ' · ' + fmtTime(task.dueTime) : '')}
                tone={overdue ? 'overdue' : today ? 'today' : 'default'}
              />
            ) : null}
            {rec ? <MetaPill icon="repeat-outline" label={rec} /> : null}
            {task.subtasks.length ? <MetaPill label={`${doneSubs}/${task.subtasks.length}`} /> : null}
            {task.timeSpentSec ? <MetaPill icon="time-outline" label={fmtDuration(task.timeSpentSec)} /> : null}
            {task.tags.map((t) => (
              <MetaPill key={t} label={'#' + t} />
            ))}
          </View>
        )}
      </View>
      {onToggleMyDay ? (
        <IconBtn icon={inMyDay ? 'sunny' : 'sunny-outline'} color={inMyDay ? colors.brand : colors.textFaint} onPress={onToggleMyDay} size={18} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 7,
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5, alignItems: 'center' },
});
