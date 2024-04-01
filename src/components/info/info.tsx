import {Vector3} from "three";
import {Plane, Text, useTexture} from "@react-three/drei";
import {GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PieceType} from "../../gameEngine.ts";
import {Border} from "../border/border.tsx";
import {Piece} from "../piece/piece.tsx";

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

const CustomText = ({ position, size, text, color, outlineColor } : { position: Vector3, size: number, text: string, color: string | number, outlineColor: string | number }) => {
  return (
    <Text position={position} fontSize={size} letterSpacing={0.1} outlineWidth={0.05} outlineColor={outlineColor}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={color}
      />
      {text}
    </Text>
  )
}

const Label = ({ position, label } : { position: Vector3, label: string }) => {
  return <CustomText position={position} size={1} text={label} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
};

const Value = ({ position, value, bestValue } : { position: Vector3, value: number | PieceType, bestValue?: number }) => {
  const isPieceValue = !Number.isInteger(value);
  const valueBoxWidth = TetrisConstants.infoWidth;
  const valueBoxHeight = TetrisConstants.cellSize * (isPieceValue ? 2.7 : 1.4);
  const borderPosition = position.clone().add({ x: -valueBoxWidth * 0.5, y: TetrisConstants.cellSize * 0.3, z: 0})
  const textPosition = position.clone().add({ x: 0, y: -TetrisConstants.cellSize * 0.5, z: 0})

  const trophy1Position = position.clone().add({ x: 0.38 - valueBoxWidth * 0.5, y: -TetrisConstants.cellSize * 1.55, z: 0})
  const trophy2Position = position.clone().add({ x: -0.38 + valueBoxWidth * 0.5, y: -TetrisConstants.cellSize * 1.55, z: 0})

  const bestValueBoxWidth = TetrisConstants.infoWidth - 1.6;
  const bestBorderPosition = position.clone().add({ x: -bestValueBoxWidth * 0.5, y: -TetrisConstants.cellSize * 1.1, z: 0})
  const bestTextPosition = position.clone().add({ x: 0, y: -TetrisConstants.cellSize * 1.6, z: 0})

  const gridPos = GridUtils.screenToGridPos(position);
  const pieceCol = isPieceValue ? (['O', 'I0'].includes(value as PieceType) ? (gridPos.col - 1) : gridPos.col - 0.5) : 0;
  const pieceGridPos = { col: pieceCol, row: gridPos.row - 2 };

  return (
    <>
      <Border position={borderPosition} width={valueBoxWidth} height={valueBoxHeight} />
      { isPieceValue ?
        <Piece gridPos={pieceGridPos} type={value as PieceType} /> :
        <CustomText position={textPosition} size={1} text={value.toString(10)} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
      }
      { typeof bestValue !== 'undefined' ?
        <>
          <Border position={bestBorderPosition} width={bestValueBoxWidth} height={valueBoxHeight * 0.6} />
          <Trophy position={trophy1Position} />
          <Trophy position={trophy2Position} />
          <CustomText position={bestTextPosition} size={0.6} text={bestValue.toString(10)} color={0xFFFFFF} outlineColor={0x000000}/>
        </> : null
      }
    </>
  )
};

const Info = ({ position, label, value, bestValue } : { position: Vector3, label: string, value: number | PieceType, bestValue?: number }) => {
  const valuePosition = position.clone().add({ x: 0, y: -0.8, z: 0 });
  return (
    <>
      <Label position={position} label={label} />
      <Value position={valuePosition} value={value} bestValue={bestValue} />
    </>
  )
}

export { Info }