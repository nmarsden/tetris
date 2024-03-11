import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";

const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 - 3, z: 3});

const Home = ({ onStart }: { onStart: () => void }) => {

  return (
    <>
      <Overlay />
      <Button position={BUTTON_POSITION} label={'START'} onButtonClick={onStart} />
    </>
  )
}

export { Home }