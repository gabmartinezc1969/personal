// Modelo de datos de Rumbo (móvil). Mismo diseño conceptual que la versión web,
// mapeado a los módulos de la especificación (PERS-01, CORE-01, PLAN-01/02,
// HOME-01, COL-01/02/03, TIME-01, RPT-01, AI-01…). Ver AboutScreen.

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type RecFreq = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Recurrence {
  freq: RecFreq;
  interval: number;
  byweekday: number[]; // 0=domingo .. 6=sábado
  until: string | null; // ISO date
  count: number | null;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export interface PersonalList {
  id: string;
  name: string;
  color: string;
  position: number;
  archived: boolean;
}

export interface PersonalTask {
  id: string;
  listId: string;
  title: string;
  note: string;
  status: 'open' | 'completed';
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  dueDate: string | null; // ISO date
  dueTime: string | null; // HH:mm
  recurrence: Recurrence;
  reminderOffset: number | null; // minutos antes del vencimiento
  reminderNotificationId: string | null; // id de notificación local programada
  position: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  archivedAt: string | null;
  deletedAt: string | null;
  timeSpentSec: number;
  timerStartedAt: string | null;
  convertedToBoardTaskId: string | null;
  occurrenceCount: number;
}

export interface GroceryList {
  id: string;
  name: string;
  position: number;
}

export interface GroceryItem {
  id: string;
  listId: string;
  text: string;
  category: string;
  overridden: boolean;
  status: 'open' | 'done';
  position: number;
  createdAt: string;
}

export type SpaceRole = 'admin' | 'member' | 'guest';

export interface Member {
  id: string;
  name: string;
  role: SpaceRole;
}

export interface Space {
  id: string;
  name: string;
  color: string;
  position: number;
  members: Member[];
}

export interface Section {
  id: string;
  name: string;
  position: number;
}

export type AutomationAction = 'complete' | 'tag';

export interface Automation {
  id: string;
  triggerSectionId: string;
  action: AutomationAction;
  tagValue?: string;
}

export interface Board {
  id: string;
  spaceId: string;
  name: string;
  position: number;
  sections: Section[];
  automations: Automation[];
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  at: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  text: string;
  at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export interface BoardTask {
  id: string;
  boardId: string;
  sectionId: string;
  title: string;
  note: string;
  status: 'open' | 'completed';
  priority: Priority;
  tags: string[];
  checklist: ChecklistItem[];
  assignees: string[];
  dueDate: string | null;
  dueTime: string | null;
  comments: Comment[];
  activity: ActivityEntry[];
  position: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  timeSpentSec: number;
  timerStartedAt: string | null;
}

export interface MyDayBucket {
  taskIds: string[];
  pinnedIds: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: 'info' | 'reminder';
}

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface Settings {
  theme: ThemeMode;
  notifyDevice: boolean;
  quietStart: string; // HH:mm
  quietEnd: string; // HH:mm
  weekStart: number; // 0=domingo, 1=lunes
}

export interface UserProfile {
  name: string;
  createdAt: string;
}

export interface AppState {
  schemaVersion: number;
  user: UserProfile;
  settings: Settings;
  lists: PersonalList[];
  tasks: PersonalTask[];
  grocery: { lists: GroceryList[]; items: GroceryItem[] };
  spaces: Space[];
  boards: Board[];
  boardTasks: BoardTask[];
  myDay: Record<string, MyDayBucket>;
  notifications: AppNotification[];
  trash: { tasks: string[]; boardTasks: string[] }; // ids informativos (no usados para filtrar; se filtra por deletedAt)
}
