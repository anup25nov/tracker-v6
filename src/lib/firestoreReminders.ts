import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";

export interface Reminder {
  id: string;
  text: string;
  scheduledAt: number; // epoch ms
  createdAt: number;
  updatedAt: number;
  notified: boolean;
}

const PAGE_SIZE = 10;

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
    updatedAt: serverTimestamp(),
  });

  // Schedule local notification on native
  await scheduleLocalNotification(remId, reminder.text, reminder.scheduledAt);

  return remId;
}

export async function deleteReminder(uid: string, remId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "reminders", remId));
  await cancelLocalNotification(remId);
}

/** Load reminders page by page, sorted by updatedAt desc */
export async function loadReminders(
  uid: string,
  lastDoc?: QueryDocumentSnapshot | null
): Promise<{ reminders: Reminder[]; lastVisible: QueryDocumentSnapshot | null; hasMore: boolean }> {
  const constraints = [orderBy("updatedAt", "desc"), limit(PAGE_SIZE + 1)];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(remindersCollection(uid), ...constraints);
  const snap = await getDocs(q);

  const hasMore = snap.docs.length > PAGE_SIZE;
  const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;
  const lastVisible = docs.length > 0 ? docs[docs.length - 1] : null;

  const reminders: Reminder[] = docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      text: data.text || "",
      scheduledAt: data.scheduledAt || 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : (data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now()),
      notified: data.notified || false,
    };
  });

  return { reminders, lastVisible, hasMore };
}

// ---- Local Notification Helpers ----

function stringToNotificationId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const webTimeouts = new Map<string, number>();

async function scheduleLocalNotification(id: string, text: string, scheduledAt: number) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");

      // Request permission
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== "granted") {
        console.warn("[Reminders] Notification permission not granted");
        return;
      }

      // Create notification channel for Android (required for Android 8+)
      try {
        await LocalNotifications.createChannel({
          id: "reminders",
          name: "Study Reminders",
          description: "Notifications for study reminders",
          importance: 5, // Max importance
          visibility: 1, // Public
          vibration: true,
          sound: "default",
          lights: true,
        });
      } catch (channelErr) {
        console.warn("[Reminders] Channel creation skipped:", channelErr);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: stringToNotificationId(id),
            title: "SSC Exam Sathi – Reminder",
            body: text || "Study reminder!",
            schedule: {
              at: new Date(scheduledAt),
              allowWhileIdle: true,
            },
            channelId: "reminders",
            sound: "default",
            smallIcon: "ic_launcher",
            autoCancel: true,
          },
        ],
      });
      console.log("[Reminders] Local notification scheduled for", new Date(scheduledAt));
    } catch (e) {
      console.error("[Reminders] Failed to schedule notification:", e);
    }
    return;
  }

  // Web fallback
  try {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    const delay = scheduledAt - Date.now();
    if (delay <= 0) return;

    const timeoutId = window.setTimeout(() => {
      new Notification("SSC Exam Sathi – Reminder", {
        body: text || "Study reminder!",
        icon: "/icons/icon-192.png",
      });
      webTimeouts.delete(id);
    }, delay);

    webTimeouts.set(id, timeoutId);
  } catch (e) {
    console.error("[Reminders] Failed to schedule web notification:", e);
  }
}

async function cancelLocalNotification(id: string) {
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
