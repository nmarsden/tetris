import {GridPos, GridUtils} from "./components/playfield/playfield.tsx";
import {Color} from "three";
import {TetrisConstants} from "./tetrisConstants.ts";
import {Action} from "./hooks/useKeyboardControls.ts";

const PIECE_TYPES = ['I0', 'I1', 'I2', 'I3', 'O', 'T0', 'T1', 'T2', 'T3', 'S0', 'S1', 'S2', 'S3', 'Z0', 'Z1', 'Z2', 'Z3', 'J0', 'J1', 'J2', 'J3', 'L0', 'L1', 'L2', 'L3'] as const;
type PieceTypeTuple = typeof PIECE_TYPES;
export type PieceType = PieceTypeTuple[number];


class RandomPieceBag {
  pieces: PieceType[] = ['I0', 'O', 'T0', 'S0', 'Z0', 'J0', 'L0'];
  pieceIndex = 0;

  constructor() {
    this.pieces = this.shuffle(this.pieces);
  }

  pick(): PieceType {
    const piece = this.pieces[this.pieceIndex];
    this.pieceIndex++;
    if (this.pieceIndex === 7) {
      this.pieces = this.shuffle(this.pieces);
      this.pieceIndex = 0;
    }
    return piece;
  }

  private shuffle(a: PieceType[]): PieceType[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
}

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

  ['O',  { color: TetrisConstants.color.yellow, positions: [[0, CS, 0], [CS, CS, 0], [0, 0, 0], [CS, 0, 0]] }],

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

const START_POS: GridPos = { col: 4, row: 18};

type Piece = {
  pos: GridPos;
  type: PieceType;
};

type GameState = {
  piece: Piece,
  ghostPiece: Piece,
  nextPieceType: PieceType,
  lockedColors: Color[];
  completedRows: number[];
  previousIsLockMode: boolean;
  isLockMode: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lines: number;
};

class GameEngine {
  timePerRowInMSecs = 1;
  droppingBlockPositions: GridPos[] = [];
  pieceBag: RandomPieceBag = new RandomPieceBag();
  gameState: GameState = {
    piece: { pos: {...START_POS}, type: 'I0' },
    ghostPiece: { pos: {...START_POS}, type: 'I0' },
    nextPieceType: 'I0',
    lockedColors: [],
    completedRows: [],
    previousIsLockMode: false,
    isLockMode: false,
    isPaused: false,
    score: 0,
    level: 1,
    lines: 0
  };

  start(): GameState {
    this.gameState.score = 0;
    this.gameState.level = 1;
    this.gameState.lines = 0;
    this.timePerRowInMSecs = this.calcTimePerRow(this.gameState.level);
    this.gameState.lockedColors = new Array(TetrisConstants.numRows * TetrisConstants.numCols).fill(null);

    // DEBUG: uncomment below to easily complete a row
    // this.gameState.lockedColors[0] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[1] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[2] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[3] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[4] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[5] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[6] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[7] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[10] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[11] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[12] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[13] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[14] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[15] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[16] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[17] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[22] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[23] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[32] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[33] = TetrisConstants.color.yellow;

    const newPiece = { pos: {...START_POS}, type: this.pieceBag.pick() };
    this.gameState.piece = newPiece
    this.gameState.ghostPiece = this.ghostPiece(newPiece);
    this.gameState.nextPieceType = this.pieceBag.pick();
    this.setIsLockMode(false);
    this.gameState.isPaused = false;

    this.droppingBlockPositions = this.getBlockPositions(newPiece);

    return this.gameState;
  }

  step(): GameState {
    if (this.gameState.isPaused) return this.gameState;

    if (this.gameState.isLockMode) {
      this.setIsLockMode(false);

      if (!this.canMoveDown()) {
        // -- Lock piece --
        // update gameState: lockedColors & completedRow
        const lockedColor = (PIECE_DATA.get(this.gameState.piece.type) as PieceData).color;
        this.droppingBlockPositions.forEach(pos => {
          this.gameState.lockedColors[LockedColorUtils.gridPosToIndex(pos)] = lockedColor;
        })
        this.gameState.completedRows = this.getCompletedRows(this.gameState.lockedColors, this.droppingBlockPositions);

        if (this.gameState.completedRows.length === 0) {
          // update gameState: piece & ghostPiece
          const newPiece = { pos: {...START_POS}, type: this.gameState.nextPieceType };
          this.gameState.piece = newPiece;
          this.gameState.ghostPiece = this.ghostPiece(newPiece);
          this.gameState.nextPieceType = this.pieceBag.pick();

          // update droppingBlockPositions with newly spawned piece
          this.droppingBlockPositions = this.getBlockPositions(newPiece);
        }

         return this.gameState;
      }
    }
    // check if there are completed rows to be removed
    if (this.gameState.completedRows.length > 0) {
      // update gameState: score & lines
      this.gameState.score = this.gameState.score + this.calcCompletedRowsScore(this.gameState.completedRows.length, this.gameState.level);
      this.gameState.lines = this.gameState.lines + this.gameState.completedRows.length;

      // update gameState: level
      if (this.isLevelUp(this.gameState.level, this.gameState.lines)) {
        this.gameState.level++;
        this.timePerRowInMSecs = this.calcTimePerRow(this.gameState.level);
      }

      // update gameState: lockedColors, completedRows, & ghostPiece
      this.gameState.lockedColors = this.removeCompleteRows(this.gameState.lockedColors, this.gameState.completedRows);
      this.gameState.completedRows = [];

      // update gameState: piece & ghostPiece
      const newPiece = { pos: {...START_POS}, type: this.gameState.nextPieceType };
      this.gameState.piece = newPiece;
      this.gameState.ghostPiece = this.ghostPiece(newPiece);
      this.gameState.nextPieceType = this.pieceBag.pick();

      // update droppingBlockPositions with newly spawned piece
      this.droppingBlockPositions = this.getBlockPositions(newPiece);

      return this.gameState;
    }

    if (this.canMoveDown()) {
      // update gameState: piece moved down
      this.gameState.piece = this.movePiece(this.gameState.piece, { col: 0, row: -1 });

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col, row: pos.row - 1};
      });

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.setIsLockMode(true);
      }

      return this.gameState;
    }

    return this.gameState;
  }

  handleAction(action: Action): GameState {
    if (action.pause) {
      this.gameState.isPaused = !this.gameState.isPaused;

      return this.gameState;
    }
    if (this.gameState.isPaused) return this.gameState;

    if (action.moveLeft && this.canMoveLeft()) {
      // update gameState: piece & ghostPiece moved left
      this.gameState.piece = this.movePiece(this.gameState.piece, { col: -1, row: 0 });
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col - 1, row: pos.row};
      });

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.setIsLockMode(true);
      }
      return this.gameState;
    }
    if (action.moveRight && this.canMoveRight()) {
      // update gameState: piece & ghostPiece moved left
      this.gameState.piece = this.movePiece(this.gameState.piece, { col: 1, row: 0 });
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col + 1, row: pos.row};
      });

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.setIsLockMode(true);
      }
      return this.gameState;
    }
    if (action.moveDown && this.canMoveDown()) {
      // update gameState: piece moved down
      this.gameState.piece = this.movePiece(this.gameState.piece, { col: 0, row: -1 });

      // update droppingBlockPositions
      this.droppingBlockPositions.forEach((pos, index) => {
        this.droppingBlockPositions[index] = { col: pos.col, row: pos.row - 1};
      });

      // update score
      this.gameState.score = this.gameState.score + 1;

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.setIsLockMode(true);
      }
      return this.gameState;
    }
    if (action.rotateClockwise) {
      // TODO check if can rotate
      // TODO introduce wall kicks
      // update gameState: rotate piece & ghost clockwise
      this.gameState.piece.type = getPieceTypeForRotateClockwise(this.gameState.piece.type);
      this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

      // update droppingBlockPositions
      this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.setIsLockMode(true);
      }
      return this.gameState;
    }

    if (this.gameState.isLockMode) {
      // -- Hack alert --
      // When already in lock mode and not able to move, ensure previousIsLockMode and isLockMode are both true.
      // This prevents the timeout being reset so that lock mode will end after 500ms.
      this.setIsLockMode(true);
    }
    return this.gameState;
  }

  private calcTimePerRow(level: number): number {
    return Math.pow((0.8-((level-1)*0.007)), (this.gameState.level-1)) * 1000;
  }

  private isLevelUp(level: number, lines: number): boolean {
    return lines >= (level * 10);
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

  private movePiece(piece: Piece, offset: GridPos): Piece {
    return {
      pos: {
        col: piece.pos.col + offset.col,
        row: piece.pos.row + offset.row
      },
      type: piece.type,
    };
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

  private getCompletedRows(lockedColors: Color[], pieceBlockPositions: GridPos[]): number[] {
    const completedRows: number[] = [];
    const cols = [...Array(TetrisConstants.numCols).keys()];
    const pieceRows = [...new Set(pieceBlockPositions.map(pos => pos.row))];
    pieceRows.forEach(row => {
      if (cols.every(col => lockedColors[LockedColorUtils.gridPosToIndex({ col, row })] !== null)) {
        completedRows.push(row);
      }
    })
    return completedRows;
  }

  private removeCompleteRows(lockedColors: Color[], completedRows: number[]): Color[] {
    // remove completed rows from lockedColors and add empty rows to the end
    completedRows.forEach(row => {
      lockedColors.splice(LockedColorUtils.gridPosToIndex({ col: 0, row }), TetrisConstants.numCols);
      lockedColors.push(...new Array(TetrisConstants.numCols).fill(null));
    })
    return lockedColors;
  }

  private setIsLockMode(isLockMode: boolean): void {
    this.gameState.previousIsLockMode = this.gameState.isLockMode;
    this.gameState.isLockMode = isLockMode;
  }

  private calcCompletedRowsScore(completedRows: number, level: number): number {
    switch(completedRows) {
      case 1: return 100 * level;
      case 2: return 300 * level;
      case 3: return 500 * level;
      case 4: return 800 * level;
      default: return 0;
    }
  }
}

class LockedColorUtils {
  static gridPosToIndex(gridPos: GridPos): number {
    return (gridPos.row * TetrisConstants.numCols) + gridPos.col;
  }

  static indexToGridPos(index: number): GridPos {
    return {
      col: index % TetrisConstants.numCols,
      row: Math.floor(index / TetrisConstants.numCols)
    };
  }

  static indexToScreen(index: number): [number, number, number] {
    const gridPos = this.indexToGridPos(index);
    const screen = GridUtils.gridPosToScreen(gridPos).addScalar(TetrisConstants.cellSize * 0.5);
    return [screen.x, screen.y, screen.z];
  }
}

export { GameEngine, PIECE_DATA, LockedColorUtils };