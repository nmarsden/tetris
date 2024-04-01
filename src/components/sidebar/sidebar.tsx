import {Info} from "../info/info.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PieceType} from "../../gameEngine.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";

type SidebarProps = {
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  isNextPieceShown: boolean;
  nextPieceType: PieceType;
  isPauseButtonShown: boolean;
  onPause: () => void;
};

const Sidebar = ({ score, bestScore, level, lines, isNextPieceShown, nextPieceType, isPauseButtonShown, onPause }: SidebarProps) => {
  const sideBarPosition = GridUtils.gridPosToScreen({col: TetrisConstants.sideBarCol, row: TetrisConstants.gridHeight * 0.5}).add({ x:0, y:0, z:0 });

  const sidebarCol = TetrisConstants.gridWidth*0.5;
  const scorePosition = GridUtils.gridPosToScreen({col: sidebarCol, row: TetrisConstants.scoreRow});
  const levelPosition = GridUtils.gridPosToScreen({col: sidebarCol, row: TetrisConstants.levelRow});
  const linesPosition = GridUtils.gridPosToScreen({col: sidebarCol, row: TetrisConstants.linesRow});
  const nextPosition = GridUtils.gridPosToScreen({col: sidebarCol,  row: TetrisConstants.nextRow });
  const pausePosition = GridUtils.gridPosToScreen({col: sidebarCol, row: TetrisConstants.pauseRow});

  return (
    <group position={sideBarPosition} rotation-y={Math.PI * -0.25} scale={1.2}>
      <Info position={scorePosition} label={'SCORE'} value={score} bestValue={bestScore}/>
      <Info position={levelPosition}  label={'LEVEL'} value={level}/>
      <Info position={linesPosition} label={'LINES'} value={lines}/>
      {isNextPieceShown ? <Info position={nextPosition} label={'NEXT'}  value={nextPieceType}/> : null}
      {isPauseButtonShown ? <Button position={pausePosition} label={'PAUSE'} type={'INFO'} onButtonClick={onPause} enableSound={false} /> : null}
    </group>
  )
};

export { Sidebar };