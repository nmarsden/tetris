/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useFrame} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import {InstancedMesh, Object3D} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, useSpring} from "@react-spring/three";

const count = 500;
const dummy = new Object3D();

const DARK_ORANGE = '#261501';
const LIGHT_ORANGE = '#fa9955';

const Background = ({ muted }: { muted: boolean }) => {
  const mesh = useRef<InstancedMesh>(null!);
  const [{ color }, api] = useSpring(() => ({ from: { color: LIGHT_ORANGE }}));

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.001;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor });
    }
    return temp;
  }, []);

  useFrame(({ camera }) => {
    particles.forEach((particle, i) => {
      const { factor, speed, xFactor, yFactor } = particle;
      const t = particle.t += speed / 2;
      const s = Math.cos(t);

      const zFactor = TetrisConstants.z.main - camera.position.z - 5;

      dummy.position.set(
        xFactor + Math.cos((t / 10) * factor) + (Math.sin(t) * factor) / 10,
        yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        zFactor + Math.cos((t / 10)) + (Math.sin(t * 3)) / 10
      )
      dummy.scale.setScalar(s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    })
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    api.start(() => ({
      from: { color: muted ? LIGHT_ORANGE : DARK_ORANGE},
      to: { color: muted ? DARK_ORANGE : LIGHT_ORANGE },
      config: { duration: 2000 }
    }));
  }, [api, muted]);

  // @ts-ignore
  return (
    <>
      <instancedMesh
        ref={mesh}
        // @ts-ignore
        args={[null, null, count]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <animated.meshStandardMaterial
          color={color}
          metalness={0}
          roughness={1}
        />
      </instancedMesh>
    </>
  )
}

export {Background};