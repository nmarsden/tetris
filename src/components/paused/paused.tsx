import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useEffect} from "react";
import {Sound} from "../../sound.ts";

const OPTIONS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -2.4, y: -1 -2.5, z: 3});
const HELP_BUTTON_POSITION    = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +2.4, y: -1 -2.5, z: 3});
const RESUME_BUTTON_POSITION  = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1,      y: -1 -5,   z: 3});

const Paused = ({ onResume, onOptions, onHelp }: { onResume: () => void, onOptions: () => void, onHelp: () => void }) => {
  useEffect(() => {
    Sound.getInstance().play('PAUSE');
  }, []);

  return (
    <>
      <Overlay subHeading={'PAUSED'}/>
      <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions} />
      <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp} />
      <Button position={RESUME_BUTTON_POSITION} label={'RESUME'} onButtonClick={onResume} enableSound={false} />
    </>
  )
}

export { Paused }