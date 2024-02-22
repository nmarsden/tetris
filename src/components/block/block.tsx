import {animated, config, useSpring} from "@react-spring/three";
import {Color} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {useEffect} from "react";

export type BlockMode = 'STANDARD' | 'GHOST' | 'CLEAR' | 'SHIFT_ONE' | 'SHIFT_TWO' | 'SHIFT_THREE' | 'SHIFT_FOUR';

const level = 1;
const DURATION = Math.pow((0.8-((level-1)*0.007)), (level-1)) * 1000;
// const DURATION = 1000;

const Block = ({ position, color, mode='STANDARD' } : { position: [number, number, number], color: Color, mode?: BlockMode }) => {
  const [{ opacity, rotationZ, positionY}, api] = useSpring(() => ({
    from: { opacity: mode === 'GHOST' ? 0.3 : 1, rotationZ: 0, positionY: 0 },
    config: config.stiff
  }))

  useEffect(() => {
    switch(mode) {
      case 'STANDARD':    api.start({to: {positionY: 0,                             opacity: 1,   rotationZ: 0       }, immediate: true, config: {duration: DURATION}}); return;
      case 'CLEAR':       api.start({to: {positionY: 0,                             opacity: 0.1, rotationZ: Math.PI }, loop: true, config: {duration: DURATION}}); return;
      case 'SHIFT_ONE':   api.start({to: {positionY: -TetrisConstants.cellSize,     opacity: 1,   rotationZ: 0       }, config: {duration: DURATION}}); return;
      case 'SHIFT_TWO':   api.start({to: {positionY: -TetrisConstants.cellSize * 2, opacity: 1,   rotationZ: 0       }, config: {duration: DURATION}}); return;
      case 'SHIFT_THREE': api.start({to: {positionY: -TetrisConstants.cellSize * 3, opacity: 1,   rotationZ: 0       }, config: {duration: DURATION}}); return;
      case 'SHIFT_FOUR':  api.start({to: {positionY: -TetrisConstants.cellSize * 4, opacity: 1,   rotationZ: 0       }, config: {duration: DURATION}}); return;
    }
  }, [api, mode]);

  return (
    <animated.group
      position={position}
      rotation-z={rotationZ}
    >
      <animated.mesh position-y={positionY}>
        <boxGeometry args={[TetrisConstants.cellSize, TetrisConstants.cellSize, TetrisConstants.cellSize]} />
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={color}
          opacity={opacity}
          transparent={true}
        />
      </animated.mesh>
    </animated.group>
  )
}

export { Block }