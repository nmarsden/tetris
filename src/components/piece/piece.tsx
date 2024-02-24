import {useMemo} from "react";
import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Block, BlockMode} from "../block/block.tsx";
import {PIECE_DATA, PieceData, PieceType} from "../../gameEngine.ts";

const Piece = ({ gridPos, type, isGhost = false, isLock = false } : { gridPos: GridPos, type: PieceType, isGhost?: boolean, isLock?: boolean }) => {
  const position = useMemo(() => {
    return GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
  }, [gridPos]);
  const pieceData: PieceData = PIECE_DATA.get(type) as PieceData;
  const blockMode: BlockMode = isGhost ? 'GHOST' : (isLock ? 'LOCK' : 'STANDARD');
  return (
    <group position={position}>
      {pieceData.positions.map((position, index) => <Block key={`${index}`} position={position} color={pieceData.color} mode={blockMode}/>)}
    </group>
  )
}

export { Piece }