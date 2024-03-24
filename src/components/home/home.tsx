import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Overlay} from "../overlay/overlay.tsx";
import {Button} from "../button/button.tsx";
import {useCallback, useState} from "react";
import {Vector3} from "three";
import {Text} from "@react-three/drei";

const WELCOME_MESSAGE = [
  'WELCOME TO THE BLOCK PARTY.',
  "THE PLACE FOR GEOMETRIC CHAOS."
];
const WELCOME_MESSAGE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -1, z: TetrisConstants.z.overlay3Offset});

const OPTIONS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -2.4, y: -1 -2.5, z: TetrisConstants.z.overlay3Offset});
const HELP_BUTTON_POSITION    = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +2.4, y: -1 -2.5, z: TetrisConstants.z.overlay3Offset});
const START_BUTTON_POSITION   = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1,      y: -1 -5,   z: TetrisConstants.z.overlay3Offset});

const Content = ({ position, text,  }: { position: Vector3, text: string }) => {
  return (
    <Text position={position} fontSize={0.7} letterSpacing={0.1} outlineWidth={0.04} outlineColor={0xFFFFFF}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={1}
        transparent={true}
      />
      {text}
    </Text>
  );
};

const Home = ({ onEnter, onStart, onOptions, onHelp, enableButtons }: { onEnter: () => void, onStart: () => void, onOptions: () => void, onHelp: () => void, enableButtons: boolean }) => {
  const [showEnter, setShowEnter] = useState(true);

  const onEnterClicked = useCallback(() => {
    setShowEnter(false);
    onEnter();
  }, []);

  return (
    <>
      <Overlay />
      {showEnter ?
        <>
          {WELCOME_MESSAGE.map((text, index) => {
            const position = WELCOME_MESSAGE_POSITION.clone().add({ x: 0, y: -index * 1.2, z: 0 });
            return <Content key= {`${index}`} position={position} text={text} />;
          })}
          <Button position={START_BUTTON_POSITION} label={'ENTER'} onButtonClick={onEnterClicked} enableSound={false} enabled={true} />
        </>
        :
        <>
          <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions} enabled={enableButtons} />
          <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp} enabled={enableButtons} />
          <Button position={START_BUTTON_POSITION} label={'START'} onButtonClick={onStart} enableSound={false} enabled={enableButtons} />
        </>
      }
    </>
  )
}

export { Home }