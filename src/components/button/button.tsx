import {Vector3, Color, Texture, Mesh} from "three";
import {Decal, Plane, RoundedBox, Text, useTexture} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {useCallback, useMemo, useRef} from "react";
import {Sound} from "../../sound.ts";
import {ThreeEvent} from "@react-three/fiber/dist/declarations/src/core/events.js";
import {SpringValue, animated, useSpringValue, useSpring} from "@react-spring/three";

export type ButtonType = 'SMALL' | 'LARGE' | 'MEDIUM' | 'INFO' | 'TAB' | 'TAB_UNSELECTED';

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
  [ 'SMALL',          { scale: 1,    width: 2,   fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'LARGE',          { scale: 1,    width: 5,   fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'MEDIUM',         { scale: 0.8,  width: 5,   fontSize: 0.8, outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.grey } ],
  [ 'INFO',           { scale: 0.9,  width: 5,   fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.black, textColor: TetrisConstants.color.black, bgColor: TetrisConstants.color.orange } ],
  [ 'TAB',            { scale: 0.55, width: 8.5, fontSize: 1,   outlineWidth: 0.07, outlineColor: TetrisConstants.color.white, textColor: TetrisConstants.color.white, bgColor: TetrisConstants.color.black } ],
  [ 'TAB_UNSELECTED', { scale: 0.5,  width: 8.5, fontSize: 1,   outlineWidth: 0.05, outlineColor: TetrisConstants.color.grey,  textColor: TetrisConstants.color.grey,  bgColor: TetrisConstants.color.black } ]
]);

type ButtonProps = {
  position: Vector3,
  icon?: string;
  label?: string,
  opacity?: SpringValue<number>,
  type?: ButtonType,
  onButtonClick: () => void,
  enableSound?:boolean,
  enabled?:boolean
};

const AnimatedRoundedBox = animated(RoundedBox);

const Button = ({ position, icon, label, type='LARGE', opacity, onButtonClick, enableSound=true, enabled=true }: ButtonProps) => {
  const mesh = useRef<Mesh>(null!);
  const texture = useTexture(icon ? `/tetris/image/${icon}` : []);
  const defaultOpacity = useSpringValue(1);
  if (!enabled) {
    defaultOpacity.set(0.5);
  }
  const buttonOpacity = (typeof opacity === 'undefined' || !enabled) ? defaultOpacity : opacity;

  const { scale, width, fontSize, outlineWidth, outlineColor, textColor, bgColor } = useMemo(() => {
    return BUTTON_INFO.get(type) as ButtonInfo;
  }, [type]);
  const [{ positionZ }, api] = useSpring(() => ({
    from: { positionZ: 0 },
    config: { duration: 100 }
  }))

  const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (!enabled) return;
    if (enableSound) Sound.getInstance().playSoundFX('BUTTON');

    api.start({
      to: { positionZ: -0.125 },
      onRest: () => {
        api.start({ to: { positionZ: 0 }});
        onButtonClick()
      }
    });
  }, [api, enableSound, enabled, onButtonClick]);

  return <group scale={scale} position={position}>
    <AnimatedRoundedBox
      position-z={positionZ}
      args={[width, TetrisConstants.cellSize * 2, TetrisConstants.cellSize * 0.5]} // Width, height, depth. Default is [1, 1, 1]
      radius={0.2} // Radius of the rounded corners. Default is 0.05
      smoothness={4} // The number of curve segments. Default is 4
      bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      onPointerDown={onPointerDown}
    >
      {label ? (
        <>
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={bgColor}
            transparent={true}
            opacity={buttonOpacity}
          />
          <Text key={type} position={[0, 0, 0.51]} fontSize={fontSize} letterSpacing={0.1} outlineWidth={outlineWidth}
                outlineColor={outlineColor}>
            <animated.meshStandardMaterial
              metalness={1}
              roughness={1}
              color={textColor}
              transparent={true}
              opacity={buttonOpacity}
            />
            {label}
          </Text>
        </>
      ) : (
        <>
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={bgColor}
            transparent={true}
            opacity={buttonOpacity}
          />
          <Plane ref={mesh} position={[0,0,0.3]} args={[1.5, 1.5]}>
            <animated.meshStandardMaterial
              metalness={0.45}
              roughness={0.75}
              color={bgColor}
              transparent={true}
              opacity={0}
            />
            <Decal mesh={mesh} debug={false} map={texture as Texture} scale={1.4} position={[0, 0.1, 0]} rotation={[Math.PI * 0, Math.PI * 0, Math.PI * 0]} />
          </Plane>
        </>
      )}
    </AnimatedRoundedBox>
  </group>
}

export {Button};