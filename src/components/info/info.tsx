import {Vector3} from "three";
import {Plane, Text, useTexture} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PieceType} from "../../gameEngine.ts";
import {Border} from "../border/border.tsx";
import {Piece} from "../piece/piece.tsx";
import {animated, SpringValue, useSpring, useSpringValue} from "@react-spring/three";
import {useEffect} from "react";

const Trophy = ({ position } : { position: Vector3 }) => {
  const texture = useTexture('/tetris/image/trophy.png')
  return (
    <Plane position={position} args={[0.8, 0.8]}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        map={texture}
      />
    </Plane>
  )
}

const CustomText = ({ position, opacity, scale, size, text, color, outlineColor } : { position: Vector3, opacity?: SpringValue<number>, scale?: SpringValue<number>, size: number, text: string, color: string | number, outlineColor: string | number }) => {
  const defaultOpacity = useSpringValue(1);
  const textOpacity = opacity === null ? defaultOpacity : opacity;
  const defaultScale = useSpringValue(1);
  const textScale = scale === null ? defaultScale : scale;

  return (
    <animated.group position={position} scale={textScale}>
      <Text fontSize={size} letterSpacing={0.1} outlineWidth={0.05} outlineColor={outlineColor}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={color}
          transparent={true}
          opacity={textOpacity}
        />
        {text}
      </Text>
    </animated.group>
  )
}

const Label = ({ position, label } : { position: Vector3, label: string }) => {
  return <CustomText position={position} size={1} text={label} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
};

const Value = ({ position, value, isBest=false } : { position: Vector3, value: number | PieceType | null, isBest?: boolean }) => {
  const [{ opacity, scale }, api] = useSpring(() => ({
    from: { opacity: 1, scale: 1 }
  }));

  const isPieceValue = !Number.isInteger(value);
  const valueBoxWidth = TetrisConstants.infoWidth;
  const valueBoxHeight = TetrisConstants.cellSize * (isPieceValue ? 2.7 : 1.4);
  const borderPosition = position.clone().add({ x: -valueBoxWidth * 0.5, y: TetrisConstants.cellSize * 0.3, z: 0})
  const textPosition = position.clone().add({ x: 0, y: -TetrisConstants.cellSize * 0.5, z: 0})

  const trophy1Position = position.clone().add({ x: 0.38 - valueBoxWidth * 0.5, y: -TetrisConstants.cellSize * 0.4, z: 0})
  const trophy2Position = position.clone().add({ x: -0.38 + valueBoxWidth * 0.5, y: -TetrisConstants.cellSize * 0.4, z: 0})
  const bestValueBoxWidth = TetrisConstants.infoWidth - 1.6;
  const bestBorderPosition = position.clone().add({ x: -bestValueBoxWidth * 0.5, y: 0, z: 0})

  const piecePosition = isPieceValue ? (['O', 'I0'].includes(value as PieceType) ? position.clone().add({x:-0.5, y:-1.5, z:0}) : position.clone().add({x:0, y:-1.5, z:0})) : position;

  useEffect(() => {
    api.start({
      from: { opacity: 1, scale: 1 },
      to: [
        { opacity: 0,   scale: 0.1, immediate: true },
        { opacity: 1,   scale: 1.1, config: { duration: 250 } },
        { opacity: 0.5, scale: 0.9, config: { duration: 250 } },
        { opacity: 1,   scale: 1,   config: { duration: 250 } }
      ],
    });
  }, [value, api]);

  return (
    <>
      {(isPieceValue && value !== null) ? (
        <>
          <Border position={borderPosition} width={valueBoxWidth} height={valueBoxHeight} />
          <animated.group position={piecePosition} scale={scale}>
            <Piece type={value as PieceType} />
          </animated.group>
        </>
      ) : (isBest ? (
        <>
          <Border position={bestBorderPosition} width={bestValueBoxWidth} height={valueBoxHeight * 0.6} />
          <Trophy position={trophy1Position} />
          <Trophy position={trophy2Position} />
          <CustomText position={textPosition} opacity={opacity} scale={scale} size={0.6} text={(value as number).toString(10)} color={0xFFFFFF} outlineColor={0x000000}/>
        </>
      ) : (
        (value !== null) ? (
          <>
            <Border position={borderPosition} width={valueBoxWidth} height={valueBoxHeight} />
            <CustomText position={textPosition} opacity={opacity} scale={scale} size={1} text={(value as number).toString(10)} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
          </>
        ) : null
      ))}
    </>
  )
};

const Info = ({ position, label, value, isBest=false } : { position: Vector3, label: string, value: number | PieceType | null, isBest?: boolean }) => {
  const valuePosition = position.clone().add({ x: 0, y: -0.8, z: 0 });
  return (
    <>
      {isBest ? null : <Label position={position} label={label} />}
      <Value position={valuePosition} value={value} isBest={isBest} />
    </>
  )
}

export { Info }