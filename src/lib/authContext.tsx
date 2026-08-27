import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';
import { NamoIDUserInfo } from '@namoidhq/js';

interface AuthContextType {
  currentUser: NamoIDUserInfo | null;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithNamoID: (identity: NamoIDUserInfo, role?: 'citizen' | 'worker' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; activeRole?: 'citizen' | 'worker' | 'admin' }> = ({ children, activeRole = 'citizen' }) => {
  const [currentUser, setCurrentUser] = useState<NamoIDUserInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedIdentity = localStorage.getItem('punchx_namoid_identity');
    const storedProfile = localStorage.getItem('punchx_namoid_profile');
    if (storedIdentity && storedProfile) {
      try {
        setCurrentUser(JSON.parse(storedIdentity));
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoadingProfile(false);
  }, []);

  const fetchOrCreateProfile = async (identity: NamoIDUserInfo, role: 'citizen' | 'worker' | 'admin' = activeRole) => {
    try {
      setIsLoadingProfile(true);
      const userDocRef = doc(db, 'users', identity.sub);

      const userSnap = await Promise.race([
        getDoc(userDocRef),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore connection timeout')), 2500)
        )
      ]);

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          uid: identity.sub,
          email: existingData.email || identity.email || '',
          photoURL: existingData.photoURL || identity.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          name: existingData.name || identity.name || (identity.email ? identity.email.split('@')[0] : 'PunchX Member'),
          role: existingData.role || role,
          address: existingData.address !== undefined ? existingData.address : '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
          phone: existingData.phone || identity.phone_number || ''
        };
        
        setUserProfile(updatedProfile);
        localStorage.setItem('punchx_namoid_profile', JSON.stringify(updatedProfile));
      } else {
        const newProfile: UserProfile = {
          uid: identity.sub,
          name: identity.name || (identity.email ? identity.email.split('@')[0] : 'PunchX Member'),
          email: identity.email || '',
          photoURL: identity.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          role: role,
          address: '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
          phone: identity.phone_number || '',
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
        localStorage.setItem('punchx_namoid_profile', JSON.stringify(newProfile));
      }
    } catch (error) {
      console.warn('Notice fetching or creating user profile:', error);
      const fallbackProfile: UserProfile = {
        uid: identity.sub,
        name: identity.name || identity.email?.split('@')[0] || 'PunchX Member',
        email: identity.email || '',
        photoURL: identity.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: role,
        address: '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
        phone: identity.phone_number || ''
      };
      setUserProfile(fallbackProfile);
      localStorage.setItem('punchx_namoid_profile', JSON.stringify(fallbackProfile));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loginWithNamoID = async (identity: NamoIDUserInfo, role?: 'citizen' | 'worker' | 'admin') => {
    setCurrentUser(identity);
    localStorage.setItem('punchx_namoid_identity', JSON.stringify(identity));
    await fetchOrCreateProfile(identity, role);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.sub);
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userDocRef, payload);
      setUserProfile((prev) => {
        const next = prev ? { ...prev, ...payload } : null;
        if (next) localStorage.setItem('punchx_namoid_profile', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      setUserProfile((prev) => {
        const next = prev ? { ...prev, ...updates } : null;
        if (next) localStorage.setItem('punchx_namoid_profile', JSON.stringify(next));
        return next;
      });
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem('punchx_namoid_identity');
      localStorage.removeItem('punchx_namoid_profile');
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
        refreshProfile,
        loginWithNamoID
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
