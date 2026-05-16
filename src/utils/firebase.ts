import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export interface LeaderboardEntry {
  name: string;
  score: number;
  round: number;
  maxRounds: number;
  defaultRate: number;
  timestamp: number;
}

const isConfigured = !!firebaseConfig.projectId;

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;

function survivalRate(entry: LeaderboardEntry): number {
  const max = entry.maxRounds || 30;
  return entry.round / max;
}

function scorePerRound(entry: LeaderboardEntry): number {
  const max = entry.maxRounds || 30;
  return entry.score / max;
}

function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.sort((a, b) => {
    const rateDiff = survivalRate(b) - survivalRate(a);
    if (rateDiff !== 0) return rateDiff;
    return scorePerRound(b) - scorePerRound(a);
  });
}

// Creates a placeholder entry when the game starts. Returns the Firestore doc ID
// so we can delete it when the game ends.
export async function createInitialEntry(name: string, maxRounds: number): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, 'leaderboard'), {
      name,
      score: 0,
      round: 1,
      maxRounds,
      defaultRate: 0,
      timestamp: Date.now(),
    });
    return ref.id;
  } catch (err) {
    console.error('Failed to create initial entry:', err);
    return null;
  }
}

// Deletes the placeholder entry (if any) then writes the final authoritative score.
export async function replaceFinalScore(
  initialDocId: string | null,
  name: string,
  score: number,
  round: number,
  maxRounds: number,
  defaultRate: number
): Promise<void> {
  if (!db) return;
  const data = { name, score, round, maxRounds, defaultRate, timestamp: Date.now() };

  if (initialDocId) {
    try {
      await deleteDoc(doc(db, 'leaderboard', initialDocId));
    } catch {
      // Delete blocked by rules — the placeholder stays, but we still write the final entry.
    }
  }

  try {
    await addDoc(collection(db, 'leaderboard'), data);
  } catch (err) {
    console.error('Failed to submit final score:', err);
  }
}

export async function getAllLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('round', 'desc'),
      limit(1000)
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    return sortEntries(entries);
  } catch (err) {
    console.error('Failed to fetch full leaderboard:', err);
    return [];
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('round', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    return sortEntries(entries).slice(0, 10);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
