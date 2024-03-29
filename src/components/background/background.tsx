import {Plane} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";

const POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.backgroundOffset});

const Background = () => {
  return (
    <>
      {/* Note: this is not visible, but it determines the bounds of the game */}
      <Plane position={POSITION} args={[TetrisConstants.gameWidth, TetrisConstants.gameHeight]} visible={false} />
    </>
  )
}

export { Background }