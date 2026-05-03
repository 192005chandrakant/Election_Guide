import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { mergeUserProfile } from "./user-profile";

export type UserProfile = {
  uid: string;
  email: string | null;
  location?: string;
  isFirstTimeVoter?: boolean;
  electionDate?: string | null;
  readinessScore: number;
  checklistProgress: Record<string, boolean>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const nextProfile = mergeUserProfile(uid, {
      email: data.email ?? null,
      location: data.location ?? "Unknown",
      isFirstTimeVoter: typeof data.isFirstTimeVoter === "boolean" ? data.isFirstTimeVoter : true,
      electionDate: data.electionDate ?? null,
    });

    await setDoc(userRef, {
      ...nextProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
};
