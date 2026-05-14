import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
  defaultRate: number;
  timestamp: number;
}

const isConfigured = !!firebaseConfig.projectId;

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;

export async function submitScore(
  name: string,
  score: number,
  round: number,
  defaultRate: number
): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'leaderboard'), {
      name,
      score,
      round,
      defaultRate,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Failed to submit score:', err);
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
    entries.sort((a, b) => b.round - a.round || b.score - a.score);
    return entries.slice(0, 10);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
