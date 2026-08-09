import { uid } from '../utils/id';
import { todayISO } from '../utils/dates';
import { classifyGroceryItem } from '../utils/grocery';
import { BoardTask, GroceryItem, PersonalTask, Recurrence } from '../types/models';

export function makeRecurrence(partial?: Partial<Recurrence>): Recurrence {
  const base: Recurrence = { freq: 'none', interval: 1, byweekday: [], until: null, count: null };
  return Object.assign(base, partial || {});
}

export function makeTask(partial: Partial<PersonalTask> & { listId: string; title: string }): PersonalTask {
  const now = new Date().toISOString();
  const base: PersonalTask = {
    id: uid(),
    listId: partial.listId,
    title: partial.title,
    note: '',
    status: 'open',
    priority: 'none',
    tags: [],
    subtasks: [],
    dueDate: null,
    dueTime: null,
    recurrence: makeRecurrence(),
    reminderOffset: null,
    reminderNotificationId: null,
    position: Date.now(),
    version: 1,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    archivedAt: null,
    deletedAt: null,
    timeSpentSec: 0,
    timerStartedAt: null,
    convertedToBoardTaskId: null,
    occurrenceCount: 0,
  };
  const merged = Object.assign(base, partial);
  merged.recurrence = makeRecurrence(partial.recurrence);
  return merged;
}

export function makeGroceryItem(listId: string, text: string, cat?: string): GroceryItem {
  return {
    id: uid(),
    listId,
    text,
    category: cat || classifyGroceryItem(text),
    overridden: !!cat,
    status: 'open',
    position: Date.now() + Math.random(),
    createdAt: new Date().toISOString(),
  };
}

export function makeBoardTask(partial: Partial<BoardTask> & { boardId: string; sectionId: string; title: string }): BoardTask {
  const now = new Date().toISOString();
  const base: BoardTask = {
    id: uid(),
    boardId: partial.boardId,
    sectionId: partial.sectionId,
    title: partial.title,
    note: '',
    status: 'open',
    priority: 'none',
    tags: [],
    checklist: [],
    assignees: [],
    dueDate: null,
    dueTime: null,
    comments: [],
    activity: [{ id: uid(), type: 'created', text: 'Tarjeta creada', at: now }],
    position: Date.now(),
    version: 1,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    deletedAt: null,
    timeSpentSec: 0,
    timerStartedAt: null,
  };
  return Object.assign(base, partial);
}

export { todayISO };
