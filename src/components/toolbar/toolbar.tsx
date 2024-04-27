import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated, config, useSpring} from "@react-spring/three";
import {useCallback, useContext, useEffect, useState} from "react";
import {Button} from "../button/button.tsx";
import { Options } from "../options/options.tsx";
import {Help} from "../help/help.tsx";
import {Vector3} from "three";
import {Sound} from "../../sound.ts";
import {Line} from "@react-three/drei";
import {Banner} from "../banner/banner.tsx";
import {BestScores} from "../bestScores/bestScores.tsx";
import {AppContext} from "../context/AppContext.tsx";

const MODAL_WIDTH = TetrisConstants.gameWidth;
const MODAL_HEIGHT = 3;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -14, z: TetrisConstants.z.overlay3Offset - 0.05});

const BEST_SCORES_BUTTON_POSITION = new Vector3(-3.6, 0, 0);
const OPTIONS_BUTTON_POSITION = new Vector3(-1.2, 0, 0);
const HELP_BUTTON_POSITION = new Vector3(1.2, 0, 0);
const CLOSE_BUTTON_POSITION  = new Vector3(3.6, 0, 0);

const CLOSED = {
  opacity: 0,
  positionY: MODAL_POSITION.y - 10
};
const OPEN = {
  opacity: 1,
  positionY: MODAL_POSITION.y
};

export type ToolbarMode = 'CLOSED' | 'HOME' | 'PAUSED' | 'GAME_OVER';

type ToolbarProps = {
  mode: ToolbarMode,
  score: number,
  onPlay: () => void,
};

const Toolbar = ({ mode, score, onPlay  }: ToolbarProps) => {
  const {appState} = useContext(AppContext)!;
  const [{ opacity, positionY }, api] = useSpring(() => ({ from: CLOSED }));
  const [showToolbar, setShowToolbar] = useState(false);
  const [showBestScores, setShowBestScores] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [enableButtons, setEnableButtons] = useState(true);
  const [gameOverBanner, setGameOverBanner] = useState('');

  const open = useCallback(() => {
    setShowToolbar(true);
    api.start({
      to: OPEN,
      config: config.gentle
    });
  }, [api]);

  const onPlayButtonClick = useCallback(() => {
    onPlay()
    api.start({
      to: CLOSED,
      config: config.stiff,
      onRest: () => {
        setShowToolbar(false);
      }
    });
  }, [api, onPlay]);

  const onBestScores = useCallback(() => {
    setEnableButtons(false);
    setShowBestScores(true);
  }, []);

  const onBestScoresClose = useCallback(() => {
    setEnableButtons(true);
    setShowBestScores(false);
  }, []);

  const onOptions = useCallback(() => {
    setEnableButtons(false);
    setShowOptions(true);
  }, []);

  const onOptionsClose = useCallback(() => {
    setEnableButtons(true);
    setShowOptions(false);
  }, []);

  const onHelp = useCallback(() => {
    setEnableButtons(false);
    setShowHelp(true);
  }, []);

  const onHelpClose = useCallback(() => {
    setEnableButtons(true);
    setShowHelp(false);
  }, []);

  useEffect(() => {
    if (mode !== 'CLOSED') {
      open();
    }
    if (mode === 'PAUSED') {
      Sound.getInstance().stopMusic();
      Sound.getInstance().playSoundFX('PAUSE');
    } else if (mode === 'GAME_OVER') {
      Sound.getInstance().stopMusic();
      Sound.getInstance().playSoundFX('GAME OVER');
    }
  }, [mode, open]);

  useEffect(() => {
    if (mode === 'GAME_OVER') {
      const scoreIndex = appState.bestScores.findIndex(value => value.score === score);
      setGameOverBanner((scoreIndex >= 0) ? `#${scoreIndex + 1} SCORE` : 'GAME OVER');
    }
  }, [appState.bestScores, mode, score]);

  return (
    <>
      {showToolbar ? (
        <>
          {/*Banner*/}
          {mode === 'PAUSED' ? <Banner text={'PAUSED'} /> : null}
          {mode === 'GAME_OVER' ? <Banner text={gameOverBanner} /> : null}
          {/*Toolbar*/}
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
              opacity={0.5}
            />
            <Button
              position={BEST_SCORES_BUTTON_POSITION}
              icon={'bestScores.png'}
              type={'SMALL'}
              onButtonClick={onBestScores}
              opacity={opacity}
              enabled={enableButtons}
            />
            <Button
              position={OPTIONS_BUTTON_POSITION}
              icon={'options.png'}
              type={'SMALL'}
              onButtonClick={onOptions}
              opacity={opacity}
              enabled={enableButtons}
            />
            <Button
              position={HELP_BUTTON_POSITION}
              icon={'help.png'}
              type={'SMALL'}
              onButtonClick={onHelp}
              opacity={opacity}
              enabled={enableButtons}
            />
            <Button
              position={CLOSE_BUTTON_POSITION}
              icon={'play.png'}
              type={'SMALL'}
              onButtonClick={onPlayButtonClick}
              opacity={opacity}
              enabled={enableButtons}
            />
            {/*Border*/}
            <Line position={[MODAL_WIDTH * -0.5, MODAL_HEIGHT * 0.5,  0]} points={[[0, 0], [MODAL_WIDTH, 0]]} color={"grey"} lineWidth={2} dashed={false} />
            <Line position={[MODAL_WIDTH * -0.5, MODAL_HEIGHT * -0.5, 0]} points={[[0, 0], [MODAL_WIDTH, 0]]} color={"grey"} lineWidth={2} dashed={false} />
            <Line position={[MODAL_WIDTH * -0.5, MODAL_HEIGHT * 0.5,  0]} points={[[0, 0], [0, -MODAL_HEIGHT]]} color={"grey"} lineWidth={2} dashed={false} />
            <Line position={[MODAL_WIDTH * 0.5,  MODAL_HEIGHT * 0.5,  0]} points={[[0, 0], [0, -MODAL_HEIGHT]]} color={"grey"} lineWidth={2} dashed={false} />
          </animated.mesh>
        </>
      ) : null}
      {showBestScores ? <BestScores onClose={onBestScoresClose}/> : null}
      {showOptions ? <Options onClose={onOptionsClose}/> : null}
      {showHelp ? <Help onClose={onHelpClose}/> : null}
    </>
  );
}

export {Toolbar}