/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Text} from "@react-three/drei";
import {GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {ToastDetails} from "../../gameEngine.ts";
import {useCallback, useEffect, useState} from "react";
import {animated, useSpring} from "@react-spring/three";
import {Sound} from "../../sound.ts";

const DELAY_BETWEEN_TOASTS_MSECS = 1000;

const Toast = ({ details, onExpired }: { details: ToastDetails, onExpired: () => void }) => {
  const startPos = GridUtils.gridPosToScreen({ col: TetrisConstants.numCols * 0.5, row: details.row }).add({x: 0, y: 1.5, z: TetrisConstants.z.overlay1Offset});
  const endPos = GridUtils.gridPosToScreen({ col: TetrisConstants.numCols * 0.5, row: details.row }).add({x: 0, y: 3.5, z: TetrisConstants.z.overlay1Offset});

  const animation = useCallback(() => ({
    from: { positionX: startPos.x, positionY: startPos.y, positionZ: startPos.z, scale: 0, opacity: 0 },
    // @ts-ignore
    to: async (next)=> {
      await next({ positionX: endPos.x, positionY: endPos.y, positionZ: endPos.z, scale: 1, opacity: 0.8 })
      await next({ opacity: 1 })
      await next({ opacity: 0 })
    },
    config: { duration: 500 }
  }), []);

  const [{ positionX, positionY, positionZ, scale, opacity }, api] = useSpring(animation)

  useEffect(() => {
    api.start(animation)
    Sound.getInstance().playSoundFX(details.achievement);
    setTimeout(() => onExpired(), 1500);
  }, []);

  return (
    <animated.group
      position-x={positionX}
      position-y={positionY}
      position-z={positionZ}
      scale={scale}
    >
      <Text fontSize={1} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0xFFFFFF}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0x000000}
          opacity={opacity}
          transparent={true}
        />
        {details.achievement}
      </Text>
      {details.points > 0 ? <Text position-y={-1.5} fontSize={1} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0xFFFFFF}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0x000000}
          opacity={opacity}
          transparent={true}
        />
        {`+${details.points}`}
      </Text> : null}
    </animated.group>
  );
}

const queuedToasts: ToastDetails[] = [];
let lastProcessedTime: number = new Date().getTime();

const Toasts = ({ toasts }: { toasts: ToastDetails[] }) => {
  const [displayedToasts, setDisplayedToasts] = useState<ToastDetails[]>([]);
  const [toastCount, setToastCount] = useState(0);

  const removeDisplayedToast = useCallback((toastId: number) => {
    setDisplayedToasts(prevDisplayToasts => prevDisplayToasts.filter(dt => dt.id !== toastId));
  }, []);

  const addDisplayedToast = useCallback((toast: ToastDetails) => {
    setDisplayedToasts((prevDisplayToasts) => [...prevDisplayToasts, toast]);
  }, []);

  const processQueue = useCallback(() => {
    if (queuedToasts.length === 0) return;
    const msecsSinceLastProcessed = new Date().getTime() - lastProcessedTime;
    if (msecsSinceLastProcessed >= DELAY_BETWEEN_TOASTS_MSECS) {
      lastProcessedTime = new Date().getTime();
      addDisplayedToast(queuedToasts.shift() as ToastDetails);
    }
    if (queuedToasts.length > 0) {
      setTimeout(processQueue, DELAY_BETWEEN_TOASTS_MSECS);
    }
  }, [addDisplayedToast]);

  useEffect(() => {
    if (toasts.length === toastCount) return;

    setToastCount(toasts.length);

    // add to queued toasts
    for (let i=toastCount; i<toasts.length; i++) {
      queuedToasts.push(toasts[i]);
    }
    processQueue();

  }, [toasts, toastCount, processQueue]);

  return (
    <>
      {displayedToasts.map((displayedToast: ToastDetails) => <Toast key={displayedToast.id} details={displayedToast} onExpired={() => removeDisplayedToast(displayedToast.id)}/>)}
    </>
  )
}
export { Toasts };