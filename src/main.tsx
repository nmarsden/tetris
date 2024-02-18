import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Grid, GridPos} from './components/grid/grid';
import {useCallback, useEffect, useState} from "react";
import {GameEngine, START_POS} from "./gameEngine.ts";
import {Piece} from "./components/piece/piece.tsx";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const gameEngine = new GameEngine();
gameEngine.start();

const App = () => {
  const [gridPos, setGridPos] = useState<GridPos>(START_POS);

  const movePieceDown = useCallback(() => {
    if (gameEngine.moveDown()) {
      setGridPos({col: gridPos.col, row: gridPos.row - 1});
    }
  }, [gridPos]);

  useEffect(() => {
    setTimeout(() => { movePieceDown(); }, gameEngine.timePerRowInMSecs);
  })

  return (
    <Canvas camera={{
      position: [0, 0, -20],
      fov: 75,
    }}>
      <Grid enabled={true}/>
      <Piece gridPos={gridPos} type={gameEngine.pieceType} />
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
