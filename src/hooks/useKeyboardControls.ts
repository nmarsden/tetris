import {useEffect, useState} from "react";

export type Action = {
  moveLeft: boolean;
  moveRight: boolean;
  moveDown: boolean;
  rotateClockwise: boolean;
  pause: boolean;
  start: boolean;
};

type ActionField = keyof Action;

const useKeyboardControls = (): Action => {
  const keys = new Map<string, ActionField>([
    ['ArrowLeft', 'moveLeft'],
    ['ArrowRight', 'moveRight'],
    ['ArrowDown', 'moveDown'],
    ['ArrowUp', 'rotateClockwise'],
    ['KeyP', 'pause'],
    ['Enter', 'start']
  ]);

  const actionFieldByKey = (key: string): ActionField | undefined => keys.get(key);

  const [action, setAction] = useState<Action>({
    moveLeft: false,
    moveRight: false,
    moveDown: false,
    rotateClockwise: false,
    pause: false,
    start: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setAction((m) => {
        return actionFieldByKey(e.code) ? ({ ...m, [actionFieldByKey(e.code) as string]: true }) : m;
      })
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setAction((m) =>{
        return actionFieldByKey(e.code) ? ({ ...m, [actionFieldByKey(e.code) as string]: false }) : m;
      })
    };
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return action
}

export { useKeyboardControls }