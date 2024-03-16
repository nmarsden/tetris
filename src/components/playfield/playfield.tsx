/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three'
import {useMemo} from "react";
import {Line} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";

export type GridPos = {
  col: number;
  row: number;
};

class GridUtils {
  static gridPosToScreen(gridPos: GridPos): THREE.Vector3  {
    return new THREE.Vector3(
      TetrisConstants.gridOrigin.x + (gridPos.col * TetrisConstants.cellSize),
      TetrisConstants.gridOrigin.y + (gridPos.row * TetrisConstants.cellSize),
      TetrisConstants.z.main
    );
  }
}

const Grid = () => {
  const positions: THREE.Vector3[] = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let row=0; row<TetrisConstants.numRows; row++) {
      for (let col=0; col<TetrisConstants.numCols; col++) {
        positions.push(GridUtils.gridPosToScreen({ col, row }));
      }
    }
    return positions;
  }, []);

  const points = useMemo(() => {
    return [
      [0,                        0,                        0],
      [0,                        TetrisConstants.cellSize, 0],
      [TetrisConstants.cellSize, TetrisConstants.cellSize, 0],
      [TetrisConstants.cellSize, 0,                        0],
      [0,                        0,                        0],
    ];
  }, []);

  return (
    <>
      {positions.map((position, index) => {
        const key = `${index}`;
        return (
          // @ts-ignore
          <Line key={key} position={position} points={points} color={"grey"} lineWidth={2} dashed={false} opacity={0.1} transparent={true} />
        )
      })}
    </>
  );
}

const Walls = () => {
  return (
    <>
      <Line position={GridUtils.gridPosToScreen({ col: 0, row: TetrisConstants.numRows })} points={[[0, 0], [0, -TetrisConstants.gridHeight]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={GridUtils.gridPosToScreen({ col: 0, row: 0                       })} points={[[0, 0], [TetrisConstants.gridWidth, 0  ]]} color={"grey"} lineWidth={2} dashed={false} />
      <Line position={GridUtils.gridPosToScreen({ col: TetrisConstants.numCols, row: 0 })} points={[[0, 0], [0, TetrisConstants.gridHeight ]]} color={"grey"} lineWidth={2} dashed={false} />
    </>
  )
};

const Playfield = ({ enableGrid } : { enableGrid: boolean }) => {
  return (
    <>
      { enableGrid ? <Grid /> : null }
      <Walls />
    </>
  );
};

export { Playfield, GridUtils }
