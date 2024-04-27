import {createContext, PropsWithChildren, useCallback, useEffect, useState} from 'react';

export type Score = {
  score: number;
  level: number;
  lines: number;
};

interface AppState {
  bestScores: Score[];
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
  setBestScores: (bestScores: Score[]) => void;
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
  bestScores: [],
  musicVolume: 1,
  soundFXVolume: 1,
  cameraShake: true,
  confetti: true,
  popups: true,
  background: true,
  version: 0.3
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setIfUndefined = (appState: any, field: string, value: number | boolean) : void => {
  if (typeof appState[field] === 'undefined') {
    appState[field] = value;
  }
};

const getInitialAppState = () => {
  try {
    // Get from local storage by key
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    // Parse stored json or if none return initialValue
    const appState = item ? JSON.parse(item) : INITIAL_STATE;

    // Update old version of appState
    if (typeof appState.version === 'undefined' || appState.version < 0.3) {
      setIfUndefined(appState, 'cameraShake', true);
      setIfUndefined(appState, 'confetti', true);
      setIfUndefined(appState, 'popups', true);
      setIfUndefined(appState, 'background', true);
      if (typeof appState.bestScore !== 'undefined') {
        appState.bestScores = [{ score: appState.bestScore, level: -1, lines: -1 }];
        appState.bestScore = undefined;
      }
      appState.version = 0.3;
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

  const setBestScores = useCallback((bestScores: Score[]) => {
    setAppState((prevState) => ({...prevState, bestScores: [...bestScores]}));
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
      setBestScores,
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