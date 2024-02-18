import {Color} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";

const Block = ({ position, color } : { position: [number, number, number], color: Color }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[TetrisConstants.cellSize, TetrisConstants.cellSize, TetrisConstants.cellSize]} />
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
      />
    </mesh>
  )
}

export { Block }