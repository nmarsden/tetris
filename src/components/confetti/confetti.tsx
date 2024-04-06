/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useCallback, useEffect, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D, PlaneGeometry, MeshBasicMaterial, DoubleSide, Mesh, Vector3, MathUtils} from 'three';

type ConfettiProps = {
  depth?: number;    // Depth of explosion. Default: 50
  loop?: boolean;    // Continuous explosions. Default: false
};

type Particle = {
  destination: Vector3;
  rotateSpeedX: number;
  rotateSpeedY: number;
  rotateSpeedZ: number;
};

type Boom = {
  object3D: Object3D;
  particles: Particle[];
};

const NUM_PARTICLES = 100;
const EXPLOSION_RADIUS = 100;
const PARTICLE_COLORS = [0x0000ff, 0xff0000, 0xffff00];

const EXPLOSION_DURATION_SECS = 1.5;
let booms: Boom[] = [];
let startTime = 0;

const Confetti = ({ depth = EXPLOSION_RADIUS, loop = false } : ConfettiProps) => {
  const groupRef = useRef<Mesh>(null);

  const explode = useCallback(() => {
    const geometry = new PlaneGeometry(0.03, 0.03, 1, 1);
    const boomObject = new Object3D();
    boomObject.position.y = 2;
    // @ts-ignore
    groupRef.current.add(boomObject);

    const boom: Boom = {
      object3D: boomObject,
      particles: []
    };

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const material = new MeshBasicMaterial({
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        transparent: true,
        side: DoubleSide
      })

      const particleMesh = new Mesh(geometry, material);
      particleMesh.rotation.x = Math.random() * 360;
      particleMesh.rotation.y = Math.random() * 360;
      particleMesh.rotation.z = Math.random() * 360;
      const size = Math.random() * 5 + 15;
      particleMesh.scale.set(size, size, size);

      boomObject.add(particleMesh);

      const particle: Particle = {
        destination: new Vector3(
          (Math.random() - 0.5) * EXPLOSION_RADIUS * Math.random(),
          (Math.random() - 0.5) * EXPLOSION_RADIUS * Math.random(),
          depth * Math.random()
        ),
        rotateSpeedX: 0,
        rotateSpeedY: 0,
        rotateSpeedZ: 0.2
      };

      boom.particles.push(particle);
    }

    booms.push(boom);
  }, [depth]);

  useFrame(({ clock }) => {

    if (startTime === 0) {
      startTime = clock.elapsedTime;
      explode();
      return;
    }

    const animationTime = clock.elapsedTime - startTime;
    if (loop && animationTime > EXPLOSION_DURATION_SECS) {
      startTime = clock.elapsedTime;
      explode();
      return;
    }

    for (let i = 0; i < booms.length; i++) {
      const boom = booms[i];

      for (let k = 0; k < boom.object3D.children.length; k++) {
        const particleMesh = boom.object3D.children[k] as Mesh;
        const particle = boom.particles[k];

        particle.destination.y -= MathUtils.randFloat(0.1, 0.3);

        const speedX = (particle.destination.x - particleMesh.position.x) / 200;
        const speedY = (particle.destination.y - particleMesh.position.y) / 200;
        const speedZ = (particle.destination.z - particleMesh.position.z) / 200;

        particleMesh.position.x += speedX;
        particleMesh.position.y += speedY;
        particleMesh.position.z += speedZ;

        particleMesh.rotation.y += particle.rotateSpeedY;
        particleMesh.rotation.x += particle.rotateSpeedX;
        particleMesh.rotation.z += particle.rotateSpeedZ;

        (particleMesh.material as MeshBasicMaterial).opacity -= 0.015;

        if ((particleMesh.material as MeshBasicMaterial).opacity < 0) {
          (particleMesh.material as MeshBasicMaterial).dispose();
          particleMesh.geometry.dispose();
          boom.object3D.remove(particleMesh);
        }
      }

      if (boom.object3D.children.length <= 0) {
        // @ts-ignore
        groupRef.current.remove(boom.object3D);
        booms = booms.filter((b) => b !== boom)
      }
    }
  })

  useEffect(() => {
    // Trigger explosion
    startTime = 0;
  }, [depth]);

  return <mesh ref={groupRef} />
}

export { Confetti };