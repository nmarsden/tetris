import {Plane} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";

const POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: -2});

const Background = () => {
  return (
    <>
      <Plane position={POSITION} args={[TetrisConstants.gameWidth, TetrisConstants.gameHeight]}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.black}
        />
      </Plane>
    </>
  )
}

export { Background }