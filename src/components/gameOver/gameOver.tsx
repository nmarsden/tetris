import {Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";

const POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: 0, y: 0, z: 1});

const GameOver = () => {
  return (
    <>
      <Plane position={POSITION} args={[TetrisConstants.gameWidth + 0.1, 6]}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.black}
          opacity={0.8}
          transparent={true}
        />
      </Plane>
      <Text position={POSITION} fontSize={1.5} letterSpacing={0.1} outlineWidth={0.075} outlineColor={0xFFFFFF}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={0xFFFFFF}
        />
        {'GAME OVER'}
      </Text>
    </>
  )
}

export { GameOver }