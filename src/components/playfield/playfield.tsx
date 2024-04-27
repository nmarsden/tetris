/* eslint-disable @typescript-eslint/ban-ts-comment */
import {useEffect, useMemo} from "react";
import {Line} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {Vector3} from "three";
import {animated, config, useSpring} from "@react-spring/three";

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
          <Line key={key} position={position} points={points} color={0x333333} lineWidth={2} dashed={false} opacity={1} transparent={true} />
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

const Playfield = ({ isShown, enableGrid } : { isShown: boolean; enableGrid: boolean }) => {
  const [{ scale }, api] = useSpring(() => ({ scale: 0 }));

  useEffect(() => {
    api.start({
      from: { scale: isShown ? 0 : 1 },
      to: { scale: isShown ? 1 : 0 },
      immediate: !isShown,
      config: config.stiff
    })
  }, [isShown, api]);

  return (
    <animated.group scale={scale}>
      { enableGrid ? <Grid /> : null }
      <Walls />
    </animated.group>
  );
};

export { Playfield, GridUtils }
