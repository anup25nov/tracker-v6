import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";

export interface Reminder {
  id: string;
  text: string;
  scheduledAt: number; // epoch ms
  createdAt: number;
  notified: boolean;
}

function remindersCollection(uid: string) {
  return collection(db, "users", uid, "reminders");
}

export async function saveReminder(
  uid: string,
  reminder: { text: string; scheduledAt: number }
): Promise<string> {
  const col = remindersCollection(uid);
  const remId = doc(col).id;
  const ref = doc(db, "users", uid, "reminders", remId);
  await setDoc(ref, {
    text: reminder.text,
    scheduledAt: reminder.scheduledAt,
    notified: false,
    createdAt: serverTimestamp(),
  });

  // Schedule local notification on native
  await scheduleLocalNotification(remId, reminder.text, reminder.scheduledAt);

  return remId;
}

export async function deleteReminder(uid: string, remId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "reminders", remId));
  // Cancel local notification
  await cancelLocalNotification(remId);
}

export async function loadReminders(uid: string): Promise<Reminder[]> {
  const q = query(remindersCollection(uid), orderBy("scheduledAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      text: data.text || "",
      scheduledAt: data.scheduledAt || 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      notified: data.notified || false,
    };
  });
}

// ---- Local Notification Helpers ----

// We use a simple hash of the string id to create a numeric notification id
function stringToNotificationId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Track scheduled web timeouts so we can cancel them
const webTimeouts = new Map<string, number>();

async function scheduleLocalNotification(id: string, text: string, scheduledAt: number) {
  // Native (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");

      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== "granted") {
        console.warn("[Reminders] Notification permission not granted");
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: stringToNotificationId(id),
            title: "SSC Exam Sathi – Reminder",
            body: text,
            schedule: { at: new Date(scheduledAt) },
            sound: "default",
            smallIcon: "ic_launcher",
          },
        ],
      });
      console.log("[Reminders] Local notification scheduled for", new Date(scheduledAt));
    } catch (e) {
      console.error("[Reminders] Failed to schedule notification:", e);
    }
    return;
  }

  // Web fallback — request permission + schedule via setTimeout
  try {
    if (!("Notification" in window)) {
      console.warn("[Reminders] Web notifications not supported");
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission !== "granted") {
      console.warn("[Reminders] Web notification permission denied");
      return;
    }

    const delay = scheduledAt - Date.now();
    if (delay <= 0) return; // already past

    const timeoutId = window.setTimeout(() => {
      new Notification("SSC Exam Sathi – Reminder", {
        body: text,
        icon: "/icons/icon-192.png",
      });
      webTimeouts.delete(id);
    }, delay);

    webTimeouts.set(id, timeoutId);
    console.log("[Reminders] Web notification scheduled for", new Date(scheduledAt));
  } catch (e) {
    console.error("[Reminders] Failed to schedule web notification:", e);
  }
}

async function cancelLocalNotification(id: string) {
  // Cancel web timeout
  const timeoutId = webTimeouts.get(id);
  if (timeoutId) {
    window.clearTimeout(timeoutId);
    webTimeouts.delete(id);
  }

  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: stringToNotificationId(id) }],
    });
  } catch (e) {
    console.error("[Reminders] Failed to cancel notification:", e);
  }
}
