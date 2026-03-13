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

export interface ShortNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

function notesCollection(uid: string) {
  return collection(db, "users", uid, "notes");
}

export async function saveNote(
  uid: string,
  note: { id?: string; title: string; content: string }
): Promise<string> {
  const noteId = note.id || doc(notesCollection(uid)).id;
  const ref = doc(db, "users", uid, "notes", noteId);
  await setDoc(
    ref,
    {
      title: note.title,
      content: note.content,
      updatedAt: serverTimestamp(),
      ...(note.id ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return noteId;
}

export async function deleteNote(uid: string, noteId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "notes", noteId));
}

export async function loadNotes(uid: string): Promise<ShortNote[]> {
  const q = query(notesCollection(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      content: data.content || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
    };
  });
}
