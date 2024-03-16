import {GridPos, GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";

const PauseButton = ({ gridPos, onPause }: { gridPos: GridPos, onPause: () => void }) => {
  const position = GridUtils.gridPosToScreen({ col: gridPos.col, row: gridPos.row });

  return (
    <Button position={position} label={'PAUSE'} type={'INFO'} onButtonClick={onPause} enableSound={false} />
  )
}

export { PauseButton }