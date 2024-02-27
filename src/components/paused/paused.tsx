import {Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";
import {animated, useSpring} from "@react-spring/three";
import {useEffect} from "react";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 2});
const TEXT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 3, z: 3});
const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 3});

const Paused = ({ onResume }: { onResume: () => void }) => {
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  useEffect(() => {
    api.start({ to: { opacity: 0.8 } });
  });

  return (
    <>
      <Plane position={OVERLAY_POSITION} args={[TetrisConstants.gameWidth, TetrisConstants.gameHeight]}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={TetrisConstants.color.black}
          opacity={opacity}
        />
      </Plane>
      <Text position={TEXT_POSITION} fontSize={2} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0xFFFFFF}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0xFFFFFF}
        />
        {'PAUSED'}
      </Text>
      <Button position={BUTTON_POSITION} label={'RESUME'} onButtonClick={onResume} />
    </>
  )
}

export { Paused }