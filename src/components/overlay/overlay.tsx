import {Plane, Text, useTexture} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated} from "@react-spring/three";
import {Border} from "../border/border.tsx";

const MODAL_WIDTH = TetrisConstants.gameWidth;
const MODAL_HEIGHT = TetrisConstants.gameHeight-8;
const MODAL_BORDER_WIDTH = MODAL_WIDTH - 0.05;
const MODAL_BORDER_HEIGHT = MODAL_HEIGHT - 0.05;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset});
const MODAL_BORDER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -(MODAL_BORDER_WIDTH*0.5), y: -1 +(MODAL_BORDER_HEIGHT*0.5), z: TetrisConstants.z.overlay3Offset + 0.01});

const IMAGE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 3.5, z: TetrisConstants.z.overlay3Offset + 0.05});
const TEXT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 3.2, z: TetrisConstants.z.overlay3Offset + 0.1});
const SUB_HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 0.9, z: TetrisConstants.z.overlay3Offset + 0.1});

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

  return (
    <>
      {/*Modal*/}
      <Plane position={MODAL_POSITION} args={[MODAL_WIDTH, MODAL_HEIGHT]}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={TetrisConstants.color.black}
          opacity={1}
        />
      </Plane>
      <Border position={MODAL_BORDER_POSITION} width={MODAL_BORDER_WIDTH} height={MODAL_BORDER_HEIGHT} />
      {/*Logo*/}
      <Plane position={IMAGE_POSITION} args={[TetrisConstants.gameWidth - 2, TetrisConstants.gameHeight - 17]}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          map={texture}
        />
      </Plane>
      <Text position={TEXT_POSITION} fontSize={3.65} letterSpacing={0.1} outlineWidth={0.2} outlineColor={0x000000}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0x000000}
        />
        {'TETRIS'}
      </Text>
      {/*Sub Heading*/}
      <SubHeading text={subHeading} />
    </>
  )
}

export { Overlay }