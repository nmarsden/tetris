import {Vector3, Color} from "three";
import {RoundedBox, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {useCallback, useMemo} from "react";
import {Sound} from "../../sound.ts";

export type ButtonType = 'LARGE' | 'MEDIUM' | 'INFO' | 'TAB' | 'TAB_UNSELECTED';

type ButtonInfo = {
  scale: number;
  width: number;
  fontSize: number;
  outlineWidth: number;
  outlineColor: Color;
  textColor: Color;
  bgColor: Color;
};

const BUTTON_INFO: Map<ButtonType, ButtonInfo> = new Map([
  [ 'LARGE',          { scale: 1,    width: 5,   fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'MEDIUM',         { scale: 0.8,  width: 5,   fontSize: 0.8, outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.blue } ],
  [ 'INFO',           { scale: 0.9,  width: 5,   fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'TAB',            { scale: 0.55, width: 8.5, fontSize: 1,   outlineWidth: 0.07, outlineColor: TetrisConstants.color.white, textColor: TetrisConstants.color.white, bgColor: TetrisConstants.color.black } ],
  [ 'TAB_UNSELECTED', { scale: 0.5,  width: 8.5, fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.grey,  textColor: TetrisConstants.color.grey,  bgColor: TetrisConstants.color.black } ]
]);

const Button = ({ position, label, type='LARGE', onButtonClick, enableSound=true, enabled=true }: { position: Vector3, label: string, type?: ButtonType, onButtonClick: () => void, enableSound?:boolean, enabled?:boolean }) => {
  const { scale, width, fontSize, outlineWidth, outlineColor, textColor, bgColor } = useMemo(() => {
    return BUTTON_INFO.get(type) as ButtonInfo;
  }, [type]);

  const onPointerDown = useCallback(() => {
    if (!enabled) return;
    if (enableSound) Sound.getInstance().play('BUTTON');
    onButtonClick();
  }, [enabled, onButtonClick]);

  return <group scale={scale} position={position}>
    <RoundedBox
      args={[width, TetrisConstants.cellSize * 2, TetrisConstants.cellSize]} // Width, height, depth. Default is [1, 1, 1]
      radius={0.2} // Radius of the rounded corners. Default is 0.05
      smoothness={4} // The number of curve segments. Default is 4
      bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      onPointerDown={onPointerDown}
    >
      <meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={bgColor}
      />
      <Text key={type} position={[0,0,1]} fontSize={fontSize} letterSpacing={0.1} outlineWidth={outlineWidth} outlineColor={outlineColor}>
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