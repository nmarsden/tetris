import {GridPos, GridUtils} from "./components/grid/grid.tsx";
import {Color} from "three";
import {TetrisConstants} from "./tetrisConstants.ts";
import {Movement} from "./hooks/useKeyboardControls.ts";

const PIECE_TYPES = ['I0', 'I1', 'I2', 'I3', 'O', 'T0', 'T1', 'T2', 'T3', 'S0', 'S1', 'S2', 'S3', 'Z0', 'Z1', 'Z2', 'Z3', 'J0', 'J1', 'J2', 'J3', 'L0', 'L1', 'L2', 'L3'] as const;
type PieceTypeTuple = typeof PIECE_TYPES;
export type PieceType = PieceTypeTuple[number];

const SHAPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export type PieceData = {
  color: Color,
  positions: [number, number, number][]
};

const CS = TetrisConstants.cellSize;

const getPieceTypeForRotateClockwise = (pieceType: PieceType): PieceType => {
  if (pieceType === 'O') return pieceType;

  const shape = pieceType[0];
  const orientation = Number.parseInt(pieceType[1], 10);
  const newOrientation = (orientation + 1) % 4;
  return (shape + newOrientation) as PieceType;
};

const PIECE_DATA: Map<PieceType, PieceData> = new Map([
  ['I0', { color: TetrisConstants.color.cyan, positions: [[-CS, 0, 0], [0, 0, 0], [CS, 0, 0], [CS*2, 0, 0]] }],
  ['I1', { color: TetrisConstants.color.cyan, positions: [[CS, CS, 0], [CS, 0, 0], [CS, -CS, 0], [CS, -CS*2, 0]] }],
  ['I2', { color: TetrisConstants.color.cyan, positions: [[-CS, -CS, 0], [0, -CS, 0], [CS, -CS, 0], [CS*2, -CS, 0]] }],
  ['I3', { color: TetrisConstants.color.cyan, positions: [[0, CS, 0], [0, 0, 0], [0, -CS, 0], [0, -CS*2, 0]] }],

  ['O',  { color: TetrisConstants.color.yellow, positions: [[0, 0, 0], [CS, 0, 0], [0, -CS, 0], [CS, -CS, 0]] }],

  ['T0', { color: TetrisConstants.color.purple, positions: [[0, CS, 0], [-CS, 0, 0], [0, 0, 0], [CS, 0, 0]] }],
  ['T1', { color: TetrisConstants.color.purple, positions: [[0, CS, 0], [0, -CS, 0], [0, 0, 0], [CS, 0, 0]] }],
  ['T2', { color: TetrisConstants.color.purple, positions: [[0, -CS, 0], [-CS, 0, 0], [0, 0, 0], [CS, 0, 0]] }],
  ['T3', { color: TetrisConstants.color.purple, positions: [[0, CS, 0], [-CS, 0, 0], [0, 0, 0], [0, -CS, 0]] }],

  ['S0', { color: TetrisConstants.color.green, positions: [[0, CS, 0], [CS, CS, 0], [-CS, 0, 0], [0, 0, 0]] }],
  ['S1', { color: TetrisConstants.color.green, positions: [[0, CS, 0], [0, 0, 0], [CS, 0, 0], [CS, -CS, 0]] }],
  ['S2', { color: TetrisConstants.color.green, positions: [[0, 0, 0], [CS, 0, 0], [-CS, -CS, 0], [0, -CS, 0]] }],
  ['S3', { color: TetrisConstants.color.green, positions: [[-CS, CS, 0], [-CS, 0, 0], [0, 0, 0], [0, -CS, 0]] }],

  ['Z0', { color: TetrisConstants.color.red, positions: [[-CS, CS, 0], [0, CS, 0], [0, 0, 0], [CS, 0, 0]]  }],
  ['Z1', { color: TetrisConstants.color.red, positions: [[CS, CS, 0], [0, 0, 0], [CS, 0, 0], [0, -CS, 0]]  }],
  ['Z2', { color: TetrisConstants.color.red, positions: [[-CS, 0, 0], [0, 0, 0], [0, -CS, 0], [CS, -CS, 0]]  }],
  ['Z3', { color: TetrisConstants.color.red, positions: [[0, CS, 0], [-CS, 0, 0], [0, 0, 0], [-CS, -CS, 0]]  }],

  ['J0', { color: TetrisConstants.color.blue, positions: [[-CS, CS, 0], [-CS, 0, 0], [0, 0, 0], [CS, 0, 0]] }],
  ['J1', { color: TetrisConstants.color.blue, positions: [[0, CS, 0], [CS, CS, 0], [0, 0, 0], [0, -CS, 0]] }],
  ['J2', { color: TetrisConstants.color.blue, positions: [[-CS, 0, 0], [0, 0, 0], [CS, 0, 0], [CS, -CS, 0]] }],
  ['J3', { color: TetrisConstants.color.blue, positions: [[0, CS, 0], [0, 0, 0], [-CS, -CS, 0], [0, -CS, 0]] }],

  ['L0', { color: TetrisConstants.color.orange, positions: [[CS, CS, 0], [-CS, 0, 0], [0, 0, 0], [CS, 0, 0]] }],
  ['L1', { color: TetrisConstants.color.orange, positions: [[0, CS, 0], [0, 0, 0], [0, -CS, 0], [CS, -CS, 0]] }],
  ['L2', { color: TetrisConstants.color.orange, positions: [[-CS, 0, 0], [0, 0, 0], [CS, 0, 0], [-CS, -CS, 0]] }],
  ['L3', { color: TetrisConstants.color.orange, positions: [[-CS, CS, 0], [0, CS, 0], [0, 0, 0], [0, -CS, 0]] }]
]);

const START_POS: GridPos = { col: 4, row: 21};

type Piece = {
  pos: GridPos;
  type: PieceType;
};

type GameState = {
  piece: Piece,
  ghostPiece: Piece,
  lockedColors: Color[];
};

class GameEngine {
  level = 1;
  timePerRowInMSecs = 1;
  droppingBlockPositions: GridPos[] = [];
  gameState: GameState = {
    piece: { pos: {...START_POS}, type: 'I0' },
    ghostPiece: { pos: {...START_POS}, type: 'I0' },
    lockedColors: []
  };

  start(): GameState {
    this.level = 1;
    this.timePerRowInMSecs = Math.pow((0.8-((this.level-1)*0.007)), (this.level-1)) * 1000;
    this.gameState.lockedColors = new Array(TetrisConstants.numRows * TetrisConstants.numCols).fill(null);

    const newPiece = { pos: {...START_POS}, type: this.randomPieceType() };
    this.gameState.piece = newPiece
    this.gameState.ghostPiece = this.ghostPiece(newPiece);

    this.droppingBlockPositions = this.getBlockPositions(newPiece);

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
    // update gameState: lockedColors, piece & ghostPiece
    const lockedColor = (PIECE_DATA.get(this.gameState.piece.type) as PieceData).color;
    this.droppingBlockPositions.forEach(pos => {
      this.gameState.lockedColors[LockedColorUtils.gridPosToIndex(pos)] = lockedColor;
    })
    const newPiece = { pos: {...START_POS}, type: this.randomPieceType() };
    this.gameState.piece = newPiece;
    this.gameState.ghostPiece = this.ghostPiece(newPiece);

    // update droppingBlockPositions with newly spawned piece
    this.droppingBlockPositions = this.getBlockPositions(newPiece);

    return this.gameState;
  }

  handleMovement(movement: Movement): GameState {
    if (movement.moveLeft && this.canMoveLeft()) {
      // update gameState: piece & ghostPiece moved left
      this.gameState.piece.pos.col--;
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col - 1, row: pos.row};
      });
      return this.gameState;
    }
    if (movement.moveRight && this.canMoveRight()) {
      // update gameState: piece & ghostPiece moved left
      this.gameState.piece.pos.col++;
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col + 1, row: pos.row};
      });
      return this.gameState;
    }
    if (movement.rotateClockwise) {
      // TODO check if can rotate
      // TODO introduce wall kicks
      // update gameState: rotate piece & ghost clockwise
      this.gameState.piece.type = getPieceTypeForRotateClockwise(this.gameState.piece.type);
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);
      return this.gameState;
    }
    return this.gameState;
  }

  private randomPieceType(): PieceType {
    const shape = SHAPES[Math.round(Math.random() * 6)];
    return shape === 'O' ? shape : (shape + '0') as PieceType;
  }

  private getBlockPositions(piece: Piece): GridPos[] {
    const pieceData = PIECE_DATA.get(piece.type) as PieceData;

    return pieceData.positions.map(position => ({ col: piece.pos.col + position[0], row: piece.pos.row + position[1]}));
  }

  private canMoveDown(): boolean {
    return this.droppingBlockPositions.every(pos => {
      const newPos = { col: pos.col, row: pos.row - 1 };
      const lockedColorIndex = LockedColorUtils.gridPosToIndex(newPos);
      return newPos.row > 19 || (newPos.row >= 0 && this.gameState.lockedColors[lockedColorIndex] === null);
    });
  }

  private canMoveLeft(): boolean {
    return this.droppingBlockPositions.every(pos => {
      const newPos = { col: pos.col - 1, row: pos.row };
      const lockedColorIndex = LockedColorUtils.gridPosToIndex(newPos);
      return newPos.col >= 0 && newPos.row <= 19 && this.gameState.lockedColors[lockedColorIndex] === null;
    });
  }

  private canMoveRight(): boolean {
    return this.droppingBlockPositions.every(pos => {
      const newPos = { col: pos.col + 1, row: pos.row };
      const lockedColorIndex = LockedColorUtils.gridPosToIndex(newPos);
      return newPos.col < TetrisConstants.numCols && newPos.row <= 19 && this.gameState.lockedColors[lockedColorIndex] === null;
    });
  }

  private ghostPiece(piece: Piece): Piece {
    // Find valid position for the ghost piece with the lowest row starting from the given piece's row or 18
    const startingRow = piece.pos.row <= 18 ? piece.pos.row : 18;
    const ghostPiece = { pos: { col: piece.pos.col, row: startingRow }, type: piece.type };
    while(this.isValidPositions(ghostPiece)) {
      ghostPiece.pos.row--;
    }
    ghostPiece.pos.row++;
    return ghostPiece;
  }

  private isValidPositions(piece: Piece): boolean {
    const positions = this.getBlockPositions(piece);
    return positions.every(pos => {
      const lockedColorIndex = LockedColorUtils.gridPosToIndex(pos);
      return pos.row >=0 && this.gameState.lockedColors[lockedColorIndex] === null;
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