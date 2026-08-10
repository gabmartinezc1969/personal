import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uid } from '../utils/id';
import { todayISO, dueInstant, nextOccurrenceDate, fmtDateHuman } from '../utils/dates';
import { classifyGroceryItem } from '../utils/grocery';
import { scheduleReminder, cancelReminder } from '../utils/notifications';
import { makeTask, makeGroceryItem, makeBoardTask, makeRecurrence } from './factories';
import { seedData } from './seed';
import {
  AppState,
  PersonalList,
  PersonalTask,
  Priority,
  RecFreq,
  Subtask,
  Space,
  Board,
  BoardTask,
  Automation,
  AutomationAction,
  SpaceRole,
  ThemeMode,
} from '../types/models';

const STORAGE_KEY = 'rumbo_native_data_v1';
const SCHEMA_VERSION = 1;

function migrate(raw: any): AppState {
  const d: AppState = raw;
  d.schemaVersion = d.schemaVersion || SCHEMA_VERSION;
  d.trash = d.trash || { tasks: [], boardTasks: [] };
  d.myDay = d.myDay || {};
  d.notifications = d.notifications || [];
  d.settings = Object.assign({ theme: 'dark' as ThemeMode, notifyDevice: false, quietStart: '22:00', quietEnd: '08:00', weekStart: 1 }, d.settings || {});
  (d.boards || []).forEach((b) => {
    b.automations = b.automations || [];
  });
  (d.tasks || []).forEach((t) => {
    t.recurrence = makeRecurrence(t.recurrence);
    t.subtasks = t.subtasks || [];
    t.tags = t.tags || [];
    if (t.timeSpentSec == null) t.timeSpentSec = 0;
    if (t.reminderNotificationId === undefined) t.reminderNotificationId = null;
  });
  (d.boardTasks || []).forEach((t) => {
    t.checklist = t.checklist || [];
    t.assignees = t.assignees || [];
    t.tags = t.tags || [];
    t.comments = t.comments || [];
    t.activity = t.activity || [];
    if (t.timeSpentSec == null) t.timeSpentSec = 0;
  });
  return d;
}

export interface StoreActions {
  // Listas
  addList: (name: string, color: string) => string;
  updateList: (id: string, patch: Partial<Pick<PersonalList, 'name' | 'color'>>) => void;
  archiveList: (id: string) => void;
  deleteList: (id: string) => void;

  // Tareas personales
  addQuickTask: (listId: string, title: string) => string | null;
  toggleTaskStatus: (id: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  updateTaskNote: (id: string, note: string) => void;
  setTaskPriority: (id: string, p: Priority) => void;
  setTaskSchedule: (id: string, patch: { dueDate?: string | null; dueTime?: string | null; reminderOffset?: number | null }) => Promise<void>;
  setTaskRecurrenceFreq: (id: string, freq: RecFreq) => void;
  toggleTaskWeekday: (id: string, day: number) => void;
  addSubtask: (id: string, title: string) => void;
  toggleSubtask: (id: string, subId: string) => void;
  updateSubtaskTitle: (id: string, subId: string, title: string) => void;
  deleteSubtask: (id: string, subId: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  purgeTask: (id: string) => void;
  archiveTask: (id: string) => void;
  convertToBoardTask: (taskId: string, boardId: string) => string;

  // Mi Día
  toggleMyDay: (taskId: string, date: string) => void;
  pinMyDay: (taskId: string, date: string) => void;
  quickAddMyDay: (date: string, title: string) => void;

  // Compras
  addGroceryItem: (text: string) => void;
  toggleGroceryItem: (id: string) => void;
  deleteGroceryItem: (id: string) => void;
  reclassifyGroceryItem: (id: string, cat: string) => void;
  clearGroceryDone: () => void;

  // Espacios
  addSpace: (name: string) => string;
  addMember: (spaceId: string, name: string) => void;
  removeMember: (spaceId: string, memberId: string) => void;
  setMemberRole: (spaceId: string, memberId: string, role: SpaceRole) => void;

  // Tableros
  addBoard: (spaceId: string, name: string) => string;
  addSection: (boardId: string, name: string) => void;
  deleteSection: (boardId: string, sectionId: string) => boolean;
  addBoardCard: (boardId: string, sectionId: string, title: string) => void;
  moveBoardCard: (cardId: string, sectionId: string) => void;
  toggleBoardTaskStatus: (id: string) => void;
  updateBoardTaskTitle: (id: string, title: string) => void;
  updateBoardTaskNote: (id: string, note: string) => void;
  setBoardTaskPriority: (id: string, p: Priority) => void;
  setBoardTaskSchedule: (id: string, patch: { dueDate?: string | null; dueTime?: string | null }) => void;
  toggleAssignee: (id: string, memberId: string) => void;
  addChecklistItem: (id: string, title: string) => void;
  toggleChecklistItem: (id: string, itemId: string) => void;
  updateChecklistTitle: (id: string, itemId: string, title: string) => void;
  deleteChecklistItem: (id: string, itemId: string) => void;
  addBtTag: (id: string, tag: string) => void;
  removeBtTag: (id: string, tag: string) => void;
  addComment: (id: string, body: string) => void;
  deleteBoardTask: (id: string) => void;
  restoreBoardTask: (id: string) => void;
  purgeBoardTask: (id: string) => void;
  addAutomation: (boardId: string, triggerSectionId: string, action: AutomationAction, tagValue?: string) => void;
  deleteAutomation: (boardId: string, automationId: string) => void;

  // Tiempo
  toggleTimer: (kind: 'task' | 'boardTask', id: string) => void;

  // Notificaciones in-app
  markNotifRead: (id: string) => void;
  markAllNotifRead: () => void;

  // Ajustes / datos
  setThemeMode: (m: ThemeMode) => void;
  setNotifyDevice: (v: boolean) => void;
  setQuietHours: (start: string, end: string) => void;
  setUserName: (name: string) => void;
  resetData: () => void;
  replaceData: (data: AppState) => void;
}

interface StoreContextValue {
  state: AppState;
  actions: StoreActions;
  ready: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedData());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(migrate(JSON.parse(raw)));
      } catch {
        // se conserva la semilla si la lectura falla
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next: AppState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    }, 200);
  }, []);

  const mutate = useCallback(
    (fn: (draft: AppState) => void) => {
      setState((prev) => {
        const draft: AppState = JSON.parse(JSON.stringify(prev));
        fn(draft);
        persist(draft);
        return draft;
      });
    },
    [persist]
  );

  const pushNotification = useCallback(
    (title: string, body: string, kind: 'info' | 'reminder' = 'info') => {
      mutate((d) => {
        d.notifications.unshift({ id: uid(), title, body, at: new Date().toISOString(), read: false, kind });
        if (d.notifications.length > 200) d.notifications.length = 200;
      });
    },
    [mutate]
  );

  const actions: StoreActions = useMemo(() => {
    const s = () => stateRef.current;

    function stopAllTimers(draft: AppState, exceptKind?: 'task' | 'boardTask', exceptId?: string) {
      draft.tasks.forEach((t) => {
        if (t.timerStartedAt && !(exceptKind === 'task' && t.id === exceptId)) {
          t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
          t.timerStartedAt = null;
        }
      });
      draft.boardTasks.forEach((t) => {
        if (t.timerStartedAt && !(exceptKind === 'boardTask' && t.id === exceptId)) {
          t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
          t.timerStartedAt = null;
        }
      });
    }

    function runAutomations(draft: AppState, t: (typeof draft.boardTasks)[number], newSectionId: string) {
      const b = draft.boards.find((x) => x.id === t.boardId);
      if (!b) return;
      b.automations.filter((a) => a.triggerSectionId === newSectionId).forEach((a) => {
        if (a.action === 'complete' && t.status !== 'completed') {
          t.status = 'completed';
          t.completedAt = new Date().toISOString();
          t.activity.push({ id: uid(), type: 'automation', text: 'Automatización: marcada como completada', at: new Date().toISOString() });
        }
        if (a.action === 'tag' && a.tagValue && !t.tags.includes(a.tagValue)) {
          t.tags.push(a.tagValue);
          t.activity.push({ id: uid(), type: 'automation', text: `Automatización: etiqueta "${a.tagValue}" añadida`, at: new Date().toISOString() });
        }
      });
    }

    const api: StoreActions = {
      addList: (name, color) => {
        const id = uid();
        const maxPos = Math.max(0, ...s().lists.map((l) => l.position));
        mutate((d) => {
          d.lists.push({ id, name: name.trim() || 'Sin título', color, position: maxPos + 1000, archived: false });
        });
        return id;
      },
      updateList: (id, patch) => {
        mutate((d) => {
          const l = d.lists.find((x) => x.id === id);
          if (l) Object.assign(l, patch);
        });
      },
      archiveList: (id) => {
        mutate((d) => {
          const l = d.lists.find((x) => x.id === id);
          if (l) l.archived = true;
        });
      },
      deleteList: (id) => {
        mutate((d) => {
          const now = new Date().toISOString();
          d.tasks.forEach((t) => {
            if (t.listId === id) t.deletedAt = now;
          });
          d.lists = d.lists.filter((l) => l.id !== id);
        });
      },

      addQuickTask: (listId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return null;
        const id = uid();
        const maxPos = Math.max(0, ...s().tasks.filter((t) => t.listId === listId && !t.deletedAt).map((t) => t.position));
        mutate((d) => {
          d.tasks.push(makeTask({ id, listId, title: trimmed, position: maxPos + 1000 }));
        });
        return id;
      },
      toggleTaskStatus: (id) => {
        const current = s().tasks.find((t) => t.id === id);
        if (!current) return;
        if (current.status === 'open' && current.recurrence.freq !== 'none' && current.dueDate) {
          const next = nextOccurrenceDate(current.dueDate, current.recurrence);
          if (next) {
            (async () => {
              await cancelReminder(current.reminderNotificationId);
              let newNotifId: string | null = null;
              if (current.reminderOffset != null) {
                const fire = new Date(dueInstant(next, current.dueTime).getTime() - current.reminderOffset * 60000);
                newNotifId = await scheduleReminder({ id, title: 'Recordatorio: ' + current.title, body: current.dueTime ? `Vence a las ${current.dueTime}` : 'Vence hoy', fireDate: fire });
              }
              mutate((d) => {
                const t = d.tasks.find((x) => x.id === id);
                if (!t) return;
                t.dueDate = next;
                t.status = 'open';
                t.completedAt = null;
                t.occurrenceCount = (t.occurrenceCount || 0) + 1;
                t.subtasks.forEach((sub) => (sub.done = false));
                t.reminderNotificationId = newNotifId;
                if (t.timerStartedAt) {
                  t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
                  t.timerStartedAt = null;
                }
                t.version++;
                t.updatedAt = new Date().toISOString();
              });
              pushNotification('Tarea reprogramada', `"${current.title}" se movió a ${fmtDateHuman(next)}.`, 'info');
            })();
            return;
          }
        }
        mutate((d) => {
          const t = d.tasks.find((x) => x.id === id);
          if (!t) return;
          if (t.status === 'open') {
            if (t.timerStartedAt) {
              t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
              t.timerStartedAt = null;
            }
            t.status = 'completed';
            t.completedAt = new Date().toISOString();
          } else {
            t.status = 'open';
            t.completedAt = null;
          }
          t.version++;
          t.updatedAt = new Date().toISOString();
        });
      },
      updateTaskTitle: (id, title) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.title = title; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      updateTaskNote: (id, note) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.note = note; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      setTaskPriority: (id, p) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.priority = p; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      setTaskSchedule: async (id, patch) => {
        const current = s().tasks.find((t) => t.id === id);
        if (!current) return;
        const dueDate = patch.dueDate !== undefined ? patch.dueDate : current.dueDate;
        const dueTime = patch.dueTime !== undefined ? patch.dueTime : current.dueTime;
        const reminderOffset = patch.reminderOffset !== undefined ? patch.reminderOffset : current.reminderOffset;
        await cancelReminder(current.reminderNotificationId);
        let notifId: string | null = null;
        if (dueDate && reminderOffset != null) {
          const fire = new Date(dueInstant(dueDate, dueTime).getTime() - reminderOffset * 60000);
          notifId = await scheduleReminder({ id, title: 'Recordatorio: ' + current.title, body: dueTime ? `Vence a las ${dueTime}` : 'Vence hoy', fireDate: fire });
        }
        mutate((d) => {
          const t = d.tasks.find((x) => x.id === id);
          if (!t) return;
          if (!dueDate) {
            t.dueDate = null;
            t.dueTime = null;
            t.reminderOffset = null;
            t.recurrence = makeRecurrence();
          } else {
            t.dueDate = dueDate;
            t.dueTime = dueTime;
            t.reminderOffset = reminderOffset;
          }
          t.reminderNotificationId = notifId;
          t.version++;
          t.updatedAt = new Date().toISOString();
        });
      },
      setTaskRecurrenceFreq: (id, freq) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (!t) return;
        t.recurrence.freq = freq;
        if (freq !== 'custom') t.recurrence.byweekday = [];
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      toggleTaskWeekday: (id, day) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (!t) return;
        const i = t.recurrence.byweekday.indexOf(day);
        if (i >= 0) t.recurrence.byweekday.splice(i, 1); else t.recurrence.byweekday.push(day);
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      addSubtask: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        mutate((d) => {
          const t = d.tasks.find((x) => x.id === id);
          if (!t) return;
          const maxPos = Math.max(0, ...t.subtasks.map((sub) => sub.position));
          t.subtasks.push({ id: uid(), title: trimmed, done: false, position: maxPos + 1000 });
          t.version++; t.updatedAt = new Date().toISOString();
        });
      },
      toggleSubtask: (id, subId) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        const sub = t?.subtasks.find((x) => x.id === subId);
        if (t && sub) { sub.done = !sub.done; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      updateSubtaskTitle: (id, subId, title) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        const sub = t?.subtasks.find((x) => x.id === subId);
        if (t && sub) { sub.title = title; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      deleteSubtask: (id, subId) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (!t) return;
        t.subtasks = t.subtasks.filter((x) => x.id !== subId);
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      addTag: (id, tag) => {
        const trimmed = tag.trim().replace(/^#/, '');
        if (!trimmed) return;
        mutate((d) => {
          const t = d.tasks.find((x) => x.id === id);
          if (t && !t.tags.includes(trimmed)) { t.tags.push(trimmed); t.version++; t.updatedAt = new Date().toISOString(); }
        });
      },
      removeTag: (id, tag) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.tags = t.tags.filter((x) => x !== tag); t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      deleteTask: (id) => {
        const current = s().tasks.find((t) => t.id === id);
        cancelReminder(current?.reminderNotificationId);
        mutate((d) => {
          const t = d.tasks.find((x) => x.id === id);
          if (t) { t.deletedAt = new Date().toISOString(); t.version++; t.updatedAt = new Date().toISOString(); }
        });
      },
      restoreTask: (id) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.deletedAt = null; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      purgeTask: (id) => mutate((d) => {
        d.tasks = d.tasks.filter((t) => t.id !== id);
      }),
      archiveTask: (id) => mutate((d) => {
        const t = d.tasks.find((x) => x.id === id);
        if (t) { t.archivedAt = new Date().toISOString(); t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      convertToBoardTask: (taskId, boardId) => {
        const t = s().tasks.find((x) => x.id === taskId);
        const b = s().boards.find((x) => x.id === boardId);
        const newId = uid();
        if (!t || !b || !b.sections.length) return newId;
        const sectionId = b.sections[0].id;
        const maxPos = Math.max(0, ...s().boardTasks.filter((x) => x.sectionId === sectionId).map((x) => x.position));
        mutate((d) => {
          d.boardTasks.push(makeBoardTask({ id: newId, boardId, sectionId, title: t.title, note: t.note, priority: t.priority, tags: [...t.tags], dueDate: t.dueDate, dueTime: t.dueTime, position: maxPos + 1000 }));
          const orig = d.tasks.find((x) => x.id === taskId);
          if (orig) { orig.convertedToBoardTaskId = newId; orig.archivedAt = new Date().toISOString(); orig.version++; orig.updatedAt = new Date().toISOString(); }
        });
        return newId;
      },

      toggleMyDay: (taskId, date) => mutate((d) => {
        const bucket = d.myDay[date] || (d.myDay[date] = { taskIds: [], pinnedIds: [] });
        const idx = bucket.taskIds.indexOf(taskId);
        if (idx >= 0) { bucket.taskIds.splice(idx, 1); bucket.pinnedIds = bucket.pinnedIds.filter((x) => x !== taskId); }
        else bucket.taskIds.push(taskId);
      }),
      pinMyDay: (taskId, date) => mutate((d) => {
        const bucket = d.myDay[date] || (d.myDay[date] = { taskIds: [], pinnedIds: [] });
        if (!bucket.taskIds.includes(taskId)) bucket.taskIds.push(taskId);
        const i = bucket.pinnedIds.indexOf(taskId);
        if (i >= 0) bucket.pinnedIds.splice(i, 1); else bucket.pinnedIds.push(taskId);
      }),
      quickAddMyDay: (date, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const list = s().lists.find((l) => !l.archived);
        if (!list) return;
        const id = uid();
        const maxPos = Math.max(0, ...s().tasks.filter((t) => t.listId === list.id).map((t) => t.position));
        mutate((d) => {
          d.tasks.push(makeTask({ id, listId: list.id, title: trimmed, position: maxPos + 1000 }));
          const bucket = d.myDay[date] || (d.myDay[date] = { taskIds: [], pinnedIds: [] });
          bucket.taskIds.push(id);
        });
      },

      addGroceryItem: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const listId = s().grocery.lists[0]?.id;
        if (!listId) return;
        mutate((d) => { d.grocery.items.push(makeGroceryItem(listId, trimmed)); });
      },
      toggleGroceryItem: (id) => mutate((d) => {
        const i = d.grocery.items.find((x) => x.id === id);
        if (i) i.status = i.status === 'open' ? 'done' : 'open';
      }),
      deleteGroceryItem: (id) => mutate((d) => { d.grocery.items = d.grocery.items.filter((x) => x.id !== id); }),
      reclassifyGroceryItem: (id, cat) => mutate((d) => {
        const i = d.grocery.items.find((x) => x.id === id);
        if (i) { i.category = cat; i.overridden = true; }
      }),
      clearGroceryDone: () => mutate((d) => { d.grocery.items = d.grocery.items.filter((i) => i.status !== 'done'); }),

      addSpace: (name) => {
        const id = uid();
        const maxPos = Math.max(0, ...s().spaces.map((x) => x.position));
        mutate((d) => {
          d.spaces.push({ id, name: name.trim() || 'Espacio', color: '#1f5e4b', position: maxPos + 1000, members: [{ id: uid(), name: s().user.name || 'Tú', role: 'admin' }] });
        });
        return id;
      },
      addMember: (spaceId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        mutate((d) => {
          const sp = d.spaces.find((x) => x.id === spaceId);
          if (sp) sp.members.push({ id: uid(), name: trimmed, role: 'member' });
        });
      },
      removeMember: (spaceId, memberId) => mutate((d) => {
        const sp = d.spaces.find((x) => x.id === spaceId);
        if (sp) sp.members = sp.members.filter((m) => m.id !== memberId);
      }),
      setMemberRole: (spaceId, memberId, role) => mutate((d) => {
        const sp = d.spaces.find((x) => x.id === spaceId);
        const m = sp?.members.find((x) => x.id === memberId);
        if (m) m.role = role;
      }),

      addBoard: (spaceId, name) => {
        const id = uid();
        const maxPos = Math.max(0, ...s().boards.filter((b) => b.spaceId === spaceId).map((b) => b.position), 0);
        mutate((d) => {
          d.boards.push({
            id, spaceId, name: name.trim() || 'Tablero', position: maxPos + 1000,
            sections: [
              { id: uid(), name: 'Por hacer', position: 1000 },
              { id: uid(), name: 'En progreso', position: 2000 },
              { id: uid(), name: 'Hecho', position: 3000 },
            ],
            automations: [],
          });
        });
        return id;
      },
      addSection: (boardId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        mutate((d) => {
          const b = d.boards.find((x) => x.id === boardId);
          if (!b) return;
          const maxPos = Math.max(0, ...b.sections.map((x) => x.position));
          b.sections.push({ id: uid(), name: trimmed, position: maxPos + 1000 });
        });
      },
      deleteSection: (boardId, sectionId) => {
        const hasCards = s().boardTasks.some((t) => t.sectionId === sectionId && !t.deletedAt);
        if (hasCards) return false;
        mutate((d) => {
          const b = d.boards.find((x) => x.id === boardId);
          if (!b) return;
          b.sections = b.sections.filter((sec) => sec.id !== sectionId);
          b.automations = b.automations.filter((a) => a.triggerSectionId !== sectionId);
        });
        return true;
      },
      addBoardCard: (boardId, sectionId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const maxPos = Math.max(0, ...s().boardTasks.filter((t) => t.sectionId === sectionId && !t.deletedAt).map((t) => t.position));
        mutate((d) => { d.boardTasks.push(makeBoardTask({ boardId, sectionId, title: trimmed, position: maxPos + 1000 })); });
      },
      moveBoardCard: (cardId, sectionId) => {
        const maxPos = Math.max(0, ...s().boardTasks.filter((t) => t.sectionId === sectionId && !t.deletedAt && t.id !== cardId).map((t) => t.position), 0);
        mutate((d) => {
          const t = d.boardTasks.find((x) => x.id === cardId);
          if (!t) return;
          const changed = t.sectionId !== sectionId;
          t.sectionId = sectionId;
          t.position = maxPos + 1000;
          t.version++; t.updatedAt = new Date().toISOString();
          if (changed) {
            const b = d.boards.find((x) => x.id === t.boardId);
            const secName = b?.sections.find((sec) => sec.id === sectionId)?.name;
            t.activity.push({ id: uid(), type: 'move', text: `Movida a "${secName}"`, at: new Date().toISOString() });
            runAutomations(d, t, sectionId);
          }
        });
      },
      toggleBoardTaskStatus: (id) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (!t) return;
        if (t.status === 'open' && t.timerStartedAt) {
          t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
          t.timerStartedAt = null;
        }
        t.status = t.status === 'open' ? 'completed' : 'open';
        t.completedAt = t.status === 'completed' ? new Date().toISOString() : null;
        t.activity.push({ id: uid(), type: 'status', text: t.status === 'completed' ? 'Marcada como completada' : 'Reabierta', at: new Date().toISOString() });
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      updateBoardTaskTitle: (id, title) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.title = title; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      updateBoardTaskNote: (id, note) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.note = note; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      setBoardTaskPriority: (id, p) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.priority = p; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      setBoardTaskSchedule: (id, patch) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (!t) return;
        if (patch.dueDate !== undefined) { t.dueDate = patch.dueDate; if (!patch.dueDate) t.dueTime = null; }
        if (patch.dueTime !== undefined) t.dueTime = patch.dueTime;
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      toggleAssignee: (id, memberId) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (!t) return;
        const b = d.boards.find((x) => x.id === t.boardId);
        const sp = b ? d.spaces.find((x) => x.id === b.spaceId) : undefined;
        const member = sp?.members.find((m) => m.id === memberId);
        const i = t.assignees.indexOf(memberId);
        if (i >= 0) {
          t.assignees.splice(i, 1);
          if (member) t.activity.push({ id: uid(), type: 'assign', text: `Se quitó a ${member.name} de asignados`, at: new Date().toISOString() });
        } else {
          t.assignees.push(memberId);
          if (member) t.activity.push({ id: uid(), type: 'assign', text: `Se asignó a ${member.name}`, at: new Date().toISOString() });
        }
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      addChecklistItem: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        mutate((d) => {
          const t = d.boardTasks.find((x) => x.id === id);
          if (!t) return;
          const maxPos = Math.max(0, ...t.checklist.map((c) => c.position));
          t.checklist.push({ id: uid(), title: trimmed, done: false, position: maxPos + 1000 });
          t.version++; t.updatedAt = new Date().toISOString();
        });
      },
      toggleChecklistItem: (id, itemId) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        const c = t?.checklist.find((x) => x.id === itemId);
        if (t && c) { c.done = !c.done; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      updateChecklistTitle: (id, itemId, title) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        const c = t?.checklist.find((x) => x.id === itemId);
        if (t && c) { c.title = title; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      deleteChecklistItem: (id, itemId) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (!t) return;
        t.checklist = t.checklist.filter((x) => x.id !== itemId);
        t.version++; t.updatedAt = new Date().toISOString();
      }),
      addBtTag: (id, tag) => {
        const trimmed = tag.trim().replace(/^#/, '');
        if (!trimmed) return;
        mutate((d) => {
          const t = d.boardTasks.find((x) => x.id === id);
          if (t && !t.tags.includes(trimmed)) { t.tags.push(trimmed); t.version++; t.updatedAt = new Date().toISOString(); }
        });
      },
      removeBtTag: (id, tag) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.tags = t.tags.filter((x) => x !== tag); t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      addComment: (id, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        mutate((d) => {
          const t = d.boardTasks.find((x) => x.id === id);
          if (!t) return;
          t.comments.push({ id: uid(), author: s().user.name || 'Tú', body: trimmed, at: new Date().toISOString() });
          t.activity.push({ id: uid(), type: 'comment', text: 'Nuevo comentario', at: new Date().toISOString() });
          t.version++; t.updatedAt = new Date().toISOString();
        });
      },
      deleteBoardTask: (id) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.deletedAt = new Date().toISOString(); t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      restoreBoardTask: (id) => mutate((d) => {
        const t = d.boardTasks.find((x) => x.id === id);
        if (t) { t.deletedAt = null; t.version++; t.updatedAt = new Date().toISOString(); }
      }),
      purgeBoardTask: (id) => mutate((d) => { d.boardTasks = d.boardTasks.filter((t) => t.id !== id); }),
      addAutomation: (boardId, triggerSectionId, action, tagValue) => mutate((d) => {
        const b = d.boards.find((x) => x.id === boardId);
        if (b) b.automations.push({ id: uid(), triggerSectionId, action, tagValue });
      }),
      deleteAutomation: (boardId, automationId) => mutate((d) => {
        const b = d.boards.find((x) => x.id === boardId);
        if (b) b.automations = b.automations.filter((a) => a.id !== automationId);
      }),

      toggleTimer: (kind, id) => mutate((d) => {
        const t = kind === 'task' ? d.tasks.find((x) => x.id === id) : d.boardTasks.find((x) => x.id === id);
        if (!t) return;
        if (t.timerStartedAt) {
          t.timeSpentSec += (Date.now() - new Date(t.timerStartedAt).getTime()) / 1000;
          t.timerStartedAt = null;
        } else {
          stopAllTimers(d, kind, id);
          t.timerStartedAt = new Date().toISOString();
        }
        t.version++; t.updatedAt = new Date().toISOString();
      }),

      markNotifRead: (id) => mutate((d) => {
        const n = d.notifications.find((x) => x.id === id);
        if (n) n.read = true;
      }),
      markAllNotifRead: () => mutate((d) => { d.notifications.forEach((n) => (n.read = true)); }),

      setThemeMode: (m) => mutate((d) => { d.settings.theme = m; }),
      setNotifyDevice: (v) => mutate((d) => { d.settings.notifyDevice = v; }),
      setQuietHours: (start, end) => mutate((d) => { d.settings.quietStart = start; d.settings.quietEnd = end; }),
      setUserName: (name) => mutate((d) => { d.user.name = name.trim() || d.user.name; }),
      resetData: () => {
        const fresh = seedData();
        setState(fresh);
        persist(fresh);
      },
      replaceData: (data) => {
        const migrated = migrate(JSON.parse(JSON.stringify(data)));
        setState(migrated);
        persist(migrated);
      },
    };
    return api;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutate, persist, pushNotification]);

  const value = useMemo(() => ({ state, actions, ready }), [state, actions, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}

// Selectores auxiliares
export function activeTasks(state: AppState) {
  return state.tasks.filter((t) => !t.deletedAt && !t.archivedAt);
}
export function activeBoardTasks(state: AppState) {
  return state.boardTasks.filter((t) => !t.deletedAt);
}
export const TODAY = todayISO;
