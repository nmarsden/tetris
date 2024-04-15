/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Camera, useFrame} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {ExtrudeGeometryOptions, InstancedMesh, Object3D, Shape} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, useSpring} from "@react-spring/three";
import {Outlines } from "@react-three/drei";

const count = 500;
const dummy = new Object3D();

const DARK = '#333333';
const LIGHT = '#cccccc';

const tShape = new Shape();
tShape.moveTo(0.5, 0);
tShape.lineTo(0.5, 1);
tShape.lineTo(-0.5, 1);
tShape.lineTo(-0.5, 0);
tShape.lineTo(-1.5, 0);
tShape.lineTo(-1.5, -1);
tShape.lineTo(1.5, -1);
tShape.lineTo(1.5, 0);
tShape.lineTo(0.5, 0);

const extrudeSettings: ExtrudeGeometryOptions = {
  depth: 0.75,
  bevelEnabled: true,
  bevelThickness: 0.125,
  bevelSize: 0.25,
  bevelOffset: -0.25
};

type Particle = {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
};

const AnimatedOutlines = animated(Outlines);

interface Animation {
  update: (mesh: InstancedMesh, camera: Camera) => void;
}

// class FloatingAnimation implements Animation {
//   particles: Particle[];
//
//   constructor() {
//     this.particles = [];
//     for (let i = 0; i < count; i++) {
//       const t = Math.random() * 100;
//       const factor = 20 + Math.random() * 100;
//       const speed = 0.001;
//       const xFactor = -50 + Math.random() * 100;
//       const yFactor = -50 + Math.random() * 100;
//       this.particles.push({ t, factor, speed, xFactor, yFactor });
//     }
//   }
//
//   update(mesh: InstancedMesh, camera: Camera) {
//     this.particles.forEach((particle, i) => {
//       const { factor, speed, xFactor, yFactor } = particle;
//       const t = particle.t += speed / 2;
//       const s = Math.cos(t);
//
//       const zFactor = TetrisConstants.z.main - camera.position.z - 5;
//
//       dummy.position.set(
//         xFactor + Math.cos((t / 10) * factor) + (Math.sin(t) * factor) / 10,
//         yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
//         zFactor + Math.cos((t / 10)) + (Math.sin(t * 3)) / 10
//       )
//       dummy.scale.setScalar(s);
//       dummy.rotation.set(s * 5, s * 5, s * 5);
//       dummy.updateMatrix();
//       mesh.setMatrixAt(i, dummy.matrix);
//     })
//     mesh.instanceMatrix.needsUpdate = true;
//   }
// }

class GridAnimation implements Animation {
  particles: Particle[];

  constructor() {
    const X_RANGE = 100;
    const Y_RANGE = 70;
    const NUM_COLS = 25;
    const NUM_ROWS = Math.floor(count / NUM_COLS);

    this.particles = [];
    for (let row=0; row < NUM_ROWS; row++) {
      for (let col = 0; col < NUM_COLS; col++) {
        const t = 1;
        const factor = 0;
        const speed = 0.001;
        const xFactor = -(X_RANGE * 0.5) + col * (X_RANGE / NUM_COLS);
        const yFactor =-(Y_RANGE * 0.5) + row * (Y_RANGE / NUM_ROWS);
        this.particles.push({ t, factor, speed, xFactor, yFactor });
      }
    }
  }

  update(mesh: InstancedMesh, camera: Camera) {
    this.particles.forEach((particle, i) => {
      const { speed, xFactor, yFactor } = particle;
      const t = particle.t += speed / 2;
      const s = Math.sin(t);

      const zFactor = TetrisConstants.z.main - camera.position.z - 5;

      dummy.position.set(
        xFactor + (10 * s),
        yFactor,
        zFactor
      )
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    })
    mesh.instanceMatrix.needsUpdate = true;
  }
}

const animation = new GridAnimation();


const Background = ({ muted }: { muted: boolean }) => {
  const mesh = useRef<InstancedMesh>(null!);
  const [{ color }, api] = useSpring(() => ({ from: { color: LIGHT }}));

  useFrame(({ camera }) => {
    animation.update(mesh.current, camera);
  });

  useEffect(() => {
    api.start(() => ({
      from: { color: muted ? LIGHT : DARK},
      to: { color: muted ? DARK : LIGHT },
      config: { duration: 2000 }
    }));
  }, [api, muted]);

  return (
    <>
      <instancedMesh
        ref={mesh}
        // @ts-ignore
        args={[null, null, count]}
      >
        <extrudeGeometry args={[tShape, extrudeSettings]}/>
        <animated.meshStandardMaterial
          color={color}
          metalness={0}
          roughness={1}
          transparent={true}
          opacity={0}
        />
        <AnimatedOutlines
          thickness={0.2}
          color={color}
          transparent={true}
          opacity={1}
        />
      </instancedMesh>
    </>
  )
}

export {Background};