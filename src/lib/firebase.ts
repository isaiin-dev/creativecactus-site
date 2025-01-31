import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  price?: number;
  status: 'active' | 'inactive';
  category: string;
  order: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(userCredential.user.uid);
    
    if (!role) {
      throw new Error('User role not found');
    }

    // Update last login
    const userData: UserData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role,
      displayName: userCredential.user.displayName || undefined,
      lastLogin: new Date(),
      createdAt: new Date(userCredential.user.metadata.creationTime!)
    };

    return userData;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  phone?: string;
}

export const registerUser = async (data: RegistrationData): Promise<void> => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone || null,
      status: 'active', // active, suspended
      createdAt: serverTimestamp(),
      emailVerified: false
    });
    
    // Create registration request
    await setDoc(doc(db, 'registrationRequests', userCredential.user.uid), {
      userId: userCredential.user.uid,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone || null,
      status: 'active',
      createdAt: serverTimestamp()
    });

    // Sign out the user until approved
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createService = async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
  const servicesRef = collection(db, 'services');
  const newService = {
    ...service,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await setDoc(doc(servicesRef), newService);
  return docRef;
};

export const updateService = async (id: string, updates: Partial<Service>) => {
  const serviceRef = doc(db, 'services', id);
  await updateDoc(serviceRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteService = async (id: string) => {
  const serviceRef = doc(db, 'services', id);
  const serviceDoc = await getDoc(serviceRef);
  
  if (serviceDoc.exists()) {
    const data = serviceDoc.data() as Service;
    // Delete associated image if exists
    if (data.imageUrl) {
      const imageRef = ref(storage, data.imageUrl);
      await deleteObject(imageRef);
    }
  }
  
  await deleteDoc(serviceRef);
};

export const getServices = async () => {
  const servicesRef = collection(db, 'services');
  const q = query(servicesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
};

export const uploadServiceImage = async (file: File) => {
  const storageRef = ref(storage, `services/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
