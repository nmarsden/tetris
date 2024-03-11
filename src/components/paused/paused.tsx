import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useEffect} from "react";
import {Sound} from "../../sound.ts";

const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 - 3, z: 3});

const Paused = ({ onResume }: { onResume: () => void }) => {
  useEffect(() => {
    Sound.getInstance().play('PAUSE');
  }, []);

  return (
    <>
      <Overlay subHeading={'PAUSED'}/>
      <Button position={BUTTON_POSITION} label={'RESUME'} onButtonClick={onResume} />
    </>
  )
}

export { Paused }