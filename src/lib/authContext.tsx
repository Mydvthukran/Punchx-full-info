import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInWithCredential, OAuthProvider, signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { NamoIDUserInfo } from '@namoidhq/js';

interface AuthContextType {
  currentUser: NamoIDUserInfo | null;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithNamoID: (identity: NamoIDUserInfo, role?: 'citizen' | 'worker' | 'admin', idToken?: string) => Promise<UserProfile | null>;
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

  const fetchOrCreateProfile = async (identity: NamoIDUserInfo, role: 'citizen' | 'worker' | 'admin' = activeRole): Promise<UserProfile> => {
    const extractedName = identity.name || 
      ((identity as any).given_name ? `${(identity as any).given_name} ${(identity as any).family_name || ''}`.trim() : '') || 
      (identity.email ? identity.email.split('@')[0] : 'PunchX Member');

    const extractedDob = ((identity as any).birthdate as string) || 
      ((identity as any).dob as string) || 
      ((identity as any).date_of_birth as string) || 
      ((identity as any).birth_date as string) || 
      '';

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
          photoURL: existingData.photoURL || (identity.picture as string) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          name: existingData.name || extractedName,
          dob: existingData.dob || existingData.birthdate || extractedDob,
          birthdate: existingData.birthdate || existingData.dob || extractedDob,
          isProfileCompleted: existingData.isProfileCompleted ?? (!!existingData.name && !!(existingData.dob || existingData.birthdate) && !!existingData.address),
          role: existingData.role || role,
          address: existingData.address !== undefined ? existingData.address : '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
          phone: existingData.phone || identity.phone_number || ''
        };
        
        setUserProfile(updatedProfile);
        localStorage.setItem('punchx_namoid_profile', JSON.stringify(updatedProfile));
        return updatedProfile;
      } else {
        const isCompleted = !!extractedName && !!extractedDob;
        const newProfile: UserProfile = {
          uid: identity.sub,
          name: extractedName,
          email: identity.email || '',
          photoURL: (identity.picture as string) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          role: role,
          dob: extractedDob,
          birthdate: extractedDob,
          isProfileCompleted: isCompleted,
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
        return newProfile;
      }
    } catch (error) {
      console.warn('Notice fetching or creating user profile:', error);
      const fallbackProfile: UserProfile = {
        uid: identity.sub,
        name: extractedName,
        email: identity.email || '',
        photoURL: (identity.picture as string) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: role,
        dob: extractedDob,
        birthdate: extractedDob,
        isProfileCompleted: false,
        address: '42nd Galaxy Towers, Block C, Bengaluru, KA 560001',
        phone: identity.phone_number || ''
      };
      setUserProfile(fallbackProfile);
      localStorage.setItem('punchx_namoid_profile', JSON.stringify(fallbackProfile));
      return fallbackProfile;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loginWithNamoID = async (identity: NamoIDUserInfo, role?: 'citizen' | 'worker' | 'admin', idToken?: string) => {
    setCurrentUser(identity);
    localStorage.setItem('punchx_namoid_identity', JSON.stringify(identity));
    
    // Connect NamoID to Firebase Auth using native OIDC integration
    if (idToken) {
      try {
        const provider = new OAuthProvider('oidc.namoid');
        const credential = provider.credential({
          idToken: idToken,
        });
        await signInWithCredential(auth, credential);
        console.log("Firebase Auth signed in successfully via NamoID.");
      } catch (fbAuthErr) {
        console.error("Failed to sign into Firebase with NamoID token:", fbAuthErr);
      }
    }

    return await fetchOrCreateProfile(identity, role);
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
      await signOut(auth);
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
