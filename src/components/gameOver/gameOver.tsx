import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useEffect} from "react";
import {Sound} from "../../sound.ts";
import {Text} from "@react-three/drei";
import {Vector3} from "three";

const NEW_BEST_VALUE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -0.75, z: TetrisConstants.z.overlay3Offset});

const OPTIONS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -2.4, y: -1 -2.5, z: TetrisConstants.z.overlay3Offset});
const HELP_BUTTON_POSITION    = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +2.4, y: -1 -2.5, z: TetrisConstants.z.overlay3Offset});
const RETRY_BUTTON_POSITION  = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1,      y: -1 -5,   z: TetrisConstants.z.overlay3Offset});

const CustomText = ({ position, text }: { position: Vector3, text: string }) => {
  return (
    <Text position={position} fontSize={1.5} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0xFFFFFF}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
      />
      {text}
    </Text>
  );
}

const GameOver = ({ newBestScore, onRetry, onOptions, onHelp, enableButtons }: { newBestScore?: number, onRetry: () => void, onOptions: () => void, onHelp: () => void, enableButtons: boolean }) => {
  useEffect(() => {
    Sound.getInstance().stopMusic();
    Sound.getInstance().playSoundFX('GAME OVER');
  }, []);

  return (
    <>
      <Overlay subHeading={newBestScore ? 'NEW BEST SCORE' : 'GAME OVER'} />
      {newBestScore ?
        <>
          <CustomText position={NEW_BEST_VALUE_POSITION} text={`${newBestScore}`} />
        </> : null
      }
      <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions} enabled={enableButtons} />
      <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp} enabled={enableButtons} />
      <Button position={RETRY_BUTTON_POSITION} label={'RETRY'} onButtonClick={onRetry} enableSound={false} enabled={enableButtons} />
    </>
  )
}

export { GameOver }