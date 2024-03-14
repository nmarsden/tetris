import {Vector3} from "three";
import {RoundedBox, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";

export type ButtonType = 'LARGE' | 'MEDIUM' | 'INFO';

const SCALE: Map<ButtonType, number> = new Map([
  [ 'LARGE',  1 ],
  [ 'MEDIUM', 4 / 5 ],
  [ 'INFO',   4.5 / 5 ]
]);

const Button = ({ position, label, type='LARGE', onButtonClick }: { position: Vector3, label: string, type?: ButtonType, onButtonClick: () => void }) => {
  const scale = SCALE.get(type);
  const fontSize = type === 'MEDIUM' ? 0.8 : 1;
  const color = type === 'MEDIUM' ? TetrisConstants.color.blue : TetrisConstants.color.orange;

  return <group scale={scale} position={position}>
    <RoundedBox
      args={[TetrisConstants.cellSize * 5, TetrisConstants.cellSize * 2, TetrisConstants.cellSize]} // Width, height, depth. Default is [1, 1, 1]
      radius={0.2} // Radius of the rounded corners. Default is 0.05
      smoothness={4} // The number of curve segments. Default is 4
      bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      onPointerDown={onButtonClick}
    >
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
      />
      <Text position={[0,0,1]} fontSize={fontSize} letterSpacing={0.1} outlineWidth={0.05} outlineColor={TetrisConstants.color.black}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.black}
        />
        {label}
      </Text>
    </RoundedBox>
  </group>
}

export { Button };