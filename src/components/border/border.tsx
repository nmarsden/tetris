import {Vector3} from "three";
import {Line} from "@react-three/drei";

const Border = ({ position, width, height } : { position: Vector3, width: number, height: number }) => {
  return (
    <>
      <Line position={position} points={[[0, 0          ], [0, -height    ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[0, -height    ], [width, -height]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[width, -height], [width, 0      ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={position} points={[[width, 0      ], [0, 0          ]]} color={"grey"} lineWidth={2} dashed={false} />
    </>
  )
}

export { Border }