/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useFrame, useThree} from "@react-three/fiber";
import {PerspectiveCamera} from "three";
import {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Line} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";

export type CamAnimation = 'NONE' | 'BUMP_RIGHT' | 'BUMP_LEFT' | 'BUMP_UP';

export type CamBounds = 'OVERLAY' | 'PLAYFIELD';

type Bounds = {
  width: number,
  height: number
}

const CAM_BOUNDS = new Map<CamBounds, Bounds>([
  ['OVERLAY', { width: TetrisConstants.gameWidth - 1.8, height: TetrisConstants.gameHeight + 3 }],
  ['PLAYFIELD', { width: TetrisConstants.gameWidth - 3, height: TetrisConstants.gameHeight}],
]);

const CENTER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 0});
export const CAMERA_POSITION = CENTER_POSITION.clone().add({x: 0, y: 0, z: 22}); // Note: z will be auto-adjusted to fit the bounds in view

const BOUNDS_LINE_WIDTH = 2;

const BUMP_AMPLITUDE = 0.5;
const BUMP_DURATION = 1; // seconds
const BUMP_BOUNCES = 5;

let startTime = 0;
const originalX = CAMERA_POSITION.x;
const originalY = CAMERA_POSITION.y;

export type CameraAnimationRef = {
  animate: (animation: CamAnimation) => void;
  setCamBounds: (camBounds: CamBounds) => void;
} | null;

type CameraAnimationProps = { /* no props */ };

let previousAspect = 0;
let previousFov = 0;
let previousBounds = { width: 0, height: 0 };

// eslint-disable-next-line no-empty-pattern
const CameraAnimation = forwardRef<CameraAnimationRef, CameraAnimationProps>(({}: CameraAnimationProps, ref) => {
  const [animation, setAnimation] = useState<CamAnimation>('NONE');
  const [startAnimation, setStartAnimation] = useState(false);
  const {camera} = useThree();
  const [bounds, setBounds] = useState<Bounds>(CAM_BOUNDS.get('OVERLAY') as Bounds);

  const boundsPosition = useMemo(() => {
    return CENTER_POSITION.clone().add({ x: -(bounds.width*0.5), y: +(bounds.height*0.5), z: TetrisConstants.z.overlay4Offset });
  }, [bounds]);

  const fit = useCallback(() => {
    const currentAspect = (camera as PerspectiveCamera).aspect;
    const fov = (camera as PerspectiveCamera).fov;

    // Do nothing if camera aspect, fov or bounds have not changed
    if (currentAspect === previousAspect && fov === previousFov && bounds == previousBounds) return;

    previousAspect = currentAspect;
    previousFov = fov;
    previousBounds = bounds;

    // Calculate camera Z required to fit BOUNDS in the view
    const fitOffset = 1;
    const fitHeightDistance = bounds.height / (2 * Math.tan(fov * Math.PI / 360));
    const fitWidthDistance = (bounds.width / (2 * Math.tan(fov * Math.PI / 360))) / currentAspect;
    const cameraZ = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    // Update camera Z
    CAMERA_POSITION.setZ(cameraZ);
    camera.lookAt(CENTER_POSITION);

  }, [camera, bounds]);

  useImperativeHandle(ref, () => ({
    animate: (animation: CamAnimation) => {
      setAnimation(animation);
      setStartAnimation(true);
    },
    setCamBounds: (camBounds: CamBounds) => {
      setBounds(CAM_BOUNDS.get(camBounds) as Bounds);
    }
  }), [setAnimation]);

  useFrame(({ camera, clock }) => {

    if (animation === 'NONE') {
      // Re-position camera in case its not back to its original (x,y) after animations
      camera.position.lerp(CAMERA_POSITION, 0.1);
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
      <Line position={boundsPosition} points={[[0, 0], [0, -bounds.height]]} color={"red"} lineWidth={BOUNDS_LINE_WIDTH} dashed={false} />
      <Line position={boundsPosition} points={[[0, -bounds.height], [bounds.width, -bounds.height]]} color={"red"} lineWidth={BOUNDS_LINE_WIDTH} dashed={false} />
      <Line position={boundsPosition} points={[[bounds.width, -bounds.height], [bounds.width, 0]]} color={"red"} lineWidth={BOUNDS_LINE_WIDTH} dashed={false} />
      <Line position={boundsPosition} points={[[bounds.width, 0], [0, 0]]} color={"red"} lineWidth={BOUNDS_LINE_WIDTH} dashed={false} />
    </group>
  );
});

export { CameraAnimation };