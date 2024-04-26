import {Text, Wireframe} from "@react-three/drei";
import {animated, config, useSpring} from "@react-spring/three";
import {Vector3} from "three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useEffect} from "react";

const BANNER_WIDTH = 10;
const BANNER_HEIGHT = 4;
const BANNER_DEPTH = 4;

const BANNER_POSITION = GridUtils.gridPosToScreen({ col: 5, row: 10 }).add({x: 0, y: 0, z: BANNER_DEPTH * 0.5});

const TEXT_POSITION = new Vector3(0, -0.1, (BANNER_DEPTH * 0.5) + 0.1);

const CustomText = ({ position, text }: { position: Vector3, text: string }) => {
  return (
    <Text
      position={position}
      textAlign={'center'}
      fontSize={1.5}
      maxWidth={6}
      lineHeight={1}
      letterSpacing={0.1}
      outlineWidth={0.07}
      outlineColor={'black'}
    >
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={'black'}
        opacity={1}
        transparent={true}
      />
      {text}
    </Text>
  );
}

const Banner = ({ text }: { text: string }) => {
  const [{ scale }, api] = useSpring(() => ({ from: { scale: 0 } }));

  useEffect(() => {
    api.start({
      to: { scale: 1 },
      config: config.gentle
    });
  }, [api]);

  return (
    <animated.mesh position={BANNER_POSITION} scale={scale}>
      <boxGeometry args={[BANNER_WIDTH, BANNER_HEIGHT, BANNER_DEPTH]} />
      <Wireframe
        simplify={true}
        stroke={'white'}
        backfaceStroke={'white'}
        thickness={0.03}
        fillOpacity={0.1}
        fillMix={0.7}
        fill={'white'}
      />
      <CustomText position={TEXT_POSITION} text={text}/>
    </animated.mesh>
  );
}

export {Banner}