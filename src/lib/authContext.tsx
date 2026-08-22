import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; activeRole?: 'citizen' | 'worker' | 'admin' }> = ({ children, activeRole = 'citizen' }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Fetch or initialize user profile document in Firestore using auth UID
  const fetchOrCreateProfile = async (user: User, role: 'citizen' | 'worker' | 'admin' = activeRole) => {
    try {
      setIsLoadingProfile(true);
      const userDocRef = doc(db, 'users', user.uid);

      // Wrap getDoc with a 2.5s timeout to prevent hanging when offline
      const userSnap = await Promise.race([
        getDoc(userDocRef),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore connection timeout')), 2500)
        )
      ]);

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        // Keep existing user-entered fields, backfill missing auth details if necessary
        const updatedProfile: UserProfile = {
          ...existingData,
          uid: user.uid,
          email: existingData.email || user.email || '',
          photoURL: existingData.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          name: existingData.name || user.displayName || (user.email ? user.email.split('@')[0] : 'PunchX Member'),
          role: existingData.role || role,
          address: existingData.address !== undefined ? existingData.address : '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
          phone: existingData.phone || user.phoneNumber || ''
        };
        
        setUserProfile(updatedProfile);
      } else {
        // Create new profile for first-time login
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'PunchX Member'),
          email: user.email || '',
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          role: role,
          address: '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
          phone: user.phoneNumber || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await Promise.race([
            setDoc(userDocRef, newProfile),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Firestore setDoc timeout')), 2000)
            )
          ]);
        } catch (e) {
          console.warn("SetDoc offline fallback notice:", e);
        }
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.warn('Notice fetching or creating user profile (offline mode active):', error);
      // Fallback in-memory profile if Firestore is temporarily offline
      setUserProfile({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'PunchX Member',
        email: user.email || '',
        photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: role,
        address: '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
        phone: user.phoneNumber || ''
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateProfile(user);
      } else {
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userDocRef, payload);
      setUserProfile((prev) => (prev ? { ...prev, ...payload } : null));
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Apply locally even if offline
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrCreateProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoadingProfile,
        updateUserProfile,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
