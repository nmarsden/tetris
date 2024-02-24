/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Bounds, Environment, OrbitControls, OrthographicCamera} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {useCallback, useEffect, useState} from "react";
import {GameEngine, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block, BlockMode} from "./components/block/block.tsx";
import {useKeyboardControls} from "./hooks/useKeyboardControls.ts";
import {Playfield} from "./components/playfield/playfield.tsx";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
const initialGameState = gameEngine.start();

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

let timeoutId: number;

const App = () => {
  const [gameState, setGameState] = useState(initialGameState);
  const action = useKeyboardControls();

  const step = useCallback(() => {
    const gameState = gameEngine.step();
    setGameState({...gameState});

    // when lock mode is triggered, ensure it ends in 500ms
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { step(); }, (gameState.isLockMode || gameState.completedRows.length > 0) ? 500 : gameEngine.timePerRowInMSecs);
  }, []);

  useEffect(() => {
    // auto-start game
    timeoutId = setTimeout(() => { step(); }, 2000);
  }, [step]);

  useEffect(() => {
    const gameState = gameEngine.handleAction(action);
    setGameState({...gameState});

    if (!gameState.previousIsLockMode && gameState.isLockMode) {
      // when lock mode is triggered due to an action, ensure it ends in 500ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { step(); }, 500);
    }
  }, [action, step]);

  return (
    <Canvas>
      <OrthographicCamera makeDefault={true} position={[0, 0, 800]} />
      <Bounds fit clip observe margin={1.2} maxDuration={0.1}>
        <Playfield enableGrid={false}/>
        {gameState.completedRows.length === 0 ? <Piece gridPos={gameState.piece.pos} type={gameState.piece.type} isLock={gameState.isLockMode} /> : null}
        {gameState.completedRows.length === 0 ? <Piece gridPos={gameState.ghostPiece.pos} type={gameState.ghostPiece.type} isGhost={true} /> : null}
        {gameState.lockedColors.map((lockedColor, index) => {
          const gridPos = LockedColorUtils.indexToGridPos(index);
          const blockMode = rowBlockMode(gridPos.row, gameState.completedRows);
          return lockedColor === null ? null : <Block key={`${index}`} position={LockedColorUtils.indexToScreen(index)} color={lockedColor} mode={blockMode}/>
        })
        }
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
