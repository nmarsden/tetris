import {Vector3} from "three";
import {Line, Text} from "@react-three/drei";
import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";

const BORDER_WIDTH = TetrisConstants.cellSize * 3.5;
const BORDER_HEIGHT = TetrisConstants.cellSize * 1.4;

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

const Value = ({ position, value } : { position: Vector3, value: number }) => {
  const borderPosition = position.clone().add({ x: -BORDER_WIDTH * 0.5, y: TetrisConstants.cellSize * 0.3, z: 0})
  const textPosition = position.clone().add({ x: 0, y: -TetrisConstants.cellSize * 0.5, z: 0})
  return (
    <>
      <Line position={borderPosition} points={[[0, 0                        ], [0, -BORDER_HEIGHT           ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={borderPosition} points={[[0, -BORDER_HEIGHT           ], [BORDER_WIDTH, -BORDER_HEIGHT]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={borderPosition} points={[[BORDER_WIDTH, -BORDER_HEIGHT], [BORDER_WIDTH, 0             ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={borderPosition} points={[[BORDER_WIDTH, 0             ], [0, 0                        ]]} color={"grey"} lineWidth={2} dashed={false} />
      <CustomText position={textPosition} size={1} text={value.toString(10)} color={0xFFFFFF} outlineColor={0xFFFFFF}/>
    </>
  )
};

const Info = ({ gridPos, label, value } : { gridPos: GridPos, label: string, value: number }) => {
  const labelPos = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row });
  const valuePos = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row - 0.8 });
  return (
    <>
      <Label position={labelPos} label={label} />
      <Value position={valuePos} value={value} />
    </>
  )
}

export { Info }