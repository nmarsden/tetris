import {useMemo, useRef} from "react";
import {Mesh, Color} from "three";
import {GridPos, GridUtils} from "../grid/grid.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";

const Block = ({ gridPos, color } : { gridPos: GridPos, color: Color }) => {
  const meshRef = useRef<Mesh>(null!)
  const position = useMemo(() => {
    return GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
  }, [gridPos]);
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
      />
    </mesh>
  )
}

export { Block }