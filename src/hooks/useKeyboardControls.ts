import {useCallback, useEffect, useState} from "react";

export type Action = {
  moveLeft: boolean;
  moveRight: boolean;
  moveDown: boolean;
  rotateClockwise: boolean;
  hardDrop: boolean;
  pause: boolean;
};

export type ActionField = keyof Action;

const useKeyboardControls = (): [ Action, (actionField: ActionField, value: boolean) => void ] => {
  const keys = new Map<string, ActionField>([
    ['ArrowLeft', 'moveLeft'],
    ['ArrowRight', 'moveRight'],
    ['ArrowDown', 'moveDown'],
    ['ArrowUp', 'rotateClockwise'],
    ['Space', 'hardDrop'],
    ['KeyP', 'pause']
  ]);

  const actionFieldByKey = (key: string): ActionField | undefined => keys.get(key);

  const [action, setAction] = useState<Action>({
    moveLeft: false,
    moveRight: false,
    moveDown: false,
    rotateClockwise: false,
    hardDrop: false,
    pause: false
  });

  const setActionField = useCallback((actionField: ActionField, value: boolean) => {
    setAction((m) => {
      return actionField ? ({ ...m, [actionField]: value }) : m;
    })
  }, []);

  const setActionValue = useCallback((keyCode: string, isKeyDown: boolean) => {
    setAction((m) => {
      return actionFieldByKey(keyCode) ? ({ ...m, [actionFieldByKey(keyCode) as string]: isKeyDown }) : m;
    })
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActionValue(e.code, true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setActionValue(e.code, false);
    };
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return [ action, setActionField ];
}

export { useKeyboardControls }