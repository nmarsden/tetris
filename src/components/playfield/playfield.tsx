/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useMemo} from "react";
import {Line} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Vector3} from "three";

export type GridPos = {
  col: number;
  row: number;
};

class GridUtils {
  static gridPosToScreen(gridPos: GridPos): Vector3  {
    return new Vector3(
      TetrisConstants.gridOrigin.x + (gridPos.col * TetrisConstants.cellSize),
      TetrisConstants.gridOrigin.y + (gridPos.row * TetrisConstants.cellSize),
      TetrisConstants.z.main
    );
  }

  static screenToGridPos(position: Vector3): GridPos {
    return {
      row: (position.y - TetrisConstants.gridOrigin.y) / TetrisConstants.cellSize,
      col: (position.x - TetrisConstants.gridOrigin.x) / TetrisConstants.cellSize,
    };
  }
}

const Grid = () => {
  const positions: Vector3[] = useMemo(() => {
    const positions: Vector3[] = [];
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
          <Line key={key} position={position} points={points} color={"grey"} lineWidth={3} dashed={false} opacity={0.1} transparent={true} />
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
