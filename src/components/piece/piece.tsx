import {useMemo} from "react";
import {GridPos, GridUtils} from "../grid/grid.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Block} from "../block/block.tsx";
import {PIECE_DATA, PieceData, PieceType} from "../../gameEngine.ts";

const Piece = ({ gridPos, type, isGhost = false } : { gridPos: GridPos, type: PieceType, isGhost?: boolean }) => {
  const position = useMemo(() => {
    return GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
  }, [gridPos]);
  const pieceData: PieceData = PIECE_DATA.get(type) as PieceData;
  const opacity = isGhost ? 0.3 : 1;
  return (
    <group position={position}>
      {pieceData.positions.map((position, index) => <Block key={`${index}`} position={position} color={pieceData.color} opacity={opacity}/>)}
    </group>
  )
}

export { Piece }