/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, Loader, OrbitControls, PerspectiveCamera} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {GameEngine, GameEngineMethod, GameMode, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block, BlockMode} from "./components/block/block.tsx";
import {ActionField, useKeyboardControls} from "./hooks/useKeyboardControls.ts";
import {Playfield} from "./components/playfield/playfield.tsx";
import {Countdown} from "./components/countdown/countdown.tsx";
import {Toasts} from "./components/toast/toast.tsx";
import {Touch} from "./components/touch/touch.tsx";
import {Sound} from "./sound.ts";
import {CAMERA_POSITION, CameraAnimation, CameraAnimationRef} from './components/cameraAnimation/cameraAnimation.tsx';
import {Sidebar} from './components/sidebar/sidebar.tsx';
import AppProvider, {AppContext} from "./components/context/AppContext.tsx";
import {Background} from "./components/background/background.tsx";
import {Toolbar, ToolbarMode} from "./components/toolbar/toolbar.tsx";
import {Welcome, WelcomeMode} from "./components/welcome/welcome.tsx";
import {useControls, Leva} from 'leva'
import {Perf} from 'r3f-perf'
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const isDebug = window.location.hash === '#debug';

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
  return completedRows.length === 0 && ['PLAYING', 'PAUSED', 'GAME OVER'].includes(mode);
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

// TODO about button
//      - shows enter screen with TETRIS and welcome message
//      - built with: R3F, HowlerJS, React Spring,

// TODO show the game icon (t-block) in the sidebar

// TODO optimize performance
//   * Resources:
//     - https://threejs-journey.com/lessons/performance-tips#
//     - https://r3f.docs.pmnd.rs/advanced/pitfalls
//   - add leva
//      * Resource: https://github.com/pmndrs/leva
//   - add r3f-perf
//      * Resource: https://github.com/utsuboco/r3f-perf
//   - add #debug
//      * Resource: https://threejs-journey.com/lessons/code-structuring-for-bigger-projects#debug
//      - show leva
//      - show r3f-perf
//   - reduce polygons
//      - re-use geometries
//        * Resource: https://threejs-journey.com/lessons/create-a-game-with-r3f#geometries
//      - re-use materials
//   - do not mount/unmount things
//     - create all blocks at the start & use visible to hide non-rendered blocks
//   - optimise images
//   - stop the game when browser tab is not open
//      * Resource: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

// Performance observations
// - number of geometries and draw calls keep rising as more blocks are played
// - a new game does not reset the number of geometries
// - a lot of triangles
//   - 3D text for title
//   - buttons
//   - blocks
// - enabling all the effects reduces the framerate by about 40-50%
// - there is a dip in framerate every time a block moves down

type StepMode = 'INIT' | 'START' | 'NEXT' | 'RESUME';

const GAME_ENGINE_METHOD = new Map<StepMode, GameEngineMethod>([
  ['INIT', () => gameEngine.init()],
  ['START', () => gameEngine.start()],
  ['NEXT', () => gameEngine.step()],
  ['RESUME', () => gameEngine.resume()],
]);

const App = () => {
  const { perf, ghostPiece } = useControls({
    perf: true,
    ghostPiece: true
  });
  const {appState, setBestScores} = useContext(AppContext)!;
  const initialState = useMemo(() => gameEngine.initialState(appState.bestScores), []);
  const [gameState, setGameState] = useState(initialState);
  const [showCountdown, setShowCountdown] = useState(false);
  const [action, setActionField] = useKeyboardControls();
  const cameraAnimation = useRef<CameraAnimationRef>(null);
  const [welcomeMode, setWelcomeMode] = useState<WelcomeMode>('OPEN');
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('CLOSED');

  const step = useCallback((mode: StepMode = 'NEXT') => {
    const gameState = (GAME_ENGINE_METHOD.get(mode) as GameEngineMethod)();
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

  const onWelcomeEnter = useCallback(() => {
    setWelcomeMode('CLOSED');
    setToolbarMode('HOME');
    Sound.getInstance().setMusicVolume(appState.musicVolume);
    Sound.getInstance().setSoundFXVolume(appState.soundFXVolume);
  }, [appState]);

  const onPlay = useCallback(() => {
    setToolbarMode('CLOSED');
    if (gameState.mode !== 'PAUSED') {
      step('INIT');
    }
    cameraAnimation.current?.setCamBounds('PLAYFIELD');
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

    if (gameState.pieceAction === 'BLOCKED LEFT') {
      cameraAnimation.current?.animate('BUMP_RIGHT');
    }
    if (gameState.pieceAction === 'BLOCKED RIGHT') {
      cameraAnimation.current?.animate('BUMP_LEFT');
    }
    if (gameState.pieceAction === 'HARD DROP' || gameState.pieceAction === 'BLOCKED DOWN') {
      cameraAnimation.current?.animate('BUMP_UP');
    }

    if (gameState.mode === 'PLAYING' && gameState.pieceAction !== null && gameState.pieceAction !== 'LOCK') {
      Sound.getInstance().playSoundFX(gameState.pieceAction);
    }
    if (gameState.pieceAction === 'HARD DROP') {
      // give time to render blurred piece before next step
      setTimeout(() => { step(); }, 50);
    }

    if (!gameState.previousIsLockMode && gameState.isLockMode) {
      Sound.getInstance().playSoundFX('LOCK');
      // when lock mode is triggered due to an action, ensure it ends in 500ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { step(); }, 500);
    }
  }, [action, step]);

  useEffect(() => {
    if (gameState.level === 0) return;
    // Set music rate
    Sound.getInstance().stopMusic();
    Sound.getInstance().setMusicRate(0.5 + (gameState.level * 0.1));
    Sound.getInstance().playMusic();
  }, [gameState.level]);

  useEffect(() => {
    setBestScores(gameState.bestScores);
  }, [gameState.bestScores, setBestScores]);

  useEffect(() => {
    switch (gameState.mode) {
      case 'PAUSED':
        cameraAnimation.current?.setCamBounds('OVERLAY');
        setToolbarMode('PAUSED');
        break;
      case 'GAME OVER':
        cameraAnimation.current?.setCamBounds('OVERLAY');
        setToolbarMode('GAME_OVER');
        break;
    }
  }, [gameState.mode]);

  return (
    <>
      <Leva hidden={!isDebug} />
      <Canvas
        onContextMenu={(e)=> e.preventDefault()}
      >
        {perf && isDebug ? <Perf position={'top-left'} /> : null}
        <Suspense>
            <PerspectiveCamera makeDefault={true} position={CAMERA_POSITION} fov={70} >
              {appState.background ? <Background muted={true} /> : null}
            </PerspectiveCamera>
            <CameraAnimation ref={cameraAnimation}/>
          <Playfield isShown={welcomeMode === 'CLOSED'} enableGrid={false}/>
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
              {isShowPiece(gameState.completedRows, gameState.mode) && ghostPiece ? <Piece gridPos={gameState.ghostPiece.pos} type={gameState.ghostPiece.type} isGhost={true} /> : null}
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
            {/* Sidebar */}
            <Sidebar
              isShown={welcomeMode === 'CLOSED'}
              score={gameState.score}
              bestScore={gameState.bestScore}
              level={gameState.level}
              lines={gameState.lines}
              nextPieceType={gameState.nextPieceType}
              isPauseButtonShown={gameState.mode === 'PLAYING'}
              onPause={onPause}
              isNewBestScore={gameState.mode === 'GAME OVER' && gameState.score === gameState.bestScore}
            />
            {/* Welcome */}
            <Welcome mode={welcomeMode} onEnter={onWelcomeEnter} />
            {/* Toolbar */}
            <Toolbar mode={toolbarMode} score={gameState.score} onPlay={onPlay} />
            {/* Countdown */}
            {gameState.mode !== 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneStart} /> : null}
            {gameState.mode === 'PAUSED' && showCountdown ? <Countdown onCountdownDone={onCountdownDoneResume} /> : null}
          {/* Touch */}
          {gameState.mode === 'PLAYING' ? <Touch onActionField={onTouchActionField}/> : null}
          { /* @ts-ignore */ }
          <Environment files={suspend(warehouse)}/>
          <OrbitControls
            enabled={false}
            makeDefault={true}
            // minAzimuthAngle={0}
            // maxAzimuthAngle={0}
            // minPolarAngle={Math.PI * 0.4}
            // maxPolarAngle={Math.PI * 0.6}
            autoRotate={false}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
      <Loader containerStyles={{ background: '#000000' }}/>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
)
