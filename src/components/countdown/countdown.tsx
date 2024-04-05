/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Circle, Text} from "@react-three/drei";
import {GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {useSpring, animated, config, AnimationResult} from '@react-spring/three'
import {useCallback, useEffect, useState} from "react";
import {Sound} from "../../sound.ts";

const TEXT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset + 0.01});

const Countdown = ({ onCountdownDone }: { onCountdownDone: () => void}) => {
  const [count, setCount] = useState(3);

  const animation = useCallback(() => ({
    from: { scale: 0, opacity: 0 },
    // @ts-ignore
    to: async (next)=> {
      await next({ scale: 3, opacity: 1 })
      await next({ scale: 0.5, opacity: 0 })
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
  }), [count]);

  const [{ scale, opacity }, api] = useSpring(animation)

  useEffect(() => {
    api.start(animation)
    Sound.getInstance().stopMusic();
    Sound.getInstance().playSoundFX('COUNT');
  }, [count]);

  return <>
    <animated.group position={TEXT_POSITION} scale={scale} >
      <Circle args={[2, 64]} position-y={0.2}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.white}
          opacity={opacity}
          transparent={true}
        />
      </Circle>
      <Text fontSize={1.8} letterSpacing={0.1} outlineWidth={0.075} outlineColor={0x000000}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0x000000}
          opacity={opacity}
          transparent={true}
        />
        {count}
      </Text>
    </animated.group>
  </>
}

export { Countdown };