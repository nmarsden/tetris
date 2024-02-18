import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Grid} from './components/grid/grid';
import {Piece} from "./components/piece/piece.tsx";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const App = () => {
  return (
    <Canvas camera={{
      position: [0, 0, -20],
      fov: 75,
    }}>
      <Grid enabled={true}/>
      <Piece gridPos={{ col: 4, row: 20}} type="I"/>
      <Piece gridPos={{ col: 4, row: 19}} type="O"/>
      <Piece gridPos={{ col: 4, row: 17}} type="T"/>
      <Piece gridPos={{ col: 4, row: 15}} type="S"/>
      <Piece gridPos={{ col: 4, row: 13}} type="Z"/>
      <Piece gridPos={{ col: 4, row: 11}} type="J"/>
      <Piece gridPos={{ col: 4, row: 9}} type="L"/>
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
