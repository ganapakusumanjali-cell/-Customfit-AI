import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CustomGarmentConfig, OrderRecord, BodyMeasurements } from '../types/garment';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client appears offline or using cached state.");
    }
  }
}
testConnection();

// Standard Error Handling conforming to Firebase Skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth helpers
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    // Sync user doc
    if (res.user) {
      await syncUserProfile(res.user);
    }
    return res.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<FirebaseUser> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  if (res.user) {
    await syncUserProfile(res.user, name);
  }
  return res.user;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

async function syncUserProfile(user: FirebaseUser, displayName?: string) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        name: displayName || user.displayName || 'CustomFit Client',
        email: user.email || '',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn('Profile sync warning:', error);
  }
}

// Designs CRUD with Firestore & LocalStorage fallback
const LOCAL_DESIGNS_KEY = 'customfit_local_designs';
const LOCAL_ORDERS_KEY = 'customfit_local_orders';

export async function saveDesignToFirestore(design: CustomGarmentConfig, userId?: string): Promise<string> {
  const designId = design.id || 'design_' + Date.now();
  const designPayload = {
    ...design,
    id: designId,
    userId: userId || auth.currentUser?.uid || 'guest_user',
    updatedAt: new Date().toISOString()
  };

  // Always keep in localStorage for resilience
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_DESIGNS_KEY) || '[]');
    const filtered = local.filter((d: CustomGarmentConfig) => d.id !== designId);
    filtered.unshift(designPayload);
    localStorage.setItem(LOCAL_DESIGNS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Local storage write warning', e);
  }

  // If signed in, sync to Firestore
  if (auth.currentUser) {
    const path = `designs/${designId}`;
    try {
      await setDoc(doc(db, 'designs', designId), designPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  return designId;
}

export async function fetchUserDesigns(userId?: string): Promise<CustomGarmentConfig[]> {
  const uid = userId || auth.currentUser?.uid;
  let remoteDesigns: CustomGarmentConfig[] = [];

  if (uid && auth.currentUser) {
    const path = 'designs';
    try {
      const q = query(
        collection(db, 'designs'),
        where('userId', '==', uid)
      );
      const snap = await getDocs(q);
      snap.forEach(doc => {
        remoteDesigns.push(doc.data() as CustomGarmentConfig);
      });
    } catch (err) {
      console.warn('Could not fetch from Firestore, falling back to local', err);
    }
  }

  // Combine with local designs
  try {
    const localRaw = localStorage.getItem(LOCAL_DESIGNS_KEY);
    if (localRaw) {
      const localList: CustomGarmentConfig[] = JSON.parse(localRaw);
      const combined = [...remoteDesigns];
      localList.forEach(item => {
        if (!combined.some(c => c.id === item.id)) {
          combined.push(item);
        }
      });
      return combined;
    }
  } catch (e) {
    // ignore
  }

  return remoteDesigns;
}

export async function deleteDesignFromDb(designId: string): Promise<void> {
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_DESIGNS_KEY) || '[]');
    const filtered = local.filter((d: CustomGarmentConfig) => d.id !== designId);
    localStorage.setItem(LOCAL_DESIGNS_KEY, JSON.stringify(filtered));
  } catch (e) {
    // ignore
  }

  if (auth.currentUser) {
    const path = `designs/${designId}`;
    try {
      await deleteDoc(doc(db, 'designs', designId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

// Orders CRUD
export async function saveOrderToFirestore(order: OrderRecord): Promise<string> {
  const orderId = order.id || 'order_' + Date.now();
  const orderPayload = {
    ...order,
    id: orderId,
    userId: order.userId || auth.currentUser?.uid || 'guest_user',
    createdAt: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
    local.unshift(orderPayload);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(local));
  } catch (e) {
    console.warn('Local storage write warning', e);
  }

  if (auth.currentUser) {
    const path = `orders/${orderId}`;
    try {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  return orderId;
}

export async function fetchUserOrders(userId?: string): Promise<OrderRecord[]> {
  const uid = userId || auth.currentUser?.uid;
  let remoteOrders: OrderRecord[] = [];

  if (uid && auth.currentUser) {
    const path = 'orders';
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', uid)
      );
      const snap = await getDocs(q);
      snap.forEach(doc => {
        remoteOrders.push(doc.data() as OrderRecord);
      });
    } catch (err) {
      console.warn('Could not fetch orders from Firestore', err);
    }
  }

  try {
    const localRaw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (localRaw) {
      const localList: OrderRecord[] = JSON.parse(localRaw);
      const combined = [...remoteOrders];
      localList.forEach(item => {
        if (!combined.some(c => c.id === item.id)) {
          combined.push(item);
        }
      });
      return combined;
    }
  } catch (e) {
    // ignore
  }

  return remoteOrders;
}
