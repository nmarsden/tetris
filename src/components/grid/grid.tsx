import * as THREE from 'three'
import {useMemo} from "react";
import {Line} from "@react-three/drei";

const CELLS_X = 10;
const CELLS_Y = 25;
const CELL_SIZE = 1;
const GRID_WIDTH = CELLS_X * CELL_SIZE;
const GRID_HEIGHT = CELLS_Y * CELL_SIZE;
const START_X = GRID_WIDTH * -0.5;
const START_Y = GRID_HEIGHT * -0.5;
const END_X = GRID_WIDTH * 0.5;
const END_Y = GRID_HEIGHT * 0.5;

const Grid = ({ enabled } : { enabled: boolean }) => {
  const positions: THREE.Vector3[] = useMemo(() => {
    if (!enabled) return [];

    const positions: THREE.Vector3[] = [];
    for (let x=START_X; x<END_X;) {
      for (let y=START_Y; y<END_Y;) {
        positions.push(new THREE.Vector3(x, y, 0));
        y += CELL_SIZE;
      }
      x += CELL_SIZE;
    }
    return positions;
  }, []);

  const points = useMemo(() => {
    return [
      [0,     0,      0],
      [0,     CELL_SIZE, 0],
      [CELL_SIZE, CELL_SIZE, 0],
      [CELL_SIZE, 0,      0],
      [0,     0,      0],
    ];
  }, []);

  return (
    <>
      {positions.map((position, index) => {
        const key = `${index}`;
        return (
          // @ts-ignore
          <Line key={key} position={position} points={points} color={"grey"} lineWidth={2} dashed={false} />
        )
      })}
    </>
  );
}

export { Grid }
