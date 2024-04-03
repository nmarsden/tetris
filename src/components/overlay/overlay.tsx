import {Plane, Text, useTexture, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated, config, useSpring} from "@react-spring/three";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Button} from "../button/button.tsx";
import { Options } from "../options/options.tsx";
import {Help} from "../help/help.tsx";
import {Vector3} from "three";
import {Sound} from "../../sound.ts";

const WELCOME_MESSAGE = [
  'WELCOME TO THE BLOCK PARTY.',
  "THE PLACE FOR GEOMETRIC CHAOS."
];

const MODAL_WIDTH = TetrisConstants.gameWidth;
const MODAL_HEIGHT = TetrisConstants.gameHeight-8;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset - 0.05});

const IMAGE_POSITION = new Vector3(0, 3.5, 0.05);
const TEXT_POSITION = new Vector3(0, 3.2, 0.1);

const WELCOME_MESSAGE_POSITION = new Vector3(0, -1, 0.01);

const SUB_HEADING_POSITION = new Vector3(0, 0.9, 0.1);

const NEW_BEST_VALUE_POSITION = new Vector3(0, -0.75, 0.01);

const OPTIONS_BUTTON_POSITION = new Vector3(-2.4, -2.5, 0);
const HELP_BUTTON_POSITION = new Vector3(2.4, -2.5, 0);
const CLOSE_BUTTON_POSITION  = new Vector3(0, -5, 0);

const SubHeading = ({ text }: { text: string }) => {
  if (text === '') return null;
  return (
    <Text position={SUB_HEADING_POSITION} fontSize={1.5} letterSpacing={0.1} outlineWidth={0.1} outlineColor={0x222222}>
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
      />
      {text}
    </Text>
  );
}

const Content = ({ position, text }: { position: Vector3, text: string }) => {
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

const BestScore = ({ position, text }: { position: Vector3, text: string }) => {
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

const CLOSED = {
  opacity: 0,
  positionY: MODAL_POSITION.y + 20
};
const OPEN = {
  opacity: 1,
  positionY: MODAL_POSITION.y
};

export type OverlayMode = 'CLOSED' | 'HOME' | 'PAUSED' | 'GAME_OVER';

type OverlaySettings = {
  subHeading: string;
  closeLabel: string;
}

const SETTINGS = new Map<OverlayMode, OverlaySettings>([
  [ 'CLOSED',    { subHeading: '', closeLabel: '' } ],
  [ 'HOME',      { subHeading: '', closeLabel: 'START' } ],
  [ 'PAUSED',    { subHeading: 'PAUSED', closeLabel: 'RESUME' } ],
  [ 'GAME_OVER', { subHeading: 'GAME OVER', closeLabel: 'RETRY' } ]
]);

const Overlay = ({ mode, onEnter, onOptionsUpdated, onClose, bestScore,  }: { mode: OverlayMode, onEnter: () => void, onOptionsUpdated: () => void, onClose: () => void, bestScore: number }) => {
  const [{ opacity, positionY }, api] = useSpring(() => ({ from: CLOSED }));
  const texture = useTexture('/tetris/image/tetris_blocks.png');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [subHeading, setSubHeading] = useState('');
  const [closeLabel, setCloseLabel] = useState('');
  const [showNewBestScore, setShowNewBestScore] = useState(false);
  const [lastBestScore, setLastBestScore] = useState(bestScore);

  const enableButtons = useMemo(() => {
    return !(showOptions || showHelp);
  }, [showOptions, showHelp]);

  const open = useCallback(() => {
    api.start({
      to: OPEN,
      config: config.gentle
    });
  }, [api]);

  const onEnterButtonClick = useCallback(() => {
    onEnter();
    setShowWelcome(false);
  }, [onEnter]);

  const onCloseButtonClick = useCallback(() => {
    api.start({
      to: CLOSED,
      config: config.stiff,
      onRest: () => {
        onClose()
        setShowNewBestScore(false);
      }
    });
  }, [api, onClose]);

  const onOptions = useCallback(() => {
    setShowOptions(true);
  }, []);

  const onOptionsClose = useCallback(() => {
    onOptionsUpdated();
    setShowOptions(false);
  }, [onOptionsUpdated]);

  const onHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  useEffect(() => {
    open();
  }, [open]);

  useEffect(() => {
    if (mode === 'PAUSED') {
      open();
      Sound.getInstance().stopMusic();
      Sound.getInstance().playSoundFX('PAUSE');
    } else if (mode === 'GAME_OVER') {
      open();
      Sound.getInstance().stopMusic();
      Sound.getInstance().playSoundFX('GAME OVER');
    }
  }, [mode, open]);

  useEffect(() => {
    const settings = SETTINGS.get(mode) as OverlaySettings;
    setSubHeading(showNewBestScore && mode === 'GAME_OVER' ? 'NEW BEST SCORE' : settings.subHeading);
    setCloseLabel(settings.closeLabel);
  }, [mode, showNewBestScore]);

  useEffect(() => {
    if (bestScore > lastBestScore) {
      setShowNewBestScore(true);
      setLastBestScore(bestScore);
    }
  }, [bestScore, lastBestScore, setShowNewBestScore]);

  return (
    <>
      {mode !== 'CLOSED' ? (
        <>
          {/*Modal*/}
          <animated.mesh
            position-x={MODAL_POSITION.x}
            position-y={positionY}
            position-z={MODAL_POSITION.z}
          >
            <planeGeometry args={[MODAL_WIDTH, MODAL_HEIGHT]}/>
            <animated.meshStandardMaterial
              metalness={1}
              roughness={1}
              transparent={true}
              color={'#000F2e'}
              opacity={opacity}
            />
            <Wireframe simplify={true} stroke={'white'} backfaceStroke={'white'} thickness={0.01}/>

            {/*Logo*/}
            <Plane position={IMAGE_POSITION} args={[TetrisConstants.gameWidth - 2, TetrisConstants.gameHeight - 17]}>
              <meshStandardMaterial
                metalness={1}
                roughness={1}
                map={texture}
              />
            </Plane>
            <Text position={TEXT_POSITION} fontSize={3.65} letterSpacing={0.1} outlineWidth={0.2} outlineColor={0x000000}>
              <meshStandardMaterial
                metalness={1}
                roughness={1}
                color={0x000000}
              />
              {'TETRIS'}
            </Text>

            {showWelcome ? (
              <>
                {WELCOME_MESSAGE.map((text, index) => {
                  const position = WELCOME_MESSAGE_POSITION.clone().add({ x: 0, y: -index * 1.2, z: 0 });
                  return <Content key= {`${index}`} position={position} text={text} />;
                })}
                <Button position={CLOSE_BUTTON_POSITION} label={'ENTER'} onButtonClick={onEnterButtonClick} enableSound={false} enabled={true} />
              </>
            ) : (
              <>
                <SubHeading text={subHeading} />

                {showNewBestScore ? <BestScore position={NEW_BEST_VALUE_POSITION} text={`${bestScore}`} /> : null}

                <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions} enabled={enableButtons} />
                <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp} enabled={enableButtons} />
                <Button position={CLOSE_BUTTON_POSITION} label={closeLabel} onButtonClick={onCloseButtonClick} enableSound={false} enabled={enableButtons} />
              </>
            )}
          </animated.mesh>
        </>
      ) : null}
      {showOptions ? <Options onClose={onOptionsClose}/> : null}
      {showHelp ? <Help onClose={() => setShowHelp(false)}/> : null}
    </>
  );
}

export { Overlay }