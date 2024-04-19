/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Camera, useFrame} from "@react-three/fiber";
import {useCallback, useEffect, useRef, useState} from "react";
import {
  ExtrudeGeometry,
  ExtrudeGeometryOptions,
  InstancedMesh,
  Object3D,
  Shape
} from "three";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, useSpring} from "@react-spring/three";
import {Outlines} from "@react-three/drei";

const count = 500;
const dummy = new Object3D();

const DARK = '#333333';
const LIGHT = '#cccccc';

const zShape = new Shape();
zShape.moveTo(0.5, 0);      // 0
zShape.lineTo(0.5, 1);      // 1
zShape.lineTo(-1.5, 1);     // 2
zShape.lineTo(-1.5, 0);     // 3
zShape.lineTo(-0.5, 0);     // 4
zShape.lineTo(-0.5, -1);    // 5
zShape.lineTo(1.5, -1);     // 6
zShape.lineTo(1.5, 0);      // 7
zShape.lineTo(0.5, 0);      // 8

const lShape = new Shape();
lShape.moveTo(0.5, 0);       // 0
lShape.lineTo(-1.5, 0);      // 1
lShape.lineTo(-1.5, -1);     // 2
lShape.lineTo(0, -1);        // 3
lShape.lineTo(1.5, -1);      // 4
lShape.lineTo(1.5, 0);       // 5
lShape.lineTo(1.5, 1);       // 6
lShape.lineTo(0.5, 1);       // 7
lShape.lineTo(0.5, 0);       // 8

const tShape = new Shape();
tShape.moveTo(0.5, 0);       // 0
tShape.lineTo(0.5, 1);       // 1
tShape.lineTo(-0.5, 1);      // 2
tShape.lineTo(-0.5, 0);      // 3
tShape.lineTo(-1.5, 0);      // 4
tShape.lineTo(-1.5, -1);     // 5
tShape.lineTo(1.5, -1);      // 6
tShape.lineTo(1.5, 0);       // 7
tShape.lineTo(0.5, 0);       // 8

const iShape = new Shape();
iShape.moveTo(-1, 0);        // 0
iShape.lineTo(-2, 0);        // 1
iShape.lineTo(-2, -1);       // 2
iShape.lineTo(-1, -1);       // 3
iShape.lineTo(1, -1);        // 4
iShape.lineTo(2, -1);        // 5
iShape.lineTo(2, 0);         // 6
iShape.lineTo(1, 0);         // 7
iShape.lineTo(-1, 0);        // 8

const sShape = new Shape();
sShape.moveTo(-0.5, 1);     // 0
sShape.lineTo(-0.5, 0);     // 1
sShape.lineTo(-1.5, 0);     // 2
sShape.lineTo(-1.5, -1);    // 3
sShape.lineTo(0.5, -1);     // 4
sShape.lineTo(0.5, 0);      // 5
sShape.lineTo(1.5, 0);      // 6
sShape.lineTo(1.5, 1);      // 7
sShape.lineTo(-0.5, 1);     // 8

const oShape = new Shape();
oShape.moveTo(1, 0);        // 0
oShape.lineTo(1, 1);        // 1
oShape.lineTo(-1, 1);       // 2
oShape.lineTo(-1, 0);       // 3
oShape.lineTo(-1.001, 0);   // 4
oShape.lineTo(-1, -1);      // 5
oShape.lineTo(1, -1);       // 6
oShape.lineTo(1.001, 0);    // 7
oShape.lineTo(1, 0);        // 8

const jShape = new Shape();
jShape.moveTo(-0.5, 0);      // 0
jShape.lineTo(-0.5, 1);      // 1
jShape.lineTo(-1.5, 1);      // 2
jShape.lineTo(-1.5, 0);      // 3
jShape.lineTo(-1.5, -1);     // 4
jShape.lineTo(-0.5, -1);     // 5
jShape.lineTo(1.5, -1);      // 6
jShape.lineTo(1.5, 0);       // 7
jShape.lineTo(0.5, 0);       // 8

const extrudeSettings: ExtrudeGeometryOptions = {
  depth: 1,
  bevelEnabled: false
};

const zGeometry = new ExtrudeGeometry(zShape, extrudeSettings);
const lGeometry = new ExtrudeGeometry(lShape, extrudeSettings);
const tGeometry = new ExtrudeGeometry(tShape, extrudeSettings);
// const iGeometry = new ExtrudeGeometry(iShape, extrudeSettings);
const sGeometry = new ExtrudeGeometry(sShape, extrudeSettings);
const oGeometry = new ExtrudeGeometry(oShape, extrudeSettings);
const jGeometry = new ExtrudeGeometry(jShape, extrudeSettings);

const GEOMETRIES = [zGeometry, lGeometry, tGeometry, sGeometry, oGeometry, jGeometry];
// const GEOMETRIES = [zGeometry, lGeometry, tGeometry, iGeometry, sGeometry, oGeometry, jGeometry];
let currentGeometryIndex = 0;
let startTime = 0;
const GEOMETRY_DURATION_SECS = 31.9;
let switchingGeometry = false;

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
        const t = 0;
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

      if (switchingGeometry) {
        particle.t = 0;
      } else {
        particle.t += speed;
      }
      const t = particle.t;

      const s = switchingGeometry ? 0 : Math.sin(t);
      const angle = Math.PI * 2 * s;
      const scale = 0.01 + s;

      const zFactor = TetrisConstants.z.main - camera.position.z - 5;

      dummy.position.set(
        xFactor + (10 * s),
        yFactor,
        zFactor
      )

      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(angle, angle, angle);
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
  const [geometry, setGeometry] = useState(GEOMETRIES[currentGeometryIndex]);

  const switchGeometry = useCallback(() => {
    switchingGeometry = true;

    currentGeometryIndex++;
    if (currentGeometryIndex === GEOMETRIES.length) {
      currentGeometryIndex = 0;
    }
    setGeometry(GEOMETRIES[currentGeometryIndex]);
    mesh.current.computeBoundingBox();
    mesh.current.computeBoundingSphere();
    mesh.current.instanceMatrix.needsUpdate = true;

    setTimeout(() => { switchingGeometry = false; }, 200);
  }, []);

  useFrame(({ camera, clock}) => {
    animation.update(mesh.current, camera);

    if (startTime === 0) {
      startTime = clock.elapsedTime;
    }
    const animationTime = clock.elapsedTime - startTime;
    if (animationTime > GEOMETRY_DURATION_SECS) {
      startTime = clock.elapsedTime;
      switchGeometry();
    }
  });

  useEffect(() => {
    api.start(() => ({
      from: { color: muted ? LIGHT : DARK},
      to: { color: muted ? DARK : LIGHT },
      config: { duration: 200 }
    }));
  }, [api, muted]);

  return (
    <>
      <instancedMesh
        ref={mesh}
        geometry={geometry}
        // @ts-ignore
        args={[null, null, count]}
      >
        <animated.meshStandardMaterial
          color={"grey"}
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