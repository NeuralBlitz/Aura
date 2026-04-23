
import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Explorer', 
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura', 
    bio: 'AURA OS v9.0 Architect', 
    level: 9, 
    exp: 14200
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        setUserProfile(prev => ({
          ...prev,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`
        }));
        
        // Sync user profile to Firestore
        try {
          const userData: any = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            updatedAt: Date.now()
          };
          if (firebaseUser.email) userData.email = firebaseUser.email;
          
          await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true });
        } catch (e) {
          console.error("Failed to sync user profile to Firestore:", e);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    }, (error) => {
      console.error("Auth State Error:", error);
      setIsAuthChecking(false);
    });
    
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const signOut = () => auth.signOut();

  return {
    isAuthenticated,
    isAuthChecking,
    user,
    userProfile,
    updateProfile,
    signOut
  };
}
