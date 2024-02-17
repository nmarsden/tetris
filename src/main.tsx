import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
import * as THREE from 'three'
import {Grid} from './components/grid/grid';
import {Block} from "./components/block/block";
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const App = () => {
  return (
    <Canvas camera={{
      position: [0, 0, -20],
      fov: 75,
    }}>
      <Grid enabled={true}/>
      <Block gridPos={{ col: 0, row: 0}} color={new THREE.Color("red")}/>
      <Block gridPos={{ col: 9, row: 0}} color={new THREE.Color("yellow")}/>
      <Block gridPos={{ col: 0, row: 24}} color={new THREE.Color("cyan")}/>
      <Block gridPos={{ col: 9, row: 24}} color={new THREE.Color("green")}/>
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
