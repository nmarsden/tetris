/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, config, SpringValue, useSpring, useSpringValue} from "@react-spring/three";
import {Color} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PropsWithChildren, useEffect} from "react";
import {Outlines, RoundedBox} from "@react-three/drei";
import {useControls} from "leva";

export type BlockMode = 'STANDARD' | 'GHOST' | 'LOCK' | 'CLEAR' | 'SHIFT_ONE' | 'SHIFT_TWO' | 'SHIFT_THREE' | 'SHIFT_FOUR';

const DURATION = 500;
// const level = 1;
// const DURATION = Math.pow((0.8-((level-1)*0.007)), (level-1)) * 1000;
// const DURATION = 1000;

const AnimatedOutlines = animated(Outlines)

type CustomBoxProps = {
  scale: number;
  roundedBox: boolean;
};

const CustomBox = ({ scale, roundedBox, children }: PropsWithChildren<CustomBoxProps>) => {
  return roundedBox ? (
    <RoundedBox
      args={[TetrisConstants.cellSize, TetrisConstants.cellSize, TetrisConstants.cellSize]} // Width, height, depth. Default is [1, 1, 1]
      radius={0.2} // Radius of the rounded corners. Default is 0.05
      smoothness={4} // The number of curve segments. Default is 4
      bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      scale={scale}
    >
      {children}
    </RoundedBox>
  ) : (
    <mesh
      geometry={TetrisConstants.boxGeometry}
      scale={TetrisConstants.cellSize * scale * 0.9}
    >
      {children}
    </mesh>
  )
}

const Block = ({ position, color, mode = 'STANDARD', outlineOpacity }: {
  position: [number, number, number],
  color: Color,
  mode?: BlockMode,
  outlineOpacity?: SpringValue<number>
}) => {
  const defaultOutlineOpacity = useSpringValue(1);
  const ghostOutlineOpacity = outlineOpacity === null ? defaultOutlineOpacity : outlineOpacity;
  const { roundedBox } = useControls('Blocks', {
    roundedBox: true
  });

  const [{ opacity, rotationZ, positionY, scale}, api] = useSpring(() => ({
    from: { opacity: mode === 'GHOST' ? 0.2 : 1, rotationZ: 0, positionY: 0, scale: 1 },
    config: config.stiff
  }));
  const blockColor = mode === 'CLEAR' ? TetrisConstants.color.white : color;

  useEffect(() => {
    switch(mode) {
      case 'STANDARD':    api.start({to: {positionY: 0,                             opacity: 1,   rotationZ: 0,       scale: 1   }, config: {duration: DURATION}, immediate: true}); return;
      case 'LOCK':        api.start({to: {positionY: 0,                             opacity: 0.5, rotationZ: 0,       scale: 1   }, config: {duration: DURATION * 0.25}, loop: true }); return;
      case 'CLEAR':       api.start({to: {positionY: 0,                             opacity: 0.1, rotationZ: Math.PI, scale: 0.1 }, config: {duration: DURATION} }); return;
      case 'SHIFT_ONE':   api.start({to: {positionY: -TetrisConstants.cellSize,     opacity: 1,   rotationZ: 0,       scale: 1   }, config: {duration: DURATION}}); return;
      case 'SHIFT_TWO':   api.start({to: {positionY: -TetrisConstants.cellSize * 2, opacity: 1,   rotationZ: 0,       scale: 1   }, config: {duration: DURATION}}); return;
      case 'SHIFT_THREE': api.start({to: {positionY: -TetrisConstants.cellSize * 3, opacity: 1,   rotationZ: 0,       scale: 1   }, config: {duration: DURATION}}); return;
      case 'SHIFT_FOUR':  api.start({to: {positionY: -TetrisConstants.cellSize * 4, opacity: 1,   rotationZ: 0,       scale: 1   }, config: {duration: DURATION}}); return;
    }
  }, [api, mode]);

  return (
    <animated.group
      position={position}
      rotation-z={rotationZ}
      scale={scale}
    >
      <animated.mesh position-y={positionY}>
        <CustomBox scale={mode === 'GHOST' ? 0.9 : 1} roundedBox={roundedBox}>
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={blockColor}
            opacity={opacity}
            transparent={true}
          />
          {mode === 'GHOST' ? <AnimatedOutlines thickness={0.05} color="white" transparent={true} opacity={ghostOutlineOpacity}/> : null}
        </CustomBox>
      </animated.mesh>
    </animated.group>
  )
}

export {Block}