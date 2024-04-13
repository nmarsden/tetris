import {createContext, PropsWithChildren, useCallback, useEffect, useState} from 'react';

interface AppState {
  bestScore: number;
  musicVolume: number;
  soundFXVolume: number;
  cameraShake: boolean;
  confetti: boolean;
  popups: boolean;
  background: boolean;
  version: number;
}

interface AppContextProps {
  appState: AppState;
  setBestScore: (bestScore: number) => void;
  setMusicVolume: (musicVolume: number) => void;
  setSoundFXVolume: (musicVolume: number) => void;
  setCameraShake: (cameraShake: boolean) => void;
  setConfetti: (confetti: boolean) => void;
  setPopups: (popups: boolean) => void;
  setBackground: (background: boolean) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

type AppProviderProps = { /* no props */ };

const LOCAL_STORAGE_KEY = 'tetris';

const INITIAL_STATE: AppState = {
  bestScore: 0,
  musicVolume: 1,
  soundFXVolume: 1,
  cameraShake: true,
  confetti: true,
  popups: true,
  background: true,
  version: 0.2
};

const getInitialAppState = () => {
  try {
    // Get from local storage by key
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    // Parse stored json or if none return initialValue
    const appState = item ? JSON.parse(item) : INITIAL_STATE;

    // Update old version of appState
    if (typeof appState.version === 'undefined') {
      appState.cameraShake = true;
      appState.confetti = true;
      appState.popups = true;
      appState.version = 0.1;
      storeAppState(appState);
    } else if (appState.version === 0.1) {
      appState.background = true;
      appState.version = 0.2
      storeAppState(appState);
    }
    return appState;
  } catch (error) {
    // If error also return initialValue
    console.log(error);
    return INITIAL_STATE;
  }
};

const storeAppState = (appState: AppState): void => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
};

const AppProvider = ({ children }: PropsWithChildren<AppProviderProps>) => {
  const [appState, setAppState] = useState<AppState>(getInitialAppState());

  useEffect(() => {
    storeAppState(appState);
  }, [appState]);

  const setBestScore = useCallback((bestScore: number) => {
    setAppState((prevState) => ({...prevState, bestScore}));
  }, []);

  const setMusicVolume = useCallback((musicVolume: number) => {
    setAppState((prevState) => ({...prevState, musicVolume}));
  }, []);

  const setSoundFXVolume = useCallback((soundFXVolume: number) => {
    setAppState((prevState) => ({...prevState, soundFXVolume}));
  }, []);

  const setCameraShake = useCallback((cameraShake: boolean) => {
    setAppState((prevState) => ({...prevState, cameraShake}));
  }, []);

  const setConfetti = useCallback((confetti: boolean) => {
    setAppState((prevState) => ({...prevState, confetti}));
  }, []);

  const setPopups = useCallback((popups: boolean) => {
    setAppState((prevState) => ({...prevState, popups}));
  }, []);

  const setBackground = useCallback((background: boolean) => {
    setAppState((prevState) => ({...prevState, background}));
  }, []);

  return (
    <AppContext.Provider value={{
      appState,
      setBestScore,
      setMusicVolume,
      setSoundFXVolume,
      setCameraShake,
      setConfetti,
      setPopups,
      setBackground
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;