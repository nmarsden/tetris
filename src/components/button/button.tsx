import {Vector3} from "three";
import {RoundedBox, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";

const Button = ({ position, label, width=TetrisConstants.cellSize * 5, onButtonClick }: { position: Vector3, label: string, width?: number, onButtonClick: () => void }) => {
  return <RoundedBox
    args={[width, TetrisConstants.cellSize * 2, TetrisConstants.cellSize]} // Width, height, depth. Default is [1, 1, 1]
    radius={0.2} // Radius of the rounded corners. Default is 0.05
    smoothness={4} // The number of curve segments. Default is 4
    bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
    creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
    position={position}
    onPointerDown={onButtonClick}
  >
    <meshStandardMaterial
      metalness={0.45}
      roughness={0.75}
      color={TetrisConstants.color.orange}
    />
    <Text position={[0,0,1]} fontSize={1} letterSpacing={0.1} outlineWidth={0.05} outlineColor={TetrisConstants.color.black}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={TetrisConstants.color.black}
      />
      {label}
    </Text>
  </RoundedBox>
}

export { Button };