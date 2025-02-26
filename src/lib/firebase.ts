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
export const db = getFirestore(app);

// Initialize offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      }
    });
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  title?: string;
  bio?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  employmentDetails?: {
    startDate: Date;
    employeeId: string;
    contractType: 'full-time' | 'part-time' | 'contractor';
    department: string;
  };
  performanceMetrics?: {
    lastReviewDate: Date;
    rating: number;
    goals: {
      id: string;
      title: string;
      status: 'pending' | 'in-progress' | 'completed';
      dueDate: Date;
    }[];
  };
  role: UserRole;
  department: string;
  position?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  skills: string[];
  certifications: Certification[];
  reportsTo?: string;
  team?: string[];
  schedule?: Schedule;
  documents: Document[];
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
  displayName?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationUrl?: string;
}

export interface Document {
  id: string;
  type: 'contract' | 'id' | 'certification' | 'hr' | 'training' | 'performance' | 'other';
  name: string;
  url: string;
  size: number;
  format: string;
  version: number;
  previousVersions?: {
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  category: string;
  tags: string[];
  accessRoles: UserRole[];
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Schedule {
  workDays: string[];
  workHours: {
    id: string;
    start: string;
    end: string;
    breaks: {
      start: string;
      end: string;
    }[];
  };
  timeZone: string;
  availability: {
    date: Date;
    status: 'available' | 'busy' | 'out-of-office';
    note?: string;
  }[];
  vacationDays: {
    id: string;
    start: Date;
    end: Date;
    type: 'vacation' | 'sick' | 'personal';
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    note?: string;
  }[];
  conflicts?: {
    id: string;
    type: 'schedule' | 'vacation' | 'meeting';
    description: string;
    affectedUsers: string[];
    status: 'active' | 'resolved';
  }[];
}

export interface TeamData {
  id: string;
  name: string;
  description: string;
  objectives: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: Date;
  }[];
  leader: string;
  members: string[];
  roles: {
    userId: string;
    role: string;
    permissions: string[];
  }[];
  projects: string[];
  resources: {
    id: string;
    type: 'budget' | 'equipment' | 'software' | 'other';
    name: string;
    status: 'available' | 'in-use' | 'maintenance';
    assignedTo?: string;
  }[];
  meetings: {
    id: string;
    title: string;
    date: Date;
    duration: number;
    attendees: string[];
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  performance: {
    metrics: {
      name: string;
      value: number;
      target: number;
      period: string;
    }[];
    reviews: {
      id: string;
      date: Date;
      reviewer: string;
      rating: number;
      comments: string;
    }[];
  };
  department: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export const uploadDocument = async (
  file: File,
  metadata: Omit<Document, 'id' | 'url' | 'size' | 'format' | 'uploadedAt' | 'uploadedBy'>
): Promise<string> => {
  try {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const documentsRef = collection(db, 'documents');
    await addDoc(documentsRef, {
      ...metadata,
      url,
      size: file.size,
      format: file.type,
      uploadedAt: serverTimestamp(),
      uploadedBy: auth.currentUser?.uid,
      version: 1
    });

    return url;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const updateSchedule = async (
  userId: string,
  schedule: Partial<Schedule>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      schedule: {
        ...schedule,
        lastModified: serverTimestamp()
      }
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const requestTimeOff = async (
  userId: string,
  request: Omit<Schedule['vacationDays'][0], 'id' | 'status' | 'approvedBy' | 'approvedAt'>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserData;

    const newRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending'
    };

    await updateDoc(userRef, {
      'schedule.vacationDays': [
        ...(userData.schedule?.vacationDays || []),
        newRequest
      ]
    });

    // Notify team leader
    if (userData.reportsTo) {
      await createNotification({
        type: 'vacation_request',
        title: 'New Time-off Request',
        message: `${userData.fullName} has requested time off from ${request.start.toLocaleDateString()} to ${request.end.toLocaleDateString()}`,
        recipientId: userData.reportsTo,
        read: false,
        actionUrl: `/admin/team/schedule/${userId}`
      });
    }
  } catch (error) {
    console.error('Error requesting time off:', error);
    throw error;
  }
};

export const approveTimeOff = async (
  userId: string,
  requestId: string,
  approved: boolean,
  approverId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserData;

    const updatedRequests = userData.schedule?.vacationDays.map(request =>
      request.id === requestId ? {
        ...request,
        status: approved ? 'approved' : 'rejected',
        approvedBy: approverId,
        approvedAt: new Date()
      } : request
    );

    await updateDoc(userRef, {
      'schedule.vacationDays': updatedRequests
    });

    // Notify employee
    await createNotification({
      type: 'vacation_request',
      title: 'Time-off Request Update',
      message: `Your time-off request has been ${approved ? 'approved' : 'rejected'}`,
      recipientId: userId,
      read: false,
      actionUrl: '/admin/team/schedule'
    });
  } catch (error) {
    console.error('Error approving time off:', error);
    throw error;
  }
};

export interface Notification {
  id: string;
  type: 'team_update' | 'role_change' | 'document_request' | 'vacation_request' | 'certification_expiry';
  title: string;
  message: string;
  recipientId: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export const updateTeamMember = async (
  userId: string,
  updates: Partial<UserData>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      'metadata.lastModified': serverTimestamp(),
      'metadata.version': increment(1)
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

export const createTeam = async (team: Omit<TeamData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const teamsRef = collection(db, 'teams');
    const docRef = await addDoc(teamsRef, {
      ...team,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (teamId: string, updates: Partial<TeamData>): Promise<void> => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const getTeamMembers = async (teamId: string): Promise<UserData[]> => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) throw new Error('Team not found');

    const team = teamDoc.data() as TeamData;
    const memberPromises = team.members.map(memberId => 
      getDoc(doc(db, 'users', memberId))
    );

    const memberDocs = await Promise.all(memberPromises);
    return memberDocs
      .filter(doc => doc.exists())
      .map(doc => ({ ...doc.data(), id: doc.id }) as UserData);
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
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
  data: HeaderData | HeroData | TestimonialsData | FeaturesData | FooterData | any;
  currentVersion: string;
  versions: ContentVersion[];
  lastModified: FirebaseFirestore.Timestamp;
  lastModifiedBy: string;
}

export interface FooterLink {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
  order: number;
  status: 'active' | 'inactive';
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  order: number;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  url: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

export interface FooterData {
  logo: {
    url: string;
    alt: string;
  };
  description: string;
  sections: FooterSection[];
  social: SocialLink[];
  contact: ContactInfo;
  copyright: string;
  legalLinks: FooterLink[];
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
}

export const defaultFooterData: FooterData = {
  logo: {
    url: '',
    alt: 'Creative Cactus'
  },
  description: 'Transforming brands through creative digital solutions.',
  sections: [
    {
      id: '1',
      title: 'Quick Links',
      order: 0,
      links: [
        {
          id: '1',
          label: 'Admin Portal',
          path: '/admin',
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
        },
        {
          id: '5',
          label: 'Careers',
          path: '/careers',
          isExternal: false,
          order: 4,
          status: 'active'
        }
      ]
    },
    {
      id: '2',
      title: 'Services',
      order: 1,
      links: [
        {
          id: '1',
          label: 'Digital Marketing',
          path: '/services/digital-marketing',
          isExternal: false,
          order: 0,
          status: 'active'
        },
        {
          id: '2',
          label: 'Brand Design',
          path: '/services/branding',
          isExternal: false,
          order: 1,
          status: 'active'
        },
        {
          id: '3',
          label: 'Web Development',
          path: '/services/web-development',
          isExternal: false,
          order: 2,
          status: 'active'
        },
        {
          id: '4',
          label: 'Social Media',
          path: '/services/social-media',
          isExternal: false,
          order: 3,
          status: 'active'
        }
      ]
    }
  ],
  social: [
    {
      id: '1',
      platform: 'facebook',
      url: 'https://facebook.com',
      order: 0,
      status: 'active'
    },
    {
      id: '2',
      platform: 'twitter',
      url: 'https://twitter.com',
      order: 1,
      status: 'active'
    },
    {
      id: '3',
      platform: 'instagram',
      url: 'https://instagram.com',
      order: 2,
      status: 'active'
    },
    {
      id: '4',
      platform: 'linkedin',
      url: 'https://linkedin.com',
      order: 3,
      status: 'active'
    }
  ],
  contact: {
    email: 'hello@creativecactus.mx',
    phone: '+52 (55) 1234-5678'
  },
  copyright: '© 2024 Creative Cactus. All rights reserved.',
  legalLinks: [
    {
      id: '1',
      label: 'Privacy Policy',
      path: '/privacy',
      isExternal: false,
      order: 0,
      status: 'active'
    },
    {
      id: '2',
      label: 'Terms of Service',
      path: '/terms',
      isExternal: false,
      order: 1,
      status: 'active'
    }
  ],
  metadata: {
    lastModified: serverTimestamp(),
    lastModifiedBy: 'system',
    version: 1
  }
};
export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface FeaturesData {
  items: FeatureItem[];
  metadata: {
    lastModified: FirebaseFirestore.Timestamp;
    lastModifiedBy: string;
    version: number;
  };
}

export const defaultFeaturesData: FeaturesData = {
  items: [
    {
      id: '1',
      title: 'Data-driven Marketing',
      description: 'Strategic approach to digital marketing based on data analysis and measurable results.',
      icon: 'LineChart',
      status: 'active',
      order: 0
    },
    {
      id: '2',
      title: 'Creative Design',
      description: 'Unique and innovative design solutions that help your brand stand out.',
      icon: 'Brush',
      status: 'active',
      order: 1
    },
    {
      id: '3',
      title: 'Expert Team',
      description: 'Skilled professionals with diverse expertise in digital transformation.',
      icon: 'Users',
      status: 'active',
      order: 2
    },
    {
      id: '4',
      title: 'Measurable Results',
      description: 'Focus on delivering quantifiable outcomes and ROI for your business.',
      icon: 'Target',
      status: 'active',
      order: 3
    }
  ],
  metadata: {
    lastModified: serverTimestamp(),
    lastModifiedBy: 'system',
    version: 1
  }
};
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
    
    if (!docSnap.exists()) {
      // Return default data based on content type
      const defaultData: ContentBlock = {
        id: type,
        type,
        data: type === 'header' ? defaultHeaderData :
              type === 'hero' ? defaultHeroData :
              type === 'testimonials' ? defaultTestimonialsData :
              type === 'features' ? defaultFeaturesData :
              type === 'footer' ? defaultFooterData : {},
        currentVersion: '',
        versions: [],
        lastModified: serverTimestamp()
      }
      return defaultData;
    }

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      lastModified: data.lastModified || serverTimestamp()
    } as ContentBlock;
  } catch (error) {
    console.error(`Error fetching ${type} content block:`, error);
    // Return default data on error instead of throwing
    return {
      id: type,
      type,
      data: type === 'header' ? defaultHeaderData :
            type === 'hero' ? defaultHeroData :
            type === 'testimonials' ? defaultTestimonialsData :
            type === 'features' ? defaultFeaturesData :
            type === 'footer' ? defaultFooterData : {},
      currentVersion: '',
      versions: [],
      lastModified: serverTimestamp()
    };
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
    // Basic validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure');
    }

    // Ensure data has metadata
    const versionData = {
      ...data,
      metadata: {
        lastModified: serverTimestamp(),
        lastModifiedBy: userId,
        version: (data.metadata?.version || 0) + 1
      }
    };

    // Validate header data if required
    if (type === 'header' && validate && !validateHeaderData(versionData)) {
      throw new Error('Invalid header data structure');
    }

    const contentRef = doc(db, 'content', type);
    const versionRef = doc(collection(db, 'content', type, 'versions'));
    
    const version: ContentVersion = {
      id: versionRef.id,
      contentId: type,
      data: versionData,
      createdAt: serverTimestamp(),
      createdBy: userId,
      status,
      scheduledFor: scheduledFor || null
    };
    
    // Save version first
    await setDoc(versionRef, {
      ...version,
      data: versionData
    });
    
    // Update main document for drafts and published content
    if (status === 'published' || status === 'draft') {
      await updateDoc(contentRef, {
        data: versionData,
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