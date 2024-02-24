import {Vector3} from "three";
import {Line, Text} from "@react-three/drei";
import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PieceType} from "../../gameEngine.ts";
import {Piece} from "../piece/piece.tsx";

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

const ValueBox = ({ position, width, height } : { position: Vector3, width: number, height: number }) => {
  return (
    <>
      <Line position={position} points={[[0, 0          ], [0, -height    ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[0, -height    ], [width, -height]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[width, -height], [width, 0      ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[width, 0      ], [0, 0          ]]} color={"grey"} lineWidth={2} dashed={false} />
    </>
  )
}
const Label = ({ gridPos, label } : { gridPos: GridPos, label: string }) => {
  const position = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row });
  return <CustomText position={position} size={1} text={label} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
};

const Value = ({ gridPos, value } : { gridPos: GridPos, value: number | PieceType }) => {
  const isPieceValue = !Number.isInteger(value);
  const position = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row });
  const valueBoxWidth = TetrisConstants.cellSize * 4.5;
  const valueBoxHeight = TetrisConstants.cellSize * (isPieceValue ? 2.7 : 1.4);
  const borderPosition = position.clone().add({ x: -valueBoxWidth * 0.5, y: TetrisConstants.cellSize * 0.3, z: 0})
  const textPosition = position.clone().add({ x: 0, y: -TetrisConstants.cellSize * 0.5, z: 0})
  const pieceCol = isPieceValue ? (['O', 'I0'].includes(value as PieceType) ? (gridPos.col - 1) : gridPos.col - 0.5) : 0;
  const pieceGridPos = { col: pieceCol, row: gridPos.row - 2 };
  return (
    <>
      <ValueBox position={borderPosition} width={valueBoxWidth} height={valueBoxHeight} />
      { isPieceValue ?
        <Piece gridPos={pieceGridPos} type={value as PieceType} /> :
        <CustomText position={textPosition} size={1} text={value.toString(10)} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
      }
    </>
  )
};

const Info = ({ gridPos, label, value } : { gridPos: GridPos, label: string, value: number | PieceType }) => {
  const valuePos = { col: gridPos.col, row: gridPos.row - 0.8 };
  return (
    <>
      <Label gridPos={gridPos} label={label} />
      <Value gridPos={valuePos} value={value} />
    </>
  )
}

export { Info }