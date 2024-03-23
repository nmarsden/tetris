/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Bounds, Environment, OrbitControls, OrthographicCamera} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {useCallback, useEffect, useMemo, useState} from "react";
import {GameEngine, GameMode, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block, BlockMode} from "./components/block/block.tsx";
import {ActionField, useKeyboardControls} from "./hooks/useKeyboardControls.ts";
import {Playfield} from "./components/playfield/playfield.tsx";
import {TetrisConstants} from "./tetrisConstants.ts";
import {Info} from "./components/info/info.tsx";
import {GameOver} from "./components/gameOver/gameOver.tsx";
import {Home} from "./components/home/home.tsx";
import {Background} from "./components/background/background.tsx";
import {Countdown} from "./components/countdown/countdown.tsx";
import {Paused} from "./components/paused/paused.tsx";
import {Toasts} from "./components/toast/toast.tsx";
import {Touch} from "./components/touch/touch.tsx";
import {Sound} from "./sound.ts";
import {PauseButton} from "./components/pauseButton/pauseButton.tsx";
import {Help} from './components/help/help.tsx';
import {Options} from "./components/options/options.tsx";
import useLocalStorage, { Store } from "./hooks/useLocalStorage.ts";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();

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

let timeoutId: ReturnType<typeof setTimeout>;

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

// TODO show tetris favicon

// TODO fix toast animation - should fade out

// TODO fix intelliJ CPU performance problem
//   - Try enabling the new TypeScript Engine...
//     - Command + Shift + A
//     - search for "Registry"
//     - type "typescript.compiler.evaluation"
//     - check to enable
//   - see: https://youtrack.jetbrains.com/issue/WEB-57701/High-CPU-usage-on-TS-conditional-types
//   - see: https://blog.jetbrains.com/webstorm/2023/12/try-the-future-typescript-engine-with-the-webstorm-next-program/#update

type StepMode = 'START' | 'NEXT' | 'RESUME';


const INITIAL_STORE: Store = {
  bestScore: 0,
  musicVolume: 1,
  soundFXVolume: 1
};

const App = () => {
  const [store, setStore] = useLocalStorage('tetris', INITIAL_STORE);
  const [gameState, setGameState] = useState(gameEngine.initialState(store.bestScore));
  const [showCountdown, setShowCountdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [action, setActionField] = useKeyboardControls();

  const isShowOptionsOrHelp = useMemo(() => {
    return showOptions || showHelp;
  }, [showOptions, showHelp]);

  const step = useCallback((mode: StepMode = 'NEXT') => {
    const gameState = (mode === 'START') ? gameEngine.start() : (mode === 'RESUME') ? gameEngine.resume() : gameEngine.step();
    setGameState({...gameState});

    // check for game over
    if (gameState.mode === 'GAME OVER' || gameState.mode === 'PAUSED') {
      return;
    }

    if (gameState.pieceAction === 'LOCK') {
      Sound.getInstance().playSoundFX(gameState.pieceAction);
    }

    // when lock mode is triggered, ensure it ends in 500ms
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { step(); }, (gameState.isLockMode || gameState.completedRows.length > 0) ? 500 : gameEngine.timePerRowInMSecs);
  }, []);

  const onOptions = useCallback(() => {
    setShowOptions(true);
  }, []);

  const onOptionsClose = useCallback(() => {
    setShowOptions(false);
    setStore({...store, musicVolume: Sound.getInstance().musicVolume(), soundFXVolume: Sound.getInstance().soundFXVolume()});
  }, []);

  const onHelp = useCallback(() => {
    setShowHelp(true);
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
    Sound.getInstance().playMusic();
    step('START');
  }, [step]);

  const onCountdownDoneResume = useCallback(() => {
    setShowCountdown(false);
    // resume game
    Sound.getInstance().playMusic();
    step('RESUME');
  }, [step]);

  const onPause = useCallback(() => {
    setActionField('pause', true);
    setTimeout(() => setActionField('pause', false), 50);
  }, []);

  const onTouchActionField = useCallback((actionField: ActionField) => {
    setActionField(actionField, true);
    setTimeout(() => setActionField(actionField, false), 50);
  }, []);

  useEffect(() => {
    const gameState = gameEngine.handleAction(action);
    setGameState({...gameState});

    if (gameState.pieceAction !== null && gameState.pieceAction !== 'LOCK') {
      Sound.getInstance().playSoundFX(gameState.pieceAction);
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
      Sound.getInstance().playSoundFX('LOCK');
      // when lock mode is triggered due to an action, ensure it ends in 500ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { step(); }, 500);
    }
  }, [action, step]);

  useEffect(() => {
    // Set music rate
    Sound.getInstance().stopMusic();
    Sound.getInstance().setMusicRate(0.5 + (gameState.level * 0.1));
    Sound.getInstance().playMusic();
  }, [gameState.level]);

  useEffect(() => {
    if (gameState.bestScore === 0) return;
    setStore({...store, bestScore: gameState.bestScore});
  }, [gameState.bestScore]);

  useEffect(() => {
    Sound.getInstance().setMusicVolume(store.musicVolume);
    Sound.getInstance().setSoundFXVolume(store.soundFXVolume);
  }, []);

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
        <Info gridPos={{col: TetrisConstants.scoreCol, row: TetrisConstants.scoreRow}} label={'SCORE'} value={gameState.score} bestValue={gameState.bestScore}/>
        <Info gridPos={{col: TetrisConstants.levelCol, row: TetrisConstants.levelRow}} label={'LEVEL'} value={gameState.level}/>
        <Info gridPos={{col: TetrisConstants.linesCol, row: TetrisConstants.linesRow}} label={'LINES'} value={gameState.lines}/>
        {isShowPiece(gameState.completedRows, gameState.mode) ? <Info gridPos={{col: TetrisConstants.nextCol,  row: TetrisConstants.nextRow }} label={'NEXT'}  value={gameState.nextPieceType}/> : null}
        {gameState.mode === 'PLAYING' ? <PauseButton gridPos={{col: TetrisConstants.pauseCol, row: TetrisConstants.pauseRow}} onPause={onPause}/> : null}
        {/* Overlays */}
        {gameState.mode === 'HOME' && !showCountdown ? <Home onStart={onStartOrRetry} onOptions={onOptions} onHelp={onHelp} enableButtons={!isShowOptionsOrHelp} /> : null}
        {gameState.mode === 'PAUSED' && !showCountdown ? <Paused onResume={onResume} onOptions={onOptions} onHelp={onHelp} enableButtons={!isShowOptionsOrHelp} /> : null}
        {gameState.mode === 'GAME OVER' && !showCountdown ? <GameOver newBestScore={gameState.isNewBestScore ? gameState.bestScore : undefined} onRetry={onStartOrRetry} onOptions={onOptions} onHelp={onHelp} enableButtons={!isShowOptionsOrHelp} /> : null}
        {gameState.mode !== 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneStart} /> : null}
        {gameState.mode === 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneResume} /> : null}
        {showOptions ? <Options onClose={onOptionsClose}/> : null}
        {showHelp ? <Help onClose={() => setShowHelp(false)}/> : null}
      </Bounds>
      {/* Touch */}
      {gameState.mode === 'PLAYING' ? <Touch onActionField={onTouchActionField}/> : null}
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
