import { useState } from 'react';

export type Store = {
  bestScore: number;
  musicVolume: number;
  soundFXVolume: number;
};

const INITIAL_STORE: Store = {
  bestScore: 0,
  musicVolume: 1,
  soundFXVolume: 1
};

export default function useLocalStorage(key:string) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : INITIAL_STORE;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return INITIAL_STORE;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: Store) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}