import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Grid} from './components/grid/grid';
import {useCallback, useEffect, useState} from "react";
import {GameEngine, LockedColorUtils} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
import {Block} from "./components/block/block.tsx";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
const initialGameState = gameEngine.start();

const App = () => {
  const [piece, setPiece] = useState({ pos: initialGameState.piece.pos, type: initialGameState.piece.type });
  const [lockedColors, setLockedColors] = useState(initialGameState.lockedColors);

  const step = useCallback(() => {
    const {piece} = gameEngine.step();

    setPiece({ pos: {...piece.pos}, type: piece.type });
  }, []);

  useEffect(() => {
    setTimeout(() => { step(); }, gameEngine.timePerRowInMSecs);
  })

  return (
    <Canvas camera={{
      position: [0, 0, -20],
      fov: 75,
    }}>
      <Grid enabled={true}/>
      <Piece gridPos={piece.pos} type={piece.type} />
      { lockedColors.map((lockedColor, index) => {
          const position: [number, number, number] = [0, 0, 0];
          if (lockedColor) {
            const pos = LockedColorUtils.indexToScreen(index)
            position[0] = pos.x;
            position[1] = pos.y;
            position[2] = pos.z;
          }
          return lockedColor === null ? null : <Block key={`${index}`} position={position} color={lockedColor}/>
        })
      }
      { /* @ts-ignore */ }
      <Environment files={suspend(warehouse)}/>
      <OrbitControls
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
