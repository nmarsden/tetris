/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Circle, Ring, Text3D} from "@react-three/drei";
import {GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {useSpring, animated, config, AnimationResult} from '@react-spring/three'
import {useCallback, useEffect, useState} from "react";
import {Sound} from "../../sound.ts";

const COUNTDOWN_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset});

const CIRCLE_RADIUS = 2.5;
const CIRCLE_BORDER_WIDTH = 0.2;

const Countdown = ({ onCountdownDone }: { onCountdownDone: () => void}) => {
  const [count, setCount] = useState(3);

  const animation = useCallback(() => ({
    from: { scale: 0, opacity: 0, circleOpacity: 0 },
    // @ts-ignore
    to: async (next)=> {
      await next({ scale: 3, opacity: 1, circleOpacity: 0.1 })
      await next({ scale: 0.5, opacity: 0, circleOpacity: 0 })
    },
    onRest: (result: AnimationResult) => {
      if (!result.finished) return;
      if (count === 1) {
        onCountdownDone();
        return;
      }
      setCount(count - 1);
    },
    config: config.stiff
  }), [count, onCountdownDone]);

  const [{ scale, opacity, circleOpacity }, api] = useSpring(animation)

  useEffect(() => {
    api.start(animation)
    Sound.getInstance().stopMusic();
    Sound.getInstance().playSoundFX('COUNT');
  }, [animation, api, count]);

  return <>
    <animated.group position={COUNTDOWN_POSITION} scale={scale}>
      <Circle args={[CIRCLE_RADIUS, 64]} position-y={0.1}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.grey}
          opacity={circleOpacity}
          transparent={true}
        />
      </Circle>
      <Ring args={[CIRCLE_RADIUS, CIRCLE_RADIUS + CIRCLE_BORDER_WIDTH, 64]} position-y={0.1}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.grey}
          opacity={opacity}
          transparent={true}
        />
      </Ring>
      <Text3D
        position-x={count === 1 ? -1.15 : -1.4}
        position-y={-1.4}
        castShadow={false}
        curveSegments={8}
        bevelEnabled
        bevelSize={0.25}
        bevelThickness={0.5}
        height={0.2}
        lineHeight={0.6}
        letterSpacing={0.01}
        size={3.1}
        font="/tetris/Inter_Bold.json"
      >
        {count}
        <animated.meshStandardMaterial
          metalness={0.25}
          roughness={0.75}
          color={TetrisConstants.color.grey}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </animated.group>
  </>
}

export {Countdown};