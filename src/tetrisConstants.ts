import * as THREE from 'three'
import {Color} from "three";

const NUM_COLS = 10;
const NUM_ROWS = 20;
const CELL_SIZE = 1;
const GRID_WIDTH = NUM_COLS * CELL_SIZE;
const GRID_HEIGHT = NUM_ROWS * CELL_SIZE;
const GRID_ORIGIN: THREE.Vector3 = new THREE.Vector3(GRID_WIDTH * -0.5, GRID_HEIGHT * -0.5, 0);

const INFO_LEFT_PADDING_CELLS = 0;
const INFO_WIDTH_CELLS = 4.5;

const GAME_WIDTH_CELLS = NUM_COLS + INFO_LEFT_PADDING_CELLS + (INFO_WIDTH_CELLS) + 2;
const GAME_HEIGHT_CELLS = NUM_ROWS + 2;

const SIDEBAR_COL = NUM_COLS + INFO_LEFT_PADDING_CELLS + (INFO_WIDTH_CELLS * 0.5 * 0.5);
const INFO_ROW = NUM_ROWS - 2.2;

const CYAN = new Color(0x00B7B4);
const YELLOW = new Color(0xF8F200);
const PURPLE = new Color(0x7E06F8);
const GREEN =  new Color(0x18B543);
const RED = new Color(0xE42129);
const BLUE = new Color(0x02A0E3);
const ORANGE = new Color(0xFE8129);
const WHITE = new Color(0xFFFFFF);
const BLACK = new Color(0x000000);
const GREY = new Color(0xBBBBBB);

export const TetrisConstants = {
  numCols: NUM_COLS,
  numRows: NUM_ROWS,
  cellSize: CELL_SIZE,
  gridWidth: NUM_COLS * CELL_SIZE,
  gridHeight: NUM_ROWS * CELL_SIZE,
  gridOrigin: GRID_ORIGIN,
  color: {
    cyan: CYAN,
    yellow: YELLOW,
    purple: PURPLE,
    green: GREEN,
    red: RED,
    blue: BLUE,
    orange: ORANGE,
    white: WHITE,
    black: BLACK,
    grey: GREY
  },
  infoWidth: INFO_WIDTH_CELLS * CELL_SIZE,
  sideBarCol: SIDEBAR_COL,
  scoreRow: INFO_ROW,
  levelRow: INFO_ROW - 3.75,
  linesRow: INFO_ROW - 6.75,
  nextRow: INFO_ROW - 9.75,
  pauseRow: INFO_ROW - 14.75,
  center: { col: GAME_WIDTH_CELLS * 0.5, row: GAME_HEIGHT_CELLS * 0.5 },
  gameWidth: GAME_WIDTH_CELLS * CELL_SIZE,
  gameHeight: GAME_HEIGHT_CELLS * CELL_SIZE,
  z: { /* Note: all z values (main + offset) are less than 0, as uikit components have z equal to 0 */
    main: -2,
    backgroundOffset: -1,
    overlay1Offset: 1.1, // countdown & toast
    overlay2Offset: 1.3, // overlay & touch
    overlay3Offset: 1.4, // gameOver, home, & paused
    overlay4Offset: 2    // help & options
  }
};
