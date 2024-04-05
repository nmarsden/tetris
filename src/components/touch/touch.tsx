/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useCallback, useEffect, useState } from "react";
import {ActionField} from "../../hooks/useKeyboardControls.ts";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated} from "@react-spring/three";
import {useDrag} from "@use-gesture/react";
import { useThree } from "@react-three/fiber";

const POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.touchLayerOffset});

const DRAG_THRESHOLD = 1;
const REPEAT_DELAY_MSECS = 100;

const Touch = ({ onActionField }: { onActionField: (actionField: ActionField) => void }) => {
  const [planeDimensions, setPlaneDimensions] = useState<[number, number]>([TetrisConstants.gameWidth, TetrisConstants.gameHeight]);
  const { size, viewport, camera } = useThree();

  const [lastActionTime, setLastActionTime] = useState(0);

  const setActionField = useCallback((actionField: ActionField): void => {
    const now = Date.now();
    if (actionField === 'hardDrop' || now - lastActionTime > REPEAT_DELAY_MSECS) {
      setLastActionTime(now);
      onActionField(actionField);
    }
  }, [lastActionTime]);

  const bind = useDrag(
    (state) => {
      if (state.tap) {
        setActionField('rotateClockwise');
        return;
      }
      if (state.swipe[1] === 1) {
        setActionField('hardDrop');
        return;
      }
      if (state.dragging && state.delta[0] < -DRAG_THRESHOLD) {
        setActionField('moveLeft');
        return;
      }
      if (state.dragging && state.delta[0] > DRAG_THRESHOLD) {
        setActionField('moveRight');
        return;
      }
      if (state.dragging && state.delta[1] > DRAG_THRESHOLD) {
        setActionField('moveDown');
        return;
      }
    },
    {
      threshold: 5,
      axis: 'lock',
      filterTaps: true,
      swipe: {
        distance: [50, 50],
        duration: 250,
        velocity: [0.5,0.5]
      }
    }
  );

  useEffect(() => {
    setPlaneDimensions([size.width / camera.zoom, size.height / camera.zoom]);
  }, [viewport, camera]);

  return (
    <>
      { /* @ts-ignore */ }
      <animated.mesh position={POSITION} {...bind()}>
        <planeGeometry args={planeDimensions} />
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          color={TetrisConstants.color.red}
          opacity={0}
          transparent={true}
        />
      </animated.mesh>
    </>
  )
}

export { Touch }