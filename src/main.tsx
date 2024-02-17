import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
import {Grid} from './components/grid/grid';
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const App = () => {
  return (
    <Canvas camera={{
      position: [0, 0, -20],
      fov: 75,
    }}>
      <ambientLight />
      <pointLight position={[0, 1, -3]} />
      <Grid enabled={true}/>
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
