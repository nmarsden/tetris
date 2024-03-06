/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Bounds, Environment, OrbitControls, OrthographicCamera} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {useCallback, useEffect, useState} from "react";
import {GameEngine, GameMode, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block, BlockMode} from "./components/block/block.tsx";
import {useKeyboardControls} from "./hooks/useKeyboardControls.ts";
import {Playfield} from "./components/playfield/playfield.tsx";
import {TetrisConstants} from "./tetrisConstants.ts";
import {Info} from "./components/info/info.tsx";
import {GameOver} from "./components/gameOver/gameOver.tsx";
import {Home} from "./components/home/home.tsx";
import {Background} from "./components/background/background.tsx";
import {Countdown} from "./components/countdown/countdown.tsx";
import {Paused} from "./components/paused/paused.tsx";
import {Toasts} from "./components/toast/toast.tsx";
import {Sound} from "./sound.ts";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
const initialGameState = gameEngine.initialState();

// Load audio
Sound.getInstance();

const rowBlockMode = (row: number, completedRows: number[]): BlockMode => {
  if (completedRows.length === 0) {
    return 'STANDARD';
  }
  if (completedRows.includes(row)) {
    return 'CLEAR';
  }
  const shift = completedRows.filter(r => r < row).length;
  switch(shift) {
    case 1: return 'SHIFT_ONE';
    case 2: return 'SHIFT_TWO';
    case 3: return 'SHIFT_THREE';
    case 4: return 'SHIFT_FOUR';
    default: return 'STANDARD';
  }
};

const isShowPiece = (completedRows: number[], mode: GameMode): boolean => {
  return completedRows.length === 0 && mode !== 'HOME';
};

let timeoutId: number;

// TODO reward Perfect Clear Bonus: completely clearing the playfield
//  Action	                            Points
//  Back-to-back Tetris perfect clear	  3200 × level

// TODO reward T-spin move
//   Lines	 Mini T-spin   T-spin
//   0	     100	         400
//   1	     200	         800
//   2	     400	         1200
//   3	     N/A	         1600

// TODO reward Back-2-Back (B2B) line clears: any combination of two or more "difficult" line clears without an "easy" line clear between them.  Reward is x1.5 normal points
//   Clear Type	     "difficult"
//   Single	         No
//   Double	         No
//   Triple	         No
//   Tetris	         Yes
//   T-Spin Single	 Yes
//   T-Spin Double	 Yes
//   T-Spin Triple	 Yes

// TODO mobile controls

type StepMode = 'START' | 'NEXT' | 'RESUME';

const App = () => {
  const [gameState, setGameState] = useState(initialGameState);
  const [showCountdown, setShowCountdown] = useState(false);
  const action = useKeyboardControls();

  const step = useCallback((mode: StepMode = 'NEXT') => {
    const gameState = (mode === 'START') ? gameEngine.start() : (mode === 'RESUME') ? gameEngine.resume() : gameEngine.step();
    setGameState({...gameState});

    if (gameState.pieceAction === 'LOCK') {
      Sound.getInstance().play(gameState.pieceAction);
    }

    // check for game over
    if (gameState.mode === 'GAME OVER') {
      return;
    }
    // when lock mode is triggered, ensure it ends in 500ms
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { step(); }, (gameState.isLockMode || gameState.completedRows.length > 0) ? 500 : gameEngine.timePerRowInMSecs);
  }, []);

  const onStartOrRetry = useCallback(() => {
    setShowCountdown(true);
  }, []);

  const onResume = useCallback(() => {
    setShowCountdown(true);
  }, []);

  const onCountdownDoneStart = useCallback(() => {
    setShowCountdown(false);
    // start game
    step('START');
  }, [step]);

  const onCountdownDoneResume = useCallback(() => {
    setShowCountdown(false);
    // resume game
    step('RESUME');
  }, [step]);

  useEffect(() => {
    const gameState = gameEngine.handleAction(action);
    setGameState({...gameState});

    if (gameState.pieceAction !== null && gameState.pieceAction !== 'LOCK') {
      Sound.getInstance().play(gameState.pieceAction);
    }
    if (gameState.pieceAction === 'HARD DROP') {
      // give time to render blurred piece before next step
      setTimeout(() => { step(); }, 50);
    }

    if (gameState.mode === 'START') {
      step();
      return;
    }
    if (!gameState.previousIsLockMode && gameState.isLockMode) {
      Sound.getInstance().play('LOCK');
      // when lock mode is triggered due to an action, ensure it ends in 500ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { step(); }, 500);
    }
  }, [action, step]);

  return (
    <Canvas>
      <OrthographicCamera makeDefault={true} position={[0, 0, 800]} />
      <Bounds fit clip observe margin={1} maxDuration={0.1}>
        <Background />
        <Playfield enableGrid={false}/>
        {gameState.pieceAction === 'HARD DROP' ?
        <>
          {/* Active Piece */}
          <Piece gridPos={gameState.piece.pos} type={gameState.piece.type} rowsDropped={gameState.pieceRowsDropped}/>
        </>
        :
        <>
          {/* Active Piece */}
          {isShowPiece(gameState.completedRows, gameState.mode) ? <Piece gridPos={gameState.piece.pos} type={gameState.piece.type} isLock={gameState.isLockMode} /> : null}
          {/* Ghost Piece */}
          {isShowPiece(gameState.completedRows, gameState.mode) ? <Piece gridPos={gameState.ghostPiece.pos} type={gameState.ghostPiece.type} isGhost={true} /> : null}
        </>}
        {/* Stack */}
        {gameState.lockedColors.map((lockedColor, index) => {
          const gridPos = LockedColorUtils.indexToGridPos(index);
          const blockMode = rowBlockMode(gridPos.row, gameState.completedRows);
          return lockedColor === null ? null : <Block key={`${index}`} position={LockedColorUtils.indexToScreen(index)} color={lockedColor} mode={blockMode}/>
        })
        }
        {/* Toasts */}
        <Toasts toasts={gameState.toasts} />
        {/* Info */}
        <Info gridPos={{col: TetrisConstants.scoreCol, row: TetrisConstants.scoreRow}} label={'SCORE'} value={gameState.score}/>
        <Info gridPos={{col: TetrisConstants.levelCol, row: TetrisConstants.levelRow}} label={'LEVEL'} value={gameState.level}/>
        <Info gridPos={{col: TetrisConstants.linesCol, row: TetrisConstants.linesRow}} label={'LINES'} value={gameState.lines}/>
        {isShowPiece(gameState.completedRows, gameState.mode) ? <Info gridPos={{col: TetrisConstants.nextCol,  row: TetrisConstants.nextRow }} label={'NEXT'}  value={gameState.nextPieceType}/> : null}
        {gameState.mode === 'HOME' && !showCountdown ? <Home onStart={onStartOrRetry}/> : null}
        {gameState.mode === 'PAUSED' && !showCountdown ? <Paused onResume={onResume}/> : null}
        {gameState.mode === 'GAME OVER' && !showCountdown ? <GameOver onRetry={onStartOrRetry} /> : null}
        {gameState.mode !== 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneStart} /> : null}
        {gameState.mode === 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneResume} /> : null}
      </Bounds>
      { /* @ts-ignore */ }
      <Environment files={suspend(warehouse)}/>
      <OrbitControls
        enabled={false}
        makeDefault={true}
        minAzimuthAngle={0}
        maxAzimuthAngle={0}
        minPolarAngle={Math.PI * 0.4}
        maxPolarAngle={Math.PI * 0.6}
        autoRotate={false}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
      />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
