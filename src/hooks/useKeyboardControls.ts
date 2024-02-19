import {useEffect, useState} from "react";

export type Movement = {
  moveLeft: boolean;
  moveRight: boolean;
  moveDown: boolean;
  rotateClockwise: boolean;
};

type MovementField = keyof Movement;

const useKeyboardControls = (): Movement => {
  const keys = new Map<string, MovementField>([
    ['ArrowLeft', 'moveLeft'],
    ['ArrowRight', 'moveRight'],
    ['ArrowDown', 'moveDown'],
    ['ArrowUp', 'rotateClockwise']
  ]);

  const movementFieldByKey = (key: string): MovementField | undefined => keys.get(key);

  const [movement, setMovement] = useState<Movement>({
    moveLeft: false,
    moveRight: false,
    moveDown: false,
    rotateClockwise: false
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