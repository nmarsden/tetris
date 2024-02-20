/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Bounds, Environment, OrbitControls, OrthographicCamera} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Grid} from './components/grid/grid';
import {useCallback, useEffect, useState} from "react";
import {GameEngine, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block} from "./components/block/block.tsx";
import {useKeyboardControls} from "./hooks/useKeyboardControls.ts";
import {TetrisConstants} from "./tetrisConstants.ts";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
const initialGameState = gameEngine.start();

const App = () => {
  const [gameState, setGameState] = useState(initialGameState);
  const movement = useKeyboardControls();

  const step = useCallback(() => {
    const gameState = gameEngine.step();
    setGameState({...gameState});

    setTimeout(() => { step(); }, gameEngine.timePerRowInMSecs);
  }, []);

  useEffect(() => {
    // auto-start game
    setTimeout(() => { step(); }, 2000);
  }, [step]);

  useEffect(() => {
    const gameState = gameEngine.handleMovement(movement);
    setGameState({...gameState});
  }, [movement]);

  return (
    <Canvas>
      <OrthographicCamera makeDefault={true} position={[0, 0, 800]} />
      <Bounds fit clip observe margin={1.2} maxDuration={0.1}>
        <Grid enabled={true}/>
        <Piece gridPos={gameState.piece.pos} type={gameState.piece.type} />
        <Piece gridPos={gameState.ghostPiece.pos} type={gameState.ghostPiece.type} isGhost={true} />
        {gameState.lockedColors.map((lockedColor, index) => {
          const gridPos = LockedColorUtils.indexToGridPos(index);
          const color = (gameState.completedRows.includes(gridPos.row)) ? TetrisConstants.color.white : lockedColor;
          return lockedColor === null ? null : <Block key={`${index}`} position={LockedColorUtils.indexToScreen(index)} color={color}/>
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
