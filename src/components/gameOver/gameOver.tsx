import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useEffect} from "react";
import {Sound} from "../../sound.ts";

const BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 - 3, z: 3});

const GameOver = ({ onRetry }: { onRetry: () => void }) => {

  useEffect(() => {
    Sound.getInstance().play('GAME OVER');
  }, []);

  return (
    <>
      <Overlay subHeading={'GAME OVER'} />
      <Button position={BUTTON_POSITION} label={'RETRY'} onButtonClick={onRetry} />
    </>
  )
}

export { GameOver }