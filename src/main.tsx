import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Cube} from "./cube/cube";
import {Environment, OrbitControls} from "@react-three/drei";
import {suspend} from 'suspend-react'
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const App = () => {
  return (
    <Canvas camera={{
      position: [5, 5, -5],
      fov: 75,
    }}>
      <ambientLight />
      <pointLight position={[0, 1, -3]} />
      <Cube />
      { /* @ts-ignore */ }
      <Environment files={suspend(warehouse)}/>
      <OrbitControls
        makeDefault={true}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
        autoRotateSpeed={0.25}
        minDistance={3}
        maxDistance={10}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
      />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
