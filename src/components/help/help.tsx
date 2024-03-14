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
const CONTENT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +6, z: 4});
const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -8.5, z: 4});

const TEXT: [string, string, string][] = [
  ['ACTION',     'MOBILE',     'DESKTOP'],
  ['move left',  'drag left',  'left arrow'],
  ['move right', 'drag right', 'right arrow'],
  ['rotate',     'tap',        'up arrow'],
  ['soft drop',  'drag down',  'down arrow'],
  ['hard drop',  'swipe down', 'space'],
];

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
const Content = ({ position, opacity, text, isBold=false }: { position: Vector3, opacity: SpringValue<number>, text: string, isBold?: boolean }) => {
  return (
    <Text position={position} fontSize={0.7} letterSpacing={isBold ? 0.1 : 0.05} outlineWidth={isBold ? 0.04 : 0.01} outlineColor={0xFFFFFF}>
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

const Help = ({ onClose }: { onClose: () => void }) => {
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  useEffect(() => {
    api.start({ to: { opacity: 1 } });
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
      <Border position={BORDER_POSITION} width={BORDER_WIDTH} height={BORDER_HEIGHT} />

      <Heading position={HEADING_POSITION} opacity={opacity} text={'CONTROLS'} />

      {TEXT.map((text, index) => {
        const isBold = (index === 0);
        const pos0 = CONTENT_POSITION.clone().add({x: -5, y: -index * 1.1, z: 0});
        const pos1 = CONTENT_POSITION.clone().add({x: 0,  y: -index * 1.1, z: 0});
        const pos2 = CONTENT_POSITION.clone().add({x: 5,  y: -index * 1.1, z: 0});
        return (
          <group key={`${index}`}>
            <Content position={pos0} opacity={opacity} text={text[0]} isBold={isBold} />
            <Content position={pos1} opacity={opacity} text={text[1]} isBold={isBold} />
            <Content position={pos2} opacity={opacity} text={text[2]} isBold={isBold} />
          </group>
        )
      })}

      <Button position={BUTTON_POSITION} label={'CLOSE'} onButtonClick={onClose} />
    </>
  )
}

export { Help };