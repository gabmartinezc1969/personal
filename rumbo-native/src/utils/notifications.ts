// NTF-01 (simplificado): recordatorios locales programados en el dispositivo
// con expo-notifications. No hay servidor de push/correo/WhatsApp: la entrega
// depende de que el sistema operativo dispare la notificación local
// programada, igual que cualquier app offline-first de recordatorios.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let permissionRequested = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (permissionRequested) return false;
  permissionRequested = true;
  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
}

export async function scheduleReminder(opts: {
  id: string; // clave estable (ej. tarea id) para evitar duplicados
  title: string;
  body: string;
  fireDate: Date;
}): Promise<string | null> {
  if (opts.fireDate.getTime() <= Date.now()) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: { title: opts.title, body: opts.body, sound: Platform.OS === 'ios' ? true : undefined },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: opts.fireDate },
    });
    return notificationId;
  } catch {
    return null;
  }
}

export async function cancelReminder(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // noop — puede que ya se haya disparado o no exista
  }
}
