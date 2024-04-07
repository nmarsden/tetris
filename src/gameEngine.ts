import {GridPos, GridUtils} from "./components/playfield/playfield.tsx";
import {Color} from "three";
import {TetrisConstants} from "./tetrisConstants.ts";
import {Action} from "./hooks/useKeyboardControls.ts";

export type GameMode = 'HOME' | 'INIT' | 'PLAYING' | 'PAUSED' | 'GAME OVER';

const PIECE_TYPES = ['I0', 'I1', 'I2', 'I3', 'O', 'T0', 'T1', 'T2', 'T3', 'S0', 'S1', 'S2', 'S3', 'Z0', 'Z1', 'Z2', 'Z3', 'J0', 'J1', 'J2', 'J3', 'L0', 'L1', 'L2', 'L3'] as const;
type PieceTypeTuple = typeof PIECE_TYPES;
export type PieceType = PieceTypeTuple[number];

type PieceAction = 'MOVE' | 'ROTATE' | 'SOFT DROP' | 'HARD DROP' | 'LOCK' | 'BLOCKED LEFT' | 'BLOCKED RIGHT' | 'BLOCKED DOWN' | null;

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

const WALL_KICK_OFFSETS: Map<string, GridPos[]> = new Map([
  ['I01', [{ col: -2, row: 0 }, { col: 1,  row: 0  }, { col: -2, row: 1  }, { col: 1,  row: -2 }]],
  ['I12', [{ col: -1, row: 0 }, { col: 2,  row: 0  }, { col: -1, row: -2 }, { col: 2,  row: 1  }]],
  ['I23', [{ col: 2,  row: 0 }, { col: -1, row: 0  }, { col: 2,  row: -1 }, { col: -1, row: 2  }]],
  ['I30', [{ col: 1,  row: 0 }, { col: -2, row: 0  }, { col: 1,  row: 2  }, { col: -2, row: -1 }]],
  ['01',  [{ col: -1, row: 0 }, { col: -1, row: -1 }, { col: 0,  row: 2  }, { col: -1, row: 2  }]],
  ['12',  [{ col: 1,  row: 0 }, { col: 1,  row: 1  }, { col: 0,  row: -2 }, { col: 1,  row: -2 }]],
  ['23',  [{ col: 1,  row: 0 }, { col: 1,  row: -1 }, { col: 0,  row: 2  }, { col: 1,  row: 2  }]],
  ['30',  [{ col: -1, row: 0 }, { col: -1, row: 1  }, { col: 0,  row: -2 }, { col: -1, row: -2 }]],
]);

const START_POS: GridPos = { col: 4, row: 18};

type Piece = {
  pos: GridPos;
  type: PieceType;
};

type Achievement = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'TETRIS' | 'LEVEL UP' | 'PERFECT CLEAR' | 'COMBO' | 'NEW BEST SCORE';

export type ToastDetails = {
  id: number;
  row: number;
  achievement: Achievement;
  points: number;
};

export type GameEngineMethod = () => GameState;

type GameState = {
  mode: GameMode;
  piece: Piece;
  pieceAction: PieceAction;
  pieceRowsDropped: number;
  ghostPiece: Piece;
  nextPieceType: PieceType;
  lockedColors: Color[];
  completedRows: number[];
  previousIsLockMode: boolean;
  isLockMode: boolean;
  score: number;
  bestScore: number;
  isNewBestScore: boolean;
  level: number;
  lines: number;
  toasts: ToastDetails[];
};

class GameEngine {
  timePerRowInMSecs = 1000;
  droppingBlockPositions: GridPos[] = [];
  pieceBag: RandomPieceBag = new RandomPieceBag();
  comboCounter = -1;
  gameState: GameState = {
    mode: 'HOME',
    piece: { pos: {...START_POS}, type: 'I0' },
    pieceAction: null,
    pieceRowsDropped: 0,
    ghostPiece: { pos: {...START_POS}, type: 'I0' },
    nextPieceType: 'I0',
    lockedColors: [],
    completedRows: [],
    previousIsLockMode: false,
    isLockMode: false,
    score: 0,
    bestScore: 0,
    isNewBestScore: false,
    level: 0,
    lines: 0,
    toasts: []
  };

  initialState(bestScore: number): GameState {
    this.gameState.bestScore = bestScore;
    return this.gameState;
  }

  // logPlayfield(): void {
  //   for (let row=19; row>=0; row--) {
  //     let output = '';
  //     for (let col=0; col<10; col++) {
  //       const index = (row * 10) + col;
  //       const isDroppedBlock = this.droppingBlockPositions.some(pos => pos.row === row && pos.col === col);
  //       output = output + (this.gameState.lockedColors[index] ? '*' : isDroppedBlock ? 'O' : '_');
  //     }
  //     console.log(`${row}: ${output}`);
  //   }
  // }

  init(): GameState {
    this.gameState.mode = 'INIT';
    this.gameState.score = 0;
    this.gameState.isNewBestScore = false;
    this.gameState.level = 1;
    this.gameState.lines = 0;
    this.gameState.toasts = [];
    this.timePerRowInMSecs = this.calcTimePerRow(this.gameState.level);
    this.gameState.lockedColors = new Array(TetrisConstants.numRows * TetrisConstants.numCols).fill(null);
    this.pieceBag = new RandomPieceBag();
    this.comboCounter = -1;

    // DEBUG: uncomment below to easily complete a row
    // -- row 0
    // this.gameState.lockedColors[0] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[1] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[2] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[3] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[4] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[5] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[6] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[7] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[8] = null;
    // this.gameState.lockedColors[9] = TetrisConstants.color.yellow;

    // -- row 1
    // this.gameState.lockedColors[10] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[11] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[12] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[13] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[14] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[15] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[16] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[17] = TetrisConstants.color.yellow;
    // this.gameState.lockedColors[18] = null;
    // this.gameState.lockedColors[19] = null;

    // -- multiple rows
    // for (let row=0; row<16; row++) {
    //   for (let col=0; col<10; col++) {
    //     const index = (row * 10) + col;
    //     const color = (row === 15 && col === 5) ? null : TetrisConstants.color.yellow;
    //     this.gameState.lockedColors[index] = color;
    //   }
    // }

    const newPiece = { pos: {...START_POS}, type: this.pieceBag.pick() };
    this.gameState.piece = newPiece
    this.gameState.ghostPiece = this.ghostPiece(newPiece);
    this.gameState.nextPieceType = this.pieceBag.pick();
    this.setIsLockMode(false);

    this.droppingBlockPositions = this.getBlockPositions(newPiece);

    return this.gameState;
  }

  start(): GameState {
    this.gameState.mode = 'PLAYING';
    return this.gameState;
  }

  resume(): GameState {
    this.gameState.mode = 'PLAYING';
    return this.step();
  }

  step(): GameState {
    if (this.gameState.mode !== 'PLAYING') return this.gameState;

    if (this.gameState.isLockMode) {
      this.setIsLockMode(false);
      this.gameState.pieceAction = null;
      this.gameState.pieceRowsDropped = 0;

      if (!this.canMoveDown()) {
        // -- Lock piece --
        // update gameState: lockedColors & completedRow
        const lockedColor = (PIECE_DATA.get(this.gameState.piece.type) as PieceData).color;
        this.droppingBlockPositions.forEach(pos => {
          this.gameState.lockedColors[LockedColorUtils.gridPosToIndex(pos)] = lockedColor;
        })
        this.gameState.completedRows = this.getCompletedRows(this.gameState.lockedColors, this.droppingBlockPositions);

        if (this.gameState.completedRows.length > 0) {
          // update gameState: toasts
          this.addToast(
            this.gameState.completedRows[0],
            this.calcCompletedRowsAchievement(this.gameState.completedRows.length),
            this.calcCompletedRowsPoints(this.gameState.completedRows.length, this.gameState.level)
          );
          // increase comboCounter
          this.comboCounter++;
        } else {
          // update gameState: piece & ghostPiece
          const newPiece = { pos: {...START_POS}, type: this.gameState.nextPieceType };

          // reset comboCounter
          this.comboCounter = -1;

          // check if game over
          if (this.isGameOver(newPiece)) {
            this.gameState.mode = 'GAME OVER';
            return this.gameState;
          }

          this.gameState.piece = newPiece;
          this.gameState.ghostPiece = this.ghostPiece(newPiece);
          this.gameState.nextPieceType = this.pieceBag.pick();

          // update droppingBlockPositions with newly spawned piece
          this.droppingBlockPositions = this.getBlockPositions(newPiece);

          // check for new piece immediately in lockMode
          if (!this.canMoveDown()) {
            // LOCK DETECTED!!!
            this.gameState.pieceAction = 'LOCK';
            this.setIsLockMode(true);
          }
        }

         return this.gameState;
      }
    }
    // check if there are completed rows to be removed
    if (this.gameState.completedRows.length > 0) {
      // update gameState: score & lines
      this.addToScore(this.calcCompletedRowsPoints(this.gameState.completedRows.length, this.gameState.level));
      this.gameState.lines = this.gameState.lines + this.gameState.completedRows.length;

      if (this.isLevelUp(this.gameState.level, this.gameState.lines)) {
        // update gameState: level & toasts
        this.gameState.level++;
        this.timePerRowInMSecs = this.calcTimePerRow(this.gameState.level);
        this.addToast(8, 'LEVEL UP', 0);
      }

      // update gameState: lockedColors
      this.gameState.lockedColors = this.removeCompleteRows(this.gameState.lockedColors, this.gameState.completedRows);

      // check for combo
      if (this.comboCounter > 0) {
        // update gameState: score & toasts
        const comboPoints = this.comboCounter * 50 * this.gameState.level;
        this.addToScore(comboPoints);
        this.addToast(this.gameState.completedRows[0], 'COMBO', comboPoints);
      }

      if (this.isPerfectClear(this.gameState.lockedColors)) {
        // update gameState: score & toasts
        const perfectClearPoints = this.calcPerfectClearPoints(this.gameState.completedRows.length, this.gameState.level);
        this.addToScore(perfectClearPoints);
        this.addToast(8, 'PERFECT CLEAR', perfectClearPoints);
      }

      // update gameState: completedRows
      this.gameState.completedRows = [];

      // update gameState: piece & ghostPiece
      const newPiece = { pos: {...START_POS}, type: this.gameState.nextPieceType };

      // check if game over
      if (this.isGameOver(newPiece)) {
        this.gameState.mode = 'GAME OVER';
        return this.gameState;
      }

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
      this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

      if (!this.canMoveDown()) {
        // LOCK DETECTED!!!
        this.gameState.pieceAction = 'LOCK';
        this.setIsLockMode(true);
      }

      return this.gameState;
    }

    return this.gameState;
  }

  handleAction(action: Action): GameState {
    if (action.pause && this.gameState.mode === 'PLAYING') {
      this.gameState.mode = 'PAUSED';
      return this.gameState;
    }
    if (this.gameState.mode !== 'PLAYING') return this.gameState;

    // do not allow movement when completed rows
    if (this.gameState.completedRows.length !== 0) {
      return this.gameState;
    }

    if (action.moveLeft) {
      if (!this.canMoveLeft()) {
        this.gameState.pieceAction = 'BLOCKED LEFT';
      } else {
        // update gameState: piece & ghostPiece moved left
        this.gameState.piece = this.movePiece(this.gameState.piece, {col: -1, row: 0});
        this.gameState.pieceAction = 'MOVE';
        this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

        // update droppingBlockPositions
        this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

        if (!this.canMoveDown()) {
          // LOCK DETECTED!!!
          this.gameState.pieceAction = 'LOCK';
          this.setIsLockMode(true);
        }
        return this.gameState;
      }
    } else if (this.gameState.pieceAction === 'BLOCKED LEFT') {
      this.gameState.pieceAction = null;
    }

    if (action.moveRight) {
      if (!this.canMoveRight()) {
        this.gameState.pieceAction = 'BLOCKED RIGHT';
      } else {
        // update gameState: piece & ghostPiece moved left
        this.gameState.piece = this.movePiece(this.gameState.piece, {col: 1, row: 0});
        this.gameState.pieceAction = 'MOVE';
        this.gameState.ghostPiece = this.ghostPiece(this.gameState.piece);

        // update droppingBlockPositions
        this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

        if (!this.canMoveDown()) {
          // LOCK DETECTED!!!
          this.gameState.pieceAction = 'LOCK';
          this.setIsLockMode(true);
        }
        return this.gameState;
      }
    } else if (this.gameState.pieceAction === 'BLOCKED RIGHT') {
      this.gameState.pieceAction = null;
    }

    if (action.moveDown) {
      if (!this.canMoveDown()) {
        this.gameState.pieceAction = 'BLOCKED DOWN';
      } else {
        // update gameState: piece moved down
        this.gameState.piece = this.movePiece(this.gameState.piece, {col: 0, row: -1});
        this.gameState.pieceAction = 'SOFT DROP';

        // update droppingBlockPositions
        this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

        // update score
        this.addToScore(1);

        if (!this.canMoveDown()) {
          // LOCK DETECTED!!!
          this.gameState.pieceAction = 'LOCK';
          this.setIsLockMode(true);
        }
        return this.gameState;
      }
    }

    if (action.rotateClockwise) {
      const rotatedPiece = this.getValidPieceRotatedClockwise(this.gameState.piece);
      if (rotatedPiece === null) {
        this.gameState.pieceAction = 'BLOCKED RIGHT';
      } else {
        // update gameState: rotate piece & ghost clockwise
        this.gameState.piece = rotatedPiece;
        this.gameState.pieceAction = 'ROTATE';
        this.gameState.ghostPiece = this.ghostPiece(rotatedPiece);

        // update droppingBlockPositions
        this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);

        if (!this.canMoveDown()) {
          // LOCK DETECTED!!!
          this.gameState.pieceAction = 'LOCK';
          this.setIsLockMode(true);
        }
        return this.gameState;
      }
    }
    if (action.hardDrop && this.canMoveDown()) {
      const numRowsDropped = (this.gameState.piece.pos.row - this.gameState.ghostPiece.pos.row);
      // update score
      this.addToScore((2 * numRowsDropped));
      // update piece
      this.gameState.piece = this.gameState.ghostPiece;
      this.gameState.pieceAction = 'HARD DROP';
      this.gameState.pieceRowsDropped = numRowsDropped
      // update droppingBlockPositions
      this.droppingBlockPositions = this.getBlockPositions(this.gameState.piece);
      // update lockMode
      this.setIsLockMode(true);
      return this.gameState;
    } else if (this.gameState.pieceAction === 'HARD DROP') {
      this.gameState.pieceAction = null;
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
    return Math.pow((0.8-((level-1)*0.007)), (level-1)) * 1000;
  }

  private isGameOver(piece: Piece): boolean {
    return !this.getBlockPositions(piece).every(pos => this.isValidPos(pos));
  }

  private isLevelUp(level: number, lines: number): boolean {
    return lines >= (level * 10);
  }

  private isPerfectClear(lockedColors: Color[]): boolean {
    return lockedColors.every(color => color === null);
  }

  private getBlockPositions(piece: Piece): GridPos[] {
    const pieceData = PIECE_DATA.get(piece.type) as PieceData;

    return pieceData.positions.map(position => ({ col: piece.pos.col + position[0], row: piece.pos.row + position[1]}));
  }

  private canMoveDown(): boolean {
    return this.droppingBlockPositions.every(pos => {
      return this.isValidPos({ col: pos.col, row: pos.row - 1 });
    });
  }

  private canMoveLeft(): boolean {
    return this.droppingBlockPositions.every(pos => {
      return this.isValidPos({ col: pos.col - 1, row: pos.row });
    });
  }

  private canMoveRight(): boolean {
    return this.droppingBlockPositions.every(pos => {
      return this.isValidPos({ col: pos.col + 1, row: pos.row });
    });
  }

  private getValidPieceRotatedClockwise(piece: Piece): Piece | null {
    if (this.gameState.piece.type === 'O') return piece;
    const newPieceType = getPieceTypeForRotateClockwise(piece.type);
    const blockPositions = this.getBlockPositions({ pos: piece.pos, type: newPieceType });
    if (blockPositions.every(pos => this.isValidPos(pos))) {
      return { pos: piece.pos, type: newPieceType };
    } else {
      // check for valid wall kicks
      let newPiece = null;
      const wallKickOffsets = this.getWallKickOffsets(piece.type, newPieceType);
      for (const offset of wallKickOffsets) {
        const kickedPos = { col: piece.pos.col + offset.col, row: piece.pos.row + offset.row };
        const blockPositions = this.getBlockPositions({ pos: kickedPos, type: newPieceType });
        if (blockPositions.every(pos => this.isValidPos(pos))) {
          newPiece = { pos: kickedPos, type: newPieceType};
          break;
        }
      }
      return newPiece;
    }
  }

  private isValidPos(pos: GridPos): boolean {
    const lockedColorIndex = LockedColorUtils.gridPosToIndex(pos);
    return (pos.row >= 0 && pos.col >= 0 && pos.col < TetrisConstants.numCols && this.gameState.lockedColors[lockedColorIndex] === null);
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
    // Note: pieceRows is sorted highest to lowest
    const pieceRows = [...new Set(pieceBlockPositions.map(pos => pos.row))].sort().reverse();
    pieceRows.forEach(row => {
      if (cols.every(col => lockedColors[LockedColorUtils.gridPosToIndex({ col, row })] !== null)) {
        completedRows.push(row);
      }
    })
    // Note: returns completedRows ordered from highest to lowest
    return completedRows;
  }

  private removeCompleteRows(lockedColors: Color[], completedRows: number[]): Color[] {
    // remove completed rows from lockedColors and add empty rows to the end
    // Note: this assumes completedRows are highest to lowest
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

  private addToScore(points: number): void {
    this.gameState.score = this.gameState.score + points;
    if (this.gameState.score > this.gameState.bestScore) {
      this.gameState.bestScore = this.gameState.score;
      if (!this.gameState.isNewBestScore) {
        this.addToast(8, 'NEW BEST SCORE', 0);
      }
      this.gameState.isNewBestScore = true;
    }
  }

  private addToast(row: number, achievement: Achievement, points: number): void {
    this.gameState.toasts = [...this.gameState.toasts, { id: this.gameState.toasts.length, row, achievement, points }];
  }

  private calcCompletedRowsPoints(completedRows: number, level: number): number {
    switch(completedRows) {
      case 1: return 100 * level;
      case 2: return 300 * level;
      case 3: return 500 * level;
      case 4: return 800 * level;
      default: return 0;
    }
  }

  private calcPerfectClearPoints(completedRows: number, level: number): number {
    return (400 + (completedRows * 400)) * level;
  }

  private calcCompletedRowsAchievement(completedRows: number): Achievement {
    switch(completedRows) {
      case 1: return 'SINGLE';
      case 2: return 'DOUBLE';
      case 3: return 'TRIPLE';
      case 4: return 'TETRIS';
      default: return 'SINGLE';
    }
  }

  private getWallKickOffsets(from: PieceType, to: PieceType): GridPos[] {
    const shape = from[0];
    const fromOrientation = from[1];
    const toOrientation = to[1];

    const wallKickKey = (shape === 'I' ? shape : '') + fromOrientation + toOrientation;
    return WALL_KICK_OFFSETS.get(wallKickKey) as GridPos[];
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