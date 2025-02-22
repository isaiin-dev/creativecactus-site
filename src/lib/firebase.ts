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
import { enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

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
export const storage = getStorage(app);

// Initialize Firestore with persistence and offline capabilities
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  }
});

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  data: any;
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'pending' | 'published' | 'scheduled';
  scheduledFor?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ContentBlock {
  id: string;
  type: 'header' | 'footer' | 'hero' | 'services' | 'testimonials' | 'features';
  data: HeaderData | HeroData | TestimonialsData | any;
  currentVersion: string;
  versions: ContentVersion[];
  lastModified: FirebaseFirestore.Timestamp;
  lastModifiedBy: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  position: string;
  company: string;
  photoUrl?: string;
  testimonial: string;
  rating: number;
  status: 'active' | 'inactive';
  publishedAt: FirebaseFirestore.Timestamp;
  order: number;
}

export interface TestimonialsData {
  items: TestimonialItem[];
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
}

export const defaultTestimonialsData: TestimonialsData = {
  items: [
    {
      id: '1',
      name: 'Isabella Rodríguez',
      position: 'CEO',
      company: 'TechVision MX',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      testimonial: 'Creative Cactus transformed our digital presence completely. Their strategic approach and creative solutions helped us achieve a 300% growth in online engagement.',
      rating: 5,
      status: 'active',
      publishedAt: serverTimestamp(),
      order: 0
    },
    {
      id: '2',
      name: 'Miguel Hernández',
      position: 'Marketing Director',
      company: 'InnovaMex',
      photoUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      testimonial: 'Working with Creative Cactus has been a game-changer for our business. Their team\'s expertise and dedication to our success exceeded all expectations.',
      rating: 5,
      status: 'active',
      publishedAt: serverTimestamp(),
      order: 1
    }
  ],
  metadata: {
    lastModified: serverTimestamp(),
    lastModifiedBy: 'system',
    version: 1
  }
};
export interface HeaderData {
  logo: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  navigation: Array<{
    id: string;
    label: string;
    path: string;
    isExternal?: boolean;
    order: number;
    status: 'active' | 'inactive';
  }>;
  showLanguageSwitcher: boolean;
  showAdminPortal: boolean;
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
}

export interface HeroData {
  title: {
    main: string;
    creative: string;
    solutions: string;
  };
  subtitle: string;
  cta: {
    primary: {
      text: string;
      link: string;
    };
    secondary: {
      text: string;
      link: string;
    };
  };
  background: {
    gradientStart: string;
    gradientMiddle: string;
    gradientEnd: string;
  };
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
}

export const defaultHeroData: HeroData = {
  title: {
    main: 'Grow Your Brand with',
    creative: 'Creative',
    solutions: 'Solutions'
  },
  subtitle: 'We transform your vision into digital success. Creative strategies, measurable results, and innovative solutions tailored for your business.',
  cta: {
    primary: {
      text: 'Get Started',
      link: '/contact'
    },
    secondary: {
      text: 'Our Services',
      link: '/services'
    }
  },
  background: {
    gradientStart: '#96C881',
    gradientMiddle: '#1a1a1a',
    gradientEnd: '#E4656E'
  },
  metadata: {
    lastModified: serverTimestamp(),
    lastModifiedBy: 'system',
    version: 1
  }
};
export const defaultHeaderData: HeaderData = {
  logo: {
    url: '',
    alt: 'Creative Cactus',
    width: 160,
    height: 40
  },
  navigation: [
    {
      id: '1',
      label: 'Home',
      path: '/',
      isExternal: false,
      order: 0,
      status: 'active'
    },
    {
      id: '2',
      label: 'About',
      path: '/about',
      isExternal: false,
      order: 1,
      status: 'active'
    },
    {
      id: '3',
      label: 'Services',
      path: '/services',
      isExternal: false,
      order: 2,
      status: 'active'
    },
    {
      id: '4',
      label: 'Contact',
      path: '/contact',
      isExternal: false,
      order: 3,
      status: 'active'
    }
  ],
  showLanguageSwitcher: true,
  showAdminPortal: true,
  metadata: {
    lastModified: serverTimestamp(),
    lastModifiedBy: 'system',
    version: 1
  }
};

export const initializeHeaderCollection = async (userId: string): Promise<void> => {
  try {
    const headerRef = doc(db, 'content', 'header');
    const headerDoc = await getDoc(headerRef);

    if (!headerDoc.exists()) {
      const initialData: ContentBlock = {
        id: 'header',
        type: 'header',
        data: defaultHeaderData,
        currentVersion: '',
        versions: [],
        lastModified: serverTimestamp(),
        lastModifiedBy: userId
      };

      await setDoc(headerRef, initialData);
      console.info('Header collection initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing header collection:', error);
    throw new Error('Failed to initialize header collection');
  }
};

export const validateHeaderData = (data: HeaderData): boolean => {
  try {
    // Validate logo
    if (!data.logo || typeof data.logo.url !== 'string' || typeof data.logo.alt !== 'string') {
      return false;
    }

    // Validate navigation items
    if (!Array.isArray(data.navigation)) {
      return false;
    }

    for (const item of data.navigation) {
      if (!item.id || !item.label || !item.path || typeof item.order !== 'number') {
        return false;
      }
    }

    // Validate boolean flags
    if (typeof data.showLanguageSwitcher !== 'boolean' || typeof data.showAdminPortal !== 'boolean') {
      return false;
    }

    // Validate metadata
    if (!data.metadata || !data.metadata.version || typeof data.metadata.version !== 'number') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Header data validation error:', error);
    return false;
  }
};

export const getContentBlock = async (type: ContentBlock['type']): Promise<ContentBlock | null> => {
  try {
    const docRef = doc(db, 'content', type);
    const docSnap = await getDoc(docRef);
    
    // Initialize with default data if document doesn't exist
    if (!docSnap.exists()) {
      const contentData = type === 'header' ? defaultHeaderData : {};
      const initialData: ContentBlock = {
        id: type,
        type,
        data: contentData,
        currentVersion: '',
        versions: [],
        lastModified: serverTimestamp(),
        lastModifiedBy: 'system'
      };

      // Crear el documento con los datos iniciales
      await setDoc(docRef, initialData);
      return initialData;
    }
    
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      lastModified: data.lastModified || serverTimestamp()
    } as ContentBlock;
  } catch (error) {
    console.error(`Error fetching ${type} content block:`, error);
    throw error;
  }
};

export const initializeHeaderIfNeeded = async (): Promise<ContentBlock> => {
  try {
    const headerBlock = await getContentBlock('header');
    return headerBlock;
  } catch (error) {
    console.error('Error initializing header:', error);
    throw error;
  }
};

export const updateContentBlock = async (
  type: ContentBlock['type'],
  data: any,
  userId: string,
  validate: boolean = true,
  status: ContentVersion['status'] = 'draft',
  scheduledFor?: Date
): Promise<void> => {
  try {
    // Validate header data if required
    if (type === 'header' && validate && !validateHeaderData(data)) {
      throw new Error('Invalid header data structure');
    }

    const contentRef = doc(db, 'content', type);
    const versionRef = doc(collection(db, 'content', type, 'versions'));
    
    const version: ContentVersion = {
      id: versionRef.id,
      contentId: type,
      data,
      createdAt: new Date(),
      createdBy: userId,
      status,
      scheduledFor
    };
    
    await setDoc(versionRef, version);
    
    if (status === 'published') {
      // Update metadata for header
      if (type === 'header') {
        data.metadata = {
          ...data.metadata,
          lastModified: serverTimestamp(),
          lastModifiedBy: userId,
          version: (data.metadata?.version || 0) + 1
        };
      }

      await updateDoc(contentRef, {
        data,
        currentVersion: versionRef.id,
        lastModified: serverTimestamp(),
        lastModifiedBy: userId
      });
    }
  } catch (error) {
    console.error('Error updating content block:', error);
    throw error;
  }
};

export const approveContentVersion = async (
  type: ContentBlock['type'],
  versionId: string,
  userId: string
): Promise<void> => {
  try {
    const versionRef = doc(db, 'content', type, 'versions', versionId);
    
    await updateDoc(versionRef, {
      status: 'published',
      approvedBy: userId,
      approvedAt: serverTimestamp()
    });
    
    const versionSnap = await getDoc(versionRef);
    const version = versionSnap.data() as ContentVersion;
    
    await updateDoc(doc(db, 'content', type), {
      data: version.data,
      currentVersion: versionId,
      lastModified: serverTimestamp(),
      lastModifiedBy: userId
    });
  } catch (error) {
    console.error('Error approving content version:', error);
    throw error;
  }
};
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
