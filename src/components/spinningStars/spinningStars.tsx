import {animated, SpringValue, useSpring} from "@react-spring/three";
import {Color, Vector3} from "three";
import {useEffect} from "react";
import {TetrisConstants} from "../../tetrisConstants.ts";

const SPIN_DURATION = 4000;

type SpinningStarProps = {
  position: Vector3;
  opacity: SpringValue<number>;
};

const SpinningStar = ({ size, color, antiClockwise, opacity }: { size: number, color: Color, antiClockwise: boolean, opacity: SpringValue<number> }) => {
  const [{ rotationZ, scale }, api] = useSpring(() => (
    {
      from: { rotationZ: 0, scale: 0.8 }
    }));

  useEffect(() => {
    api.start({
      from: { rotationZ: 0, scale: 0.8 },
      to: [
        { rotationZ: antiClockwise ? Math.PI : Math.PI * -1, scale: 1 },
        { rotationZ: antiClockwise ? Math.PI * 2 : Math.PI * -2, scale: 0.8 }
      ],
      loop: true,
      config: { duration: SPIN_DURATION }
    });
  }, [api]);

  return (
    <animated.group rotation-z={rotationZ} scale={scale}>
      <mesh>
        <planeGeometry args={[size, size]}/>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={color}
          opacity={opacity}
        />
      </mesh>
      <mesh rotation-z={Math.PI * 0.25}>
        <planeGeometry args={[size, size]}/>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={color}
          opacity={opacity}
        />
      </mesh>
    </animated.group>
  )
};

const SpinningStars = ({ position, opacity }: SpinningStarProps) => {
  return (
    <group position={position}>
      <SpinningStar size={8.6} color={TetrisConstants.color.yellow} antiClockwise={true} opacity={opacity} />
      <SpinningStar size={7.2} color={TetrisConstants.color.black} antiClockwise={false} opacity={opacity} />
      <SpinningStar size={6.5} color={TetrisConstants.color.yellow} antiClockwise={false} opacity={opacity} />
    </group>
  )
}

export {SpinningStars};