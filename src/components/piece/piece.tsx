import {useMemo} from "react";
import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Block, BlockMode} from "../block/block.tsx";
import {PIECE_DATA, PieceData, PieceType} from "../../gameEngine.ts";
import {GradientTexture, Plane} from "@react-three/drei";
import {Vector3} from "three";
import {SpringValue, useSpringValue} from "@react-spring/three";

type Blur = {
  position: Vector3;
  numRows: number;
};

const Piece = ({ gridPos, type, rowsDropped = 0, isGhost = false, isLock = false, opacity } : { gridPos: GridPos, type: PieceType, rowsDropped?: number, isGhost?: boolean, isLock?: boolean, opacity?: SpringValue<number> }) => {
  const defaultOpacity = useSpringValue(1);
  const pieceOpacity = opacity === null ? defaultOpacity : opacity;

  const position = useMemo(() => {
    return GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
  }, [gridPos]);

  const { pieceData, blurData } = useMemo(() => {
    const pieceData = PIECE_DATA.get(type) as PieceData;
    const blurHeight = rowsDropped;
    const blurData: Blur[] = rowsDropped === 0 ? [] : pieceData.positions.map(pos => ({ position: new Vector3(pos[0], pos[1] + (blurHeight * 0.5), 0), numRows: blurHeight }));
    return { pieceData, blurData };
  }, [type, rowsDropped]);

  const blockMode: BlockMode = isGhost ? 'GHOST' : (isLock ? 'LOCK' : 'STANDARD');

  return (
    <group position={position}>
      {/* Blur effect */}
      {blurData.map((blur, index) =>
        <Plane key={`${index}`} position={blur.position} args={[TetrisConstants.cellSize, blur.numRows]}>
          <meshBasicMaterial opacity={0.2} transparent={true}>
            <GradientTexture
              stops={[0, 1]} // As many stops as you want
              colors={['black', 'white']} // Colors need to match the number of stops
              size={1024} // Size is optional, default = 1024
            />
          </meshBasicMaterial>
        </Plane>
      )}
      {/* Piece */}
      {pieceData.positions.map((position, index) =>
        <Block key={`${index}`} position={position} color={pieceData.color} mode={blockMode} outlineOpacity={pieceOpacity} />
      )}
    </group>
  )
}

export {Piece}