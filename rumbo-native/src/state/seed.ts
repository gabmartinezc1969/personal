import { uid } from '../utils/id';
import { todayISO } from '../utils/dates';
import { LIST_COLORS } from '../theme/colors';
import { makeTask, makeGroceryItem, makeBoardTask } from './factories';
import { AppState } from '../types/models';

export function seedData(): AppState {
  const now = new Date().toISOString();
  const listWork = uid();
  const listHome = uid();
  const listIdeas = uid();
  const t1 = uid();
  const t2 = uid();
  const t3 = uid();
  const t4 = uid();
  const t5 = uid();
  const spaceId = uid();
  const boardId = uid();
  const secTodo = uid();
  const secProg = uid();
  const secDone = uid();
  const memberA = uid();
  const groceryListId = uid();
  const today = todayISO();

  return {
    schemaVersion: 1,
    user: { name: 'Tú', createdAt: now },
    settings: { theme: 'auto', notifyDevice: false, quietStart: '22:00', quietEnd: '08:00', weekStart: 1 },
    lists: [
      { id: listWork, name: 'Trabajo', color: LIST_COLORS[1], position: 1000, archived: false },
      { id: listHome, name: 'Personal', color: LIST_COLORS[0], position: 2000, archived: false },
      { id: listIdeas, name: 'Ideas', color: LIST_COLORS[4], position: 3000, archived: false },
    ],
    tasks: [
      makeTask({ id: t1, listId: listWork, title: 'Enviar propuesta al cliente', note: 'Incluir alcance y cronograma.', priority: 'high', dueDate: today, dueTime: '10:00', tags: ['clientes'] }),
      makeTask({ id: t2, listId: listWork, title: 'Revisar correos pendientes', priority: 'medium', dueDate: today }),
      makeTask({ id: t3, listId: listHome, title: 'Pagar servicios', dueDate: today, priority: 'medium', recurrence: { freq: 'monthly', interval: 1, byweekday: [], until: null, count: null } }),
      makeTask({ id: t4, listId: listHome, title: 'Llamar al dentista', priority: 'low' }),
      makeTask({
        id: t5,
        listId: listIdeas,
        title: 'Planear fin de semana',
        note: 'Ideas: senderismo, cine, visita familiar.',
        subtasks: [
          { id: uid(), title: 'Elegir destino', done: false, position: 1000 },
          { id: uid(), title: 'Reservar transporte', done: false, position: 2000 },
        ],
      }),
    ],
    grocery: {
      lists: [{ id: groceryListId, name: 'Súper semanal', position: 1000 }],
      items: [
        makeGroceryItem(groceryListId, 'Leche'),
        makeGroceryItem(groceryListId, 'Manzanas'),
        makeGroceryItem(groceryListId, 'Pan integral'),
        makeGroceryItem(groceryListId, 'Detergente'),
        makeGroceryItem(groceryListId, 'Pollo'),
      ],
    },
    spaces: [
      {
        id: spaceId,
        name: 'Familia',
        color: LIST_COLORS[5],
        position: 1000,
        members: [
          { id: memberA, name: 'Tú', role: 'admin' },
          { id: uid(), name: 'Ana', role: 'member' },
        ],
      },
    ],
    boards: [
      {
        id: boardId,
        spaceId,
        name: 'Mudanza de casa',
        position: 1000,
        sections: [
          { id: secTodo, name: 'Por hacer', position: 1000 },
          { id: secProg, name: 'En progreso', position: 2000 },
          { id: secDone, name: 'Hecho', position: 3000 },
        ],
        automations: [],
      },
    ],
    boardTasks: [
      makeBoardTask({ boardId, sectionId: secTodo, title: 'Cotizar empresa de mudanza', priority: 'high', position: 1000 }),
      makeBoardTask({ boardId, sectionId: secTodo, title: 'Etiquetar cajas por habitación', position: 2000 }),
      makeBoardTask({ boardId, sectionId: secProg, title: 'Cambiar dirección en bancos', position: 1000 }),
      makeBoardTask({ boardId, sectionId: secDone, title: 'Reservar camioneta', position: 1000, status: 'completed', completedAt: now }),
    ],
    myDay: {},
    notifications: [
      { id: uid(), title: 'Bienvenido a Rumbo', body: 'Explora Mi Día, Listas, Calendario, Compras y Espacios desde las pestañas.', at: now, read: false, kind: 'info' },
    ],
    trash: { tasks: [], boardTasks: [] },
  };
}
