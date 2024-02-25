import {Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 2});
const TEXT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 + 2.5, z: 3});
const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 3});

const GameOver = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <>
      <Plane position={OVERLAY_POSITION} args={[TetrisConstants.gameWidth, TetrisConstants.gameHeight]}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.black}
          opacity={0.8}
          transparent={true}
        />
      </Plane>
      <Text position={TEXT_POSITION} fontSize={1.5} letterSpacing={0.1} outlineWidth={0.075} outlineColor={0xFFFFFF}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0xFFFFFF}
        />
        {'GAME OVER'}
      </Text>
      <Button position={BUTTON_POSITION} label={'RETRY'} onButtonClick={onRetry} />
    </>
  )
}

export { GameOver }