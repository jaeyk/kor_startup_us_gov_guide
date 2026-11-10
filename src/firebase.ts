// Loaded on demand by the feedback dialog, so readers who never open it don't
// download the Firebase SDK.
import { initializeApp } from "firebase/app"
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export type { User }

export function watchUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  return signInWithPopup(auth, provider)
}

export function signOut() {
  return firebaseSignOut(auth)
}

export type FeedbackEntry = {
  // 0 is the whole book, N is chapter N.
  chapterNumber: number
  chapterTitle: string
  quote: string
  wantToKnow: string
  why: string
}

// Field names and limits must match `firestore.rules`.
export function submitFeedback(user: User, entry: FeedbackEntry) {
  return addDoc(collection(db, "feedback"), {
    ...entry,
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? "",
    page: window.location.href.slice(0, 500),
    createdAt: serverTimestamp(),
  })
}

export type StoredFeedback = FeedbackEntry & {
  id: string
  uid: string
  email: string
  name: string
  page: string
  createdAt: Date | null
}

// A user is an admin when `admins/{uid}` exists. Create that document in the
// Firebase console; `firestore.rules` lets each user check only their own.
export async function isAdmin(user: User) {
  const snapshot = await getDoc(doc(db, "admins", user.uid))
  return snapshot.exists()
}

export async function listFeedback(): Promise<StoredFeedback[]> {
  const snapshot = await getDocs(
    query(collection(db, "feedback"), orderBy("createdAt", "desc")),
  )
  return snapshot.docs.map((entry) => {
    const data = entry.data()
    return {
      ...(data as Omit<StoredFeedback, "id" | "createdAt">),
      id: entry.id,
      createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? null,
    }
  })
}

export function deleteFeedback(id: string) {
  return deleteDoc(doc(db, "feedback", id))
}
