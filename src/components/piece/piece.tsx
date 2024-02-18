import {useMemo} from "react";
import {Color} from "three";
import {GridPos, GridUtils} from "../grid/grid.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Block} from "../block/block.tsx";

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

type PieceData = {
  color: Color,
  positions: [number, number, number][]
};

const CZ = TetrisConstants.cellSize;

const PIECE_DATA: Map<PieceType, PieceData> = new Map([
  ['I', { color: new Color('cyan'), positions: [[-CZ, 0, 0], [0, 0, 0], [CZ, 0, 0], [CZ*2, 0, 0]]  }],
  ['O', { color: new Color('yellow'), positions: [[0, 0, 0], [CZ, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['T', { color: new Color('purple'), positions: [[0, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['S', { color: new Color('green'), positions: [[0, 0, 0], [CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0]]  }],
  ['Z', { color: new Color('red'), positions: [[-CZ, 0, 0], [0, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['J', { color: new Color('blue'), positions: [[-CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['L', { color: new Color('orange'), positions: [[CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }]
]);

const Piece = ({ gridPos, type } : { gridPos: GridPos, type: PieceType }) => {
  const position = useMemo(() => {
    return GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
  }, [gridPos]);
  const pieceData: PieceData = PIECE_DATA.get(type) as PieceData;
  return (
    <group position={position}>
      {pieceData.positions.map(position => <Block position={position} color={pieceData.color}/>)}
    </group>
  )
}

export { Piece }