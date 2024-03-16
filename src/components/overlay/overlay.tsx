import {Plane, Text, useTexture} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated, useSpring} from "@react-spring/three";
import {useEffect} from "react";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay2Offset});
const IMAGE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 2, z: TetrisConstants.z.overlay3Offset});
const TEXT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 1.7, z: TetrisConstants.z.overlay3Offset});
const SUB_HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 - 0.6, z: TetrisConstants.z.overlay3Offset});

const SubHeading = ({ text }: { text: string }) => {
  if (text === '') return null;
  return (
    <Text position={SUB_HEADING_POSITION} fontSize={1.5} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0x222222}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
      />
      {text}
    </Text>
  );
}

const Overlay = ({ subHeading=''}: { subHeading?: string }) => {
  const texture = useTexture('/tetris/image/tetris_blocks.png')
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  useEffect(() => {
    api.start({ to: { opacity: 0.5 } });
  }, []);

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
      <Plane position={IMAGE_POSITION} args={[TetrisConstants.gameWidth - 2, TetrisConstants.gameHeight - 17]}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          map={texture}
        />
      </Plane>
      <Text position={TEXT_POSITION} fontSize={3.75} letterSpacing={0.1} outlineWidth={0.2} outlineColor={0x000000}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0x000000}
        />
        {'TETRIS'}
      </Text>
      <SubHeading text={subHeading} />
    </>
  )
}

export { Overlay }