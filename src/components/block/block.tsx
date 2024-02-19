import {Color} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";

const Block = ({ position, color, opacity = 1 } : { position: [number, number, number], color: Color, opacity?: number }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[TetrisConstants.cellSize, TetrisConstants.cellSize, TetrisConstants.cellSize]} />
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
        opacity={opacity}
        transparent={true}
      />
    </mesh>
  )
}

export { Block }