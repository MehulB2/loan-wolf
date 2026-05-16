import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, setDoc, doc } from 'firebase/firestore';

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

export async function upsertScore(
  gameId: string,
  name: string,
  score: number,
  round: number,
  maxRounds: number,
  defaultRate: number,
  isFinal = false
): Promise<void> {
  if (!db) return;
  const data = { name, score, round, maxRounds, defaultRate, timestamp: Date.now() };
  try {
    await setDoc(doc(db, 'leaderboard', gameId), data);
  } catch {
    // setDoc failed (likely Firestore rules block updates on existing docs).
    // For final submissions, fall back to addDoc so the score always lands.
    if (isFinal) {
      try {
        await addDoc(collection(db, 'leaderboard'), data);
      } catch (err) {
        console.error('Failed to submit final score:', err);
      }
    }
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
