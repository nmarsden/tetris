import {Float, Text, Text3D, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Button} from "../button/button.tsx";
import { Options } from "../options/options.tsx";
import {Help} from "../help/help.tsx";
import {Color, Vector3} from "three";
import {Sound} from "../../sound.ts";
import {Confetti} from "../confetti/confetti.tsx";
import {SpinningStars} from "../spinningStars/spinningStars.tsx";

const WELCOME_MESSAGE = [
  'WELCOME TO THE BLOCK PARTY.',
  "THE PLACE FOR GEOMETRIC CHAOS."
];

const MODAL_WIDTH = TetrisConstants.gameWidth;
const MODAL_HEIGHT = TetrisConstants.gameHeight-7.5;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset - 0.05});

const TEXT_POSITION = new Vector3(-7.6, 2.2, 1);

const WELCOME_MESSAGE_POSITION = new Vector3(0, -1, 0.01);

const SUB_HEADING_POSITION = new Vector3(0, 0.9, 0.1);

const NEW_BEST_STAR_POSITION = new Vector3(0, -0.65, 0.01);
const NEW_BEST_VALUE_POSITION = new Vector3(0, -0.75, 0.02);

const OPTIONS_BUTTON_POSITION = new Vector3(-2.4, -2.5, 0);
const HELP_BUTTON_POSITION = new Vector3(2.4, -2.5, 0);
const CLOSE_BUTTON_POSITION  = new Vector3(0, -5, 0);

type CustomTextType = 'SUB_HEADING' | 'MESSAGE' | 'BEST_SCORE';

type CustomTextSettings = {
  fontSize: number,
  outlineWidth: number,
  color: Color,
  outlineColor: Color
};

const CUSTOM_TEXT_SETTINGS = new Map<CustomTextType, CustomTextSettings>([
  ['SUB_HEADING', { fontSize: 1.5, outlineWidth: 0.1, color: new Color(0xFFFFFF), outlineColor: new Color(0x555555) }],
  ['MESSAGE', { fontSize: 0.7, outlineWidth: 0.04, color: new Color(0xFFFFFF), outlineColor: new Color(0xFFFFFF) }],
  ['BEST_SCORE', { fontSize: 1.5, outlineWidth: 0.1, color: new Color(0x000000), outlineColor: new Color(0x000000) }]
]);

const CustomText = ({ type, position, text, opacity }: { type: CustomTextType, position: Vector3, text: string, opacity: SpringValue<number> }) => {
  if (text === '') return null;
  const settings = CUSTOM_TEXT_SETTINGS.get(type) as CustomTextSettings;
  return (
    <Text position={position} fontSize={settings.fontSize} letterSpacing={0.1} outlineWidth={settings.outlineWidth} outlineColor={settings.outlineColor}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={settings.color}
        opacity={opacity}
        transparent={true}
      />
      {text}
    </Text>
  );
}

const CLOSED = {
  opacity: 0,
  positionY: MODAL_POSITION.y + 22
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
  const [showModal, setShowModal] = useState(false);
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
    onClose()
    api.start({
      to: CLOSED,
      config: config.stiff,
      onRest: () => {
        setShowModal(false);
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
    if (mode !== 'CLOSED') {
      setShowModal(true);
    }
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
      {showModal ? (
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

            <Float speed={2}>
              <Text3D
                position={TEXT_POSITION}
                castShadow={false}
                curveSegments={8}
                bevelEnabled
                bevelSize={0.25}
                bevelThickness={0.5}
                height={0.2}
                lineHeight={0.6}
                letterSpacing={0.01}
                size={3.1}
                font="/tetris/Inter_Bold.json"
              >
                {'TETRIS'}
                <animated.meshStandardMaterial
                  metalness={0.25}
                  roughness={0.75}
                  color={TetrisConstants.color.orange}
                  transparent={true}
                  opacity={opacity}
                />
              </Text3D>
            </Float>

            {showWelcome ? (
              <>
                {WELCOME_MESSAGE.map((text, index) => {
                  const position = WELCOME_MESSAGE_POSITION.clone().add({x: 0, y: -index * 1.2, z: 0});
                  return <CustomText type='MESSAGE' key={`${index}`} position={position} text={text}
                                     opacity={opacity}/>;
                })}
                <Button position={CLOSE_BUTTON_POSITION} label={'ENTER'} onButtonClick={onEnterButtonClick}
                        enableSound={false} opacity={opacity} enabled={true}/>
              </>
            ) : (
              <>
                <CustomText type={'SUB_HEADING'} position={SUB_HEADING_POSITION} text={subHeading} opacity={opacity}/>

                {mode === 'GAME_OVER' && showNewBestScore ? (
                  <>
                    <SpinningStars position={NEW_BEST_STAR_POSITION} opacity={opacity}/>
                    <CustomText type='BEST_SCORE' position={NEW_BEST_VALUE_POSITION} text={`${bestScore}`} opacity={opacity}/>
                    <group position-y={-2.2}>
                      <Confetti depth={3} loop={true}/>
                    </group>
                  </>
                  ) : null}

                <Button position={OPTIONS_BUTTON_POSITION} label={'OPTIONS'} type={'MEDIUM'} onButtonClick={onOptions}
                        opacity={opacity} enabled={enableButtons}/>
                <Button position={HELP_BUTTON_POSITION} label={'HELP'} type={'MEDIUM'} onButtonClick={onHelp}
                        opacity={opacity} enabled={enableButtons}/>
                <Button position={CLOSE_BUTTON_POSITION} label={closeLabel} onButtonClick={onCloseButtonClick}
                        opacity={opacity} enabled={enableButtons}/>
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

export {Overlay}