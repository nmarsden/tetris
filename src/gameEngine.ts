import {GridPos, GridUtils} from "./components/grid/grid.tsx";
import {Color} from "three";
import {TetrisConstants} from "./tetrisConstants.ts";

const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
type PieceTypeTuple = typeof PIECE_TYPES;
export type PieceType = PieceTypeTuple[number];

// export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type PieceData = {
  color: Color,
  positions: [number, number, number][]
};

const CZ = TetrisConstants.cellSize;

const PIECE_DATA: Map<PieceType, PieceData> = new Map([
  ['I', { color: TetrisConstants.color.cyan, positions: [[-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0], [CZ*2, -CZ, 0]]  }],
  ['O', { color: TetrisConstants.color.yellow, positions: [[0, 0, 0], [CZ, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['T', { color: TetrisConstants.color.purple, positions: [[0, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['S', { color: TetrisConstants.color.green, positions: [[0, 0, 0], [CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0]]  }],
  ['Z', { color: TetrisConstants.color.red, positions: [[-CZ, 0, 0], [0, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['J', { color: TetrisConstants.color.blue, positions: [[-CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['L', { color: TetrisConstants.color.orange, positions: [[CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }]
]);

const START_POS: GridPos = { col: 4, row: 21};

type GameState = {
  piece: {
    pos: GridPos;
    type: PieceType;
  },
  lockedColors: Color[];
};

class GameEngine {
  level = 1;
  timePerRowInMSecs = 1;
  droppingBlockPositions: GridPos[] = [];
  gameState: GameState = {
    piece: { pos: {...START_POS}, type: 'I' },
    lockedColors: []
  };

  start(): GameState {
    this.level = 1;
    this.timePerRowInMSecs = Math.pow((0.8-((this.level-1)*0.007)), (this.level-1)) * 1000;

    this.gameState.piece = { pos: {...START_POS}, type: this.randomPieceType() };
    this.gameState.lockedColors = new Array(TetrisConstants.numRows * TetrisConstants.numCols).fill(null);

    this.droppingBlockPositions = this.getDroppingBlockStartPositions(this.gameState.piece.type);

    return this.gameState;
  }

  step(): GameState {
    if (this.canMoveDown()) {
      // update gameState: piece moved down
      this.gameState.piece.pos.row--;

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col, row: pos.row - 1};
      });

      return this.gameState;
    }
    // update gameState: lockedColors & piece
    const lockedColor = (PIECE_DATA.get(this.gameState.piece.type) as PieceData).color;
    this.droppingBlockPositions.forEach(pos => {
      this.gameState.lockedColors[LockedColorUtils.gridPosToIndex(pos)] = lockedColor;
    })
    this.gameState.piece = { pos: {...START_POS}, type: this.randomPieceType() };

    // update droppingBlockPositions with newly spawned piece
    this.droppingBlockPositions = this.getDroppingBlockStartPositions(this.gameState.piece.type);

    return this.gameState;
  }

  private randomPieceType(): PieceType {
    return PIECE_TYPES[Math.round(Math.random() * 6)];
  }
  private getDroppingBlockStartPositions(type: PieceType): GridPos[] {
    const pieceData = PIECE_DATA.get(type) as PieceData;

    return pieceData.positions.map(position => ({ col: START_POS.col + position[0], row: START_POS.row + position[1]}));
  }

  private canMoveDown(): boolean {
    return this.droppingBlockPositions.every(pos => {
      const newPos = { col: pos.col, row: pos.row - 1 };
      const lockedColorIndex = LockedColorUtils.gridPosToIndex(newPos);
      return newPos.row > 19 || (newPos.row >= 0 && this.gameState.lockedColors[lockedColorIndex] === null);
    });
  }
}

class LockedColorUtils {
  static gridPosToIndex(gridPos: GridPos): number {
    return (gridPos.row * TetrisConstants.numCols) + gridPos.col;
  }

  static indexToScreen(index: number): [number, number, number] {
    const gridPos = {
      col: index % TetrisConstants.numCols,
      row: Math.floor(index / TetrisConstants.numCols)
    }
    const screen = GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
    return [screen.x, screen.y, screen.z];
  }
}

export { GameEngine, PIECE_DATA, LockedColorUtils };