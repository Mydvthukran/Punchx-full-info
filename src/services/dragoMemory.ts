import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type DragoMemoryMessage = {
  sender: 'drago' | 'user';
  text: string;
  timestamp: number;
};

const MAX_MESSAGES = 40;
const LOCAL_PREFIX = 'punchx_drago_memory_';

function userKey() {
  return auth?.currentUser?.uid || '';
}

function localKey(uid: string) {
  return `${LOCAL_PREFIX}${uid}`;
}

export async function loadDragoMemory(): Promise<DragoMemoryMessage[]> {
  const uid = userKey();
  if (!uid) return [];

  try {
    const ref = doc(collection(db, 'dragoConversations'), uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const messages = Array.isArray(snap.data().messages) ? snap.data().messages : [];
      const clean = messages
        .filter((item: any) => (item?.sender === 'user' || item?.sender === 'drago') && typeof item?.text === 'string')
        .slice(-MAX_MESSAGES) as DragoMemoryMessage[];
      localStorage.setItem(localKey(uid), JSON.stringify(clean));
      return clean;
    }
  } catch (error) {
    console.warn('DRAGO cloud memory unavailable; using local memory.', error);
  }

  try {
    const local = JSON.parse(localStorage.getItem(localKey(uid)) || '[]');
    return Array.isArray(local) ? local.slice(-MAX_MESSAGES) : [];
  } catch {
    return [];
  }
}

export async function saveDragoMemory(messages: DragoMemoryMessage[]) {
  const uid = userKey();
  if (!uid) return;
  const clean = messages.slice(-MAX_MESSAGES);

  try {
    const ref = doc(collection(db, 'dragoConversations'), uid);
    await setDoc(ref, {
      userId: uid,
      messages: clean,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('DRAGO cloud memory save failed; retaining local memory.', error);
  }

  try {
    localStorage.setItem(localKey(uid), JSON.stringify(clean));
  } catch {
    // Storage can be unavailable in private browsing; cloud memory remains the source of truth.
  }
}

export function clearDragoMemory() {
  const uid = userKey();
  if (!uid) return;
  try { localStorage.removeItem(localKey(uid)); } catch {}
}

export function buildConversationContext(messages: DragoMemoryMessage[]) {
  return messages.slice(-24).map((message) => `${message.sender === 'user' ? 'User' : 'DRAGO'}: ${message.text}`).join('\n');
}
