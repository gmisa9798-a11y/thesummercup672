import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { TabType, Team, Player, Match, TournamentInfo as TournamentInfoType } from './types';
import ErrorBoundary from './components/ErrorBoundary';

// Import the two separate sites
import PublicHome from './sites/public/PublicHome';
import AdminHome from './sites/admin/AdminHome';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('table');
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfoType | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // 1. URL & Environment Logic (The Switcher)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostname = window.location.hostname;
    const isDevPreview = hostname.includes('ais-dev') || hostname === 'localhost';
    
    if (params.get('mode') === 'admin') {
      setIsAdminMode(true);
      setActiveTab('admin');
    } else if (params.get('mode') === 'public') {
      setIsAdminMode(false);
      setActiveTab('table');
    } else if (isDevPreview) {
      setIsAdminMode(true);
      setActiveTab('admin');
    } else {
      setIsAdminMode(false);
    }
  }, []);

  // 2. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && isAdminMode) {
        setUser(firebaseUser);
        if (firebaseUser.email === 'gmisa9798@gmail.com') {
           try {
             await setDoc(doc(db, 'users', firebaseUser.uid), {
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               displayName: firebaseUser.displayName,
               photoURL: firebaseUser.photoURL,
               role: 'admin'
             }, { merge: true });
           } catch (e) { console.warn("Sync failed", e); }
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [isAdminMode]);

  // 3. Shared Data Fetching (Synchronization Layer)
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoadingData(false), 8000);

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
        setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
        setIsLoadingData(false);
        clearTimeout(timeout);
    });

    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
        setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
        setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
    });

    const unsubInfo = onSnapshot(doc(db, 'settings', 'tournament'), (docSnap) => {
        if (docSnap.exists()) setTournamentInfo({ id: docSnap.id, ...docSnap.data() } as TournamentInfoType);
    });

    return () => {
      clearTimeout(timeout);
      unsubTeams();
      unsubPlayers();
      unsubMatches();
      unsubInfo();
    };
  }, []);

  // 4. Login Action
  const handleLogin = async () => {
    setErrorStatus(null);
    const isIframe = window.self !== window.top;
    if (isIframe) setErrorStatus("iframe-warning");

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') setErrorStatus("domain-error");
      else if (error.code === 'auth/popup-blocked') setErrorStatus("popup-blocked");
      else setErrorStatus(error.message || "Сталася помилка");
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-pitch flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <p className="font-bold tracking-[4px] text-accent animate-pulse uppercase text-xs">SUMMERCUP672 ЗАВАНТАЖУЄТЬСЯ</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {isAdminMode ? (
        <AdminHome 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          teams={teams}
          players={players}
          matches={matches}
          tournamentInfo={tournamentInfo}
          user={user}
          handleLogin={handleLogin}
          errorStatus={errorStatus}
        />
      ) : (
        <PublicHome 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          teams={teams}
          players={players}
          matches={matches}
          tournamentInfo={tournamentInfo}
        />
      )}
    </ErrorBoundary>
  );
}
