/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useFrame, useThree} from "@react-three/fiber";
import {PerspectiveCamera} from "three";
import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {Line} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";

export type CamAnimation = 'NONE' | 'BUMP_RIGHT' | 'BUMP_LEFT' | 'BUMP_UP';

const BOUNDS_WIDTH = TetrisConstants.gameWidth + 1.5;
const BOUNDS_HEIGHT = TetrisConstants.gameHeight + 1.5;
const BOUNDS_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -(BOUNDS_WIDTH*0.5), y: -1 +(BOUNDS_HEIGHT*0.5), z: 0});

const CENTER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 0});
export const CAMERA_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 22});

const BUMP_AMPLITUDE = 0.5;
const BUMP_DURATION = 1; // seconds
const BUMP_BOUNCES = 5;

let startTime = 0;
const originalX = CAMERA_POSITION.x;
const originalY = CAMERA_POSITION.y;

export type CameraAnimationRef = {
  animate: (animation: CamAnimation) => void;
} | null;

type CameraAnimationProps = { /* no props */ };

let previousAspect = 0;
let previousFov = 0;

// eslint-disable-next-line no-empty-pattern
const CameraAnimation = forwardRef<CameraAnimationRef, CameraAnimationProps>(({}: CameraAnimationProps, ref) => {
  const [animation, setAnimation] = useState<CamAnimation>('NONE');
  const [startAnimation, setStartAnimation] = useState(false);
  const {camera} = useThree();

  const fit = useCallback(() => {
    const currentAspect = (camera as PerspectiveCamera).aspect;
    const fov = (camera as PerspectiveCamera).fov;

    // Do nothing if camera aspect and fov have not changed
    if (currentAspect === previousAspect && fov === previousFov) return;

    previousAspect = currentAspect;
    previousFov = fov;

    // Calculate camera Z required to fit BOUNDS in the view
    const fitOffset = 0.91;
    const fitHeightDistance = BOUNDS_HEIGHT / (2 * Math.tan(fov * Math.PI / 360));
    const fitWidthDistance = (BOUNDS_WIDTH / (2 * Math.tan(fov * Math.PI / 360))) / currentAspect;
    const cameraZ = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    // Update camera Z
    CAMERA_POSITION.setZ(cameraZ);
    camera.lookAt(CENTER_POSITION);
    camera.position.setZ(CAMERA_POSITION.z);
    camera.updateProjectionMatrix();

  }, [camera]);

  useImperativeHandle(ref, () => ({
    animate: (animation: CamAnimation) => {
      setAnimation(animation);
      setStartAnimation(true);
    }
  }), [setAnimation]);

  useFrame(({ camera, clock }) => {

    if (animation === 'NONE') {
      // Re-position camera in case its not back to its original (x,y) after animations
      camera.position.lerp(CAMERA_POSITION.clone().setZ(camera.position.z), 0.1);
      return;
    }

    if (startAnimation) {
      setStartAnimation(false);
      startTime = clock.elapsedTime;
    }
    const animationTime = clock.elapsedTime - startTime;
    const t = animationTime / BUMP_DURATION;
    if (animationTime > BUMP_DURATION) {
      setAnimation('NONE');
    }
    const offset = Math.sin(t * Math.PI * BUMP_BOUNCES) * BUMP_AMPLITUDE * (1 - t);

    if (animation === 'BUMP_RIGHT') {
      camera.position.setX(originalX + offset);
      return;
    }
    if (animation === 'BUMP_LEFT') {
      camera.position.setX(originalX - offset);
      return;
    }
    if (animation === 'BUMP_UP') {
      camera.position.setY(originalY + offset);
      return;
    }
  });

  // re-position camera Z to fit BOUNDS within view when camera aspect or fov change (eg. browser window is resized)
  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, (camera as PerspectiveCamera).aspect, (camera as PerspectiveCamera).fov]);

  return (
    // @ts-ignore
    <group visible={false}>
      <Line position={BOUNDS_POSITION} points={[[0, 0], [0, -BOUNDS_HEIGHT]]} color={"red"} lineWidth={2} dashed={false} />
      <Line position={BOUNDS_POSITION} points={[[0, -BOUNDS_HEIGHT], [BOUNDS_WIDTH, -BOUNDS_HEIGHT]]} color={"red"} lineWidth={2} dashed={false} />
      <Line position={BOUNDS_POSITION} points={[[BOUNDS_WIDTH, -BOUNDS_HEIGHT], [BOUNDS_WIDTH, 0]]} color={"red"} lineWidth={2} dashed={false} />
      <Line position={BOUNDS_POSITION} points={[[BOUNDS_WIDTH, 0], [0, 0]]} color={"red"} lineWidth={2} dashed={false} />
    </group>
  );
});

export { CameraAnimation };