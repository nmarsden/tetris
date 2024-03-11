import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";

const PauseButton = ({ gridPos, onPause }: { gridPos: GridPos, onPause: () => void }) => {
  const position = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row });

  return (
    <Button position={position} label={'PAUSE'} width={TetrisConstants.infoWidth} onButtonClick={onPause} />
  )
}

export { PauseButton }