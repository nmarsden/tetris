import {Vector3, Color} from "three";
import {RoundedBox, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";

export type ButtonType = 'LARGE' | 'MEDIUM' | 'INFO' | 'TAB' | 'TAB_UNSELECTED';

type ButtonInfo = {
  scale: number;
  width: number;
  fontSize: number;
  textColor: Color;
  bgColor: Color;
};

const BUTTON_INFO: Map<ButtonType, ButtonInfo> = new Map([
  [ 'LARGE',          { scale: 1,    width: 5, fontSize: 1,   textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'MEDIUM',         { scale: 0.8,  width: 5, fontSize: 0.8, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.blue } ],
  [ 'INFO',           { scale: 0.9,  width: 5, fontSize: 1,   textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'TAB',            { scale: 0.8,  width: 8, fontSize: 1,   textColor: TetrisConstants.color.white, bgColor: TetrisConstants.color.black } ],
  [ 'TAB_UNSELECTED', { scale: 0.75, width: 8, fontSize: 1,   textColor: TetrisConstants.color.grey,  bgColor: TetrisConstants.color.black } ]
]);

const Button = ({ position, label, type='LARGE', onButtonClick }: { position: Vector3, label: string, type?: ButtonType, onButtonClick: () => void }) => {
  const { scale, width, fontSize, textColor, bgColor } = BUTTON_INFO.get(type) as ButtonInfo;

  return <group scale={scale} position={position}>
    <RoundedBox
      args={[width, TetrisConstants.cellSize * 2, TetrisConstants.cellSize]} // Width, height, depth. Default is [1, 1, 1]
      radius={0.2} // Radius of the rounded corners. Default is 0.05
      smoothness={4} // The number of curve segments. Default is 4
      bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      onPointerDown={onButtonClick}
    >
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={bgColor}
      />
      <Text position={[0,0,1]} fontSize={fontSize} letterSpacing={0.1} outlineWidth={0.05} outlineColor={TetrisConstants.color.black}>
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={textColor}
        />
        {label}
      </Text>
    </RoundedBox>
  </group>
}

export { Button };