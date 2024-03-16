import {Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useEffect} from "react";
import {Border} from "../border/border.tsx";
import {Button} from "../button/button.tsx";
import {Vector3} from "three";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 4});
const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;
const BORDER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 - (BORDER_WIDTH * 0.5), y: -1 + (BORDER_HEIGHT * 0.5), z: 5});
const HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +8.5, z: 4});

const CLOSE_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -8, z: 4});


const Heading = ({ position, opacity, text }: { position: Vector3, opacity: SpringValue<number>, text: string }) => {
  return (
    <Text position={position} fontSize={1} letterSpacing={0.1} outlineWidth={0.05} outlineColor={0xFFFFFF}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={opacity}
        transparent={true}
      />
      {text}
    </Text>
  );
};

const Options = ({ onClose }: { onClose: () => void }) => {
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  useEffect(() => {
    api.start({ to: { opacity: 1 } });
  }, [api]);

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
      <Border position={BORDER_POSITION} width={BORDER_WIDTH} height={BORDER_HEIGHT} />

      <Heading position={HEADING_POSITION} opacity={opacity} text={'OPTIONS'} />

      <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} onButtonClick={onClose} />
    </>
  )
}

export { Options };