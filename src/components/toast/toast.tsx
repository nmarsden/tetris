/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Text} from "@react-three/drei";
import {GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {ToastDetails} from "../../gameEngine.ts";
import {useCallback, useEffect, useState} from "react";
import {animated, useSpring} from "@react-spring/three";
import {Sound} from "../../sound.ts";

const DELAY_BETWEEN_TOASTS_MSECS = 1000;

type DisplayedToast = {
  key: number;
  toast: ToastDetails;
};

const Toast = ({ details }: { details: ToastDetails }) => {
  const startPos = GridUtils.gridPosToScreen({ col: TetrisConstants.numCols * 0.5, row: details.row }).add({x: 0, y: 1.5, z: 3});
  const endPos = GridUtils.gridPosToScreen({ col: TetrisConstants.numCols * 0.5, row: details.row }).add({x: 0, y: 3.5, z: 3});

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
    Sound.getInstance().play(details.achievement);
  }, []);

  return (
    <animated.group
      position-x={positionX}
      position-y={positionY}
      position-z={positionZ}
      scale={scale}
    >
      <Text fontSize={1} letterSpacing={0.1} outlineWidth={0.05} outlineColor={0xFFFFFF}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0xFFFFFF}
          opacity={opacity}
          transparent={true}
        />
        {details.achievement}
      </Text>
      {details.points > 0 ? <Text position-y={-1.5} fontSize={1} letterSpacing={0.1} outlineWidth={0.05} outlineColor={0xFFFFFF}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0xFFFFFF}
          opacity={opacity}
          transparent={true}
        />
        {`+${details.points}`}
      </Text> : null}
    </animated.group>
  );
}

const Toasts = ({ toasts }: { toasts: ToastDetails[] }) => {
  const [displayedToasts, setDisplayedToasts] = useState<DisplayedToast[]>([]);
  const [toastCount, setToastCount] = useState(0);

  useEffect(() => {
    if (toasts.length === toastCount) return;

    setToastCount(toasts.length);

    // Note: no delay for the first toast when no toasts are currently displayed
    let delay = displayedToasts.length * DELAY_BETWEEN_TOASTS_MSECS;

    // display each toast after delay
    for (let i=toastCount; i<toasts.length; i++) {
      setTimeout(() => {
        setDisplayedToasts((prevDisplayToasts) => {
          const newDisplayToasts = [...prevDisplayToasts, { key: i, toast: toasts[i] }];
          // remove displayToast after 2 seconds
          setTimeout(() => {
            setDisplayedToasts((prevDisplayToasts) => {
              return prevDisplayToasts.filter(dt => dt.key !== i)
            })
          }, 2000);

          return newDisplayToasts;
        });
      }, delay);
      delay = delay + DELAY_BETWEEN_TOASTS_MSECS;
    }
  }, [toasts, toastCount]);

  return (
    <>
      {displayedToasts.map((displayedToast: DisplayedToast) => <Toast key={displayedToast.key} details={displayedToast.toast} />)}
    </>
  )
}
export { Toasts };