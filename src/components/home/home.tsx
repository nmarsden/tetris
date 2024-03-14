import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useCallback} from "react";

const OPTIONS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -2.4, y: -1 -2.5, z: 3});
const HELP_BUTTON_POSITION    = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +2.4, y: -1 -2.5, z: 3});
const START_BUTTON_POSITION   = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1,      y: -1 -5,   z: 3});

const Home = ({ onStart, onHelp }: { onStart: () => void, onHelp: () => void }) => {
  const onOptions = useCallback(() => {
    console.info('Options pressed!');
  }, []);

  return (
    <>
      <Overlay />
      <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions} />
      <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp} />
      <Button position={START_BUTTON_POSITION} label={'START'} onButtonClick={onStart} />
    </>
  )
}

export { Home }