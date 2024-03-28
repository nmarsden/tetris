import {useFrame} from "@react-three/fiber";
import {Vector3} from "three";
import {forwardRef, useImperativeHandle, useState} from "react";

export type CamAnimation = 'NONE' | 'BUMP_RIGHT' | 'BUMP_LEFT' | 'BUMP_UP';

let originalPosition: Vector3 | null = null;

const BUMP_AMPLITUDE = 0.5;
const BUMP_DURATION = 1; // seconds
const BUMP_BOUNCES = 5;

let startTime = 0;
let originalX = 0;
let originalY = 0;

export type CameraAnimationRef = {
  animate: (animation: CamAnimation) => void;
} | null;

type CameraAnimationProps = {};

const CameraAnimation = forwardRef<CameraAnimationRef, CameraAnimationProps>(({ }: CameraAnimationProps, ref) => {
  const [animation, setAnimation] = useState<CamAnimation>('NONE');
  const [startAnimation, setStartAnimation] = useState(false);

  useImperativeHandle(ref, () => ({
    animate: (animation: CamAnimation) => {
      setAnimation(animation);
      setStartAnimation(true);
    }
  }), [setAnimation]);

  useFrame(({ camera, clock }) => {

    if (originalPosition !== null && animation === 'NONE') {
      camera.position.lerp(originalPosition.clone(), 0.1);
      return;
    }

    if (startAnimation) {
      setStartAnimation(false);
      startTime = clock.elapsedTime;
      if (originalPosition === null) {
        originalPosition = camera.position.clone();
        originalX = originalPosition.x;
        originalY = originalPosition.y;
      }
    }
    if (animation === 'NONE') {
      return;
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

  return null;
});

export { CameraAnimation };