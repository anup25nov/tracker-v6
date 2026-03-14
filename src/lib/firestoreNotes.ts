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

export interface ShortNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const PAGE_SIZE = 10;
const MAX_CONTENT_LENGTH = 250;

export { MAX_CONTENT_LENGTH };

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
      content: note.content.slice(0, MAX_CONTENT_LENGTH),
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

/** Load notes page by page, sorted by updatedAt desc */
export async function loadNotes(
  uid: string,
  lastDoc?: QueryDocumentSnapshot | null
): Promise<{ notes: ShortNote[]; lastVisible: QueryDocumentSnapshot | null; hasMore: boolean }> {
  const q = lastDoc
    ? query(notesCollection(uid), orderBy("updatedAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE + 1))
    : query(notesCollection(uid), orderBy("updatedAt", "desc"), limit(PAGE_SIZE + 1));
  const snap = await getDocs(q);

  const hasMore = snap.docs.length > PAGE_SIZE;
  const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;
  const lastVisible = docs.length > 0 ? docs[docs.length - 1] : null;

  const notes: ShortNote[] = docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      content: data.content || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
    };
  });

  return { notes, lastVisible, hasMore };
}
