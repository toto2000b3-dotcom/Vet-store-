import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  getDocs,
  doc, 
  getDocFromServer,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling according to instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// --- Types ---
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  desc?: string;
  benefits?: string;
  illness?: string;
  image?: string;
  deliveryFee?: number;
}

export interface Order {
  id: string;
  productName: string;
  price: number;
  timestamp: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalPaid: number;
}

export type Role = 'user' | 'clinic';

interface UserProfile {
  name: string;
  phone: string;
  address: string;
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  cart: Product[];
  profit: number;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addOrder: (product: Product) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  registerClinic: (data: any) => Promise<void>;
  checkClinicStatus: (phone: string) => Promise<'approved' | 'pending' | 'none'>;
  isAuthenticated: boolean;
  userRole: Role | null;
  userProfile: UserProfile | null;
  login: (role: Role, profile?: UserProfile) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Products
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });
    return () => unsubscribe();
  }, []);

  // Sync Orders (Only if logged in and role is clinic)
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'clinic') {
      setOrders([]);
      return;
    }
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ords.push({ 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date()
        } as Order);
      });
      setOrders(ords);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserProfile(null);
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const profit = orders.reduce((sum, order) => sum + order.price, 0);

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), newProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const registerClinic = async (data: any) => {
    try {
      await addDoc(collection(db, 'clinics'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clinics');
    }
  };

  const checkClinicStatus = async (phone: string): Promise<'approved' | 'pending' | 'none'> => {
    try {
      const q = query(collection(db, 'clinics'), where('phone', '==', phone));
      const result = await getDocs(q);
      if (result.empty) return 'none';
      const data = result.docs[0].data();
      return data.status as 'approved' | 'pending';
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'clinics');
      return 'none';
    }
  };

  const addOrder = async (product: Product) => {
    if (!userProfile) return;
    
    try {
      await addDoc(collection(db, 'orders'), {
        productName: product.name,
        price: product.price,
        timestamp: serverTimestamp(),
        customerName: userProfile.name,
        customerPhone: userProfile.phone,
        customerAddress: userProfile.address,
        totalPaid: product.price + (product.deliveryFee || 0) + 250
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const login = async (role: Role, profile?: UserProfile) => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setUserRole(role);
      if (profile) setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserRole(null);
    setUserProfile(null);
    clearCart();
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        cart,
        profit,
        addProduct,
        addOrder,
        addToCart,
        removeFromCart,
        clearCart,
        isAuthenticated,
        userRole,
        userProfile,
        login,
        logout,
        loading,
        registerClinic,
        checkClinicStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
