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
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
const initialGameState = gameEngine.start();

const App = () => {
  const [pieces, setPieces] = useState({ piece: initialGameState.piece, ghostPiece: initialGameState.ghostPiece });
  const [lockedColors] = useState(initialGameState.lockedColors);
  const movement = useKeyboardControls();

  const step = useCallback(() => {
    const {piece, ghostPiece} = gameEngine.step();

    setPieces({
      piece: { pos: {...piece.pos}, type: piece.type },
      ghostPiece: { pos: {...ghostPiece.pos}, type: ghostPiece.type }
    });

    setTimeout(() => { step(); }, gameEngine.timePerRowInMSecs);
  }, []);

  useEffect(() => {
    setTimeout(() => { step(); }, gameEngine.timePerRowInMSecs);
  }, [step]);

  useEffect(() => {
    const {piece, ghostPiece } = gameEngine.handleMovement(movement);
    setPieces({
      piece: { pos: {...piece.pos}, type: piece.type },
      ghostPiece: { pos: {...ghostPiece.pos}, type: ghostPiece.type },
  });
  }, [movement]);

  return (
    <Canvas>
      <OrthographicCamera makeDefault={true} position={[0, 0, 800]} />
      <Bounds fit clip observe margin={1.2} maxDuration={0.1}>
        <Grid enabled={true}/>
        <Piece gridPos={pieces.piece.pos} type={pieces.piece.type} />
        <Piece gridPos={pieces.ghostPiece.pos} type={pieces.ghostPiece.type} isGhost={true} />
        { lockedColors.map((lockedColor, index) => {
          return lockedColor === null ? null : <Block key={`${index}`} position={LockedColorUtils.indexToScreen(index)} color={lockedColor}/>
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
