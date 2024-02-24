import * as THREE from 'three'
import {Color} from "three";

const NUM_COLS = 10;
const NUM_ROWS = 20;
const CELL_SIZE = 1;
const GRID_WIDTH = NUM_COLS * CELL_SIZE;
const GRID_HEIGHT = NUM_ROWS * CELL_SIZE;
const GRID_ORIGIN: THREE.Vector3 = new THREE.Vector3(GRID_WIDTH * -0.5, GRID_HEIGHT * -0.5, 0);

const INFO_COL = NUM_COLS + 2.5;
const INFO_ROW = NUM_ROWS - 0.5;

const CYAN = new Color(0x00B7B4);
const YELLOW = new Color(0xF8F200);
const PURPLE = new Color(0x7E06F8);
const GREEN =  new Color(0x18B543);
const RED = new Color(0xE42129);
const BLUE = new Color(0x02A0E3);
const ORANGE = new Color(0xFE8129);
const WHITE = new Color('white');

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
    white: WHITE
  },
  scoreCol: INFO_COL,
  scoreRow: INFO_ROW,
  levelCol: INFO_COL,
  levelRow: INFO_ROW - 3,
  linesCol: INFO_COL,
  linesRow: INFO_ROW - 6,
  nextCol: INFO_COL,
  nextRow: INFO_ROW - 9
};
