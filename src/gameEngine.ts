import {GridPos} from "./components/grid/grid.tsx";
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
  ['I', { color: new Color('cyan'), positions: [[-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0], [CZ*2, -CZ, 0]]  }],
  ['O', { color: new Color('yellow'), positions: [[0, 0, 0], [CZ, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['T', { color: new Color('purple'), positions: [[0, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['S', { color: new Color('green'), positions: [[0, 0, 0], [CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0]]  }],
  ['Z', { color: new Color('red'), positions: [[-CZ, 0, 0], [0, 0, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['J', { color: new Color('blue'), positions: [[-CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }],
  ['L', { color: new Color('orange'), positions: [[CZ, 0, 0], [-CZ, -CZ, 0], [0, -CZ, 0], [CZ, -CZ, 0]]  }]
]);

const START_POS: GridPos = { col: 4, row: 21};

type GameState = {
  piece: {
    pos: GridPos;
    type: PieceType;
  }
};

class GameEngine {
  level = 1;
  timePerRowInMSecs = 1;
  droppingBlockPositions: GridPos[] = [];
  locked: boolean[] = [];
  gameState: GameState = {
    piece: { pos: {...START_POS}, type: 'I' }
  };

  start(): GameState {
    this.level = 1;
    this.locked = new Array(TetrisConstants.numRows * TetrisConstants.numCols).fill(false);
    this.timePerRowInMSecs = Math.pow((0.8-((this.level-1)*0.007)), (this.level-1)) * 1000;

    this.gameState.piece = { pos: {...START_POS}, type: this.randomPieceType() };
    this.droppingBlockPositions = this.getDroppingBlockStartPositions(this.gameState.piece.type);

    return this.gameState;
  }

  step(): GameState {
    if (this.canMoveDown()) {
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col, row: pos.row - 1};
      });
      this.gameState.piece.pos.row--;
      return this.gameState;
    }
    // TODO mark droppingBlockPositions as locked
    this.droppingBlockPositions.forEach(pos => {
      const lockedIndex = (pos.row * TetrisConstants.numCols) + pos.col;
      this.locked[lockedIndex] = true;
    })
    // TODO update piece & droppingBlockPositions
    this.gameState.piece = { pos: {...START_POS}, type: this.randomPieceType() };
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
    // TODO check against locked blocks
    return this.droppingBlockPositions.every(pos => pos.row !== 0);
  }
}

export { GameEngine, PIECE_DATA };