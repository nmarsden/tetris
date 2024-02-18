import {useEffect, useState} from "react";

export type Movement = {
  left: boolean;
  right: boolean;
};

type MovementField = keyof Movement;

const useKeyboardControls = (): Movement => {
  const keys = new Map<string, MovementField>([
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right']
  ]);

  const movementFieldByKey = (key: string): MovementField | undefined => keys.get(key);

  const [movement, setMovement] = useState({
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setMovement((m) => {
        return movementFieldByKey(e.code) ? ({ ...m, [movementFieldByKey(e.code) as string]: true }) : m;
      })
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setMovement((m) =>{
        return movementFieldByKey(e.code) ? ({ ...m, [movementFieldByKey(e.code) as string]: false }) : m;
      })
    };
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return movement
}

export { useKeyboardControls }