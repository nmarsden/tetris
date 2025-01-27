import {Info} from "../info/info.tsx";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {PieceType} from "../../gameEngine.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {Button} from "../button/button.tsx";
import {Vector3} from "three";
import {useEffect} from "react";
import {useSpring, animated, config} from "@react-spring/three";
import {useControls} from "leva";

const SIDEBAR_POSITION = GridUtils.gridPosToScreen({col: TetrisConstants.sideBarCol, row: TetrisConstants.gridHeight}).add({ x:0, y:0, z:0 });

type SidebarProps = {
  isShown: boolean;
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  nextPieceType: PieceType | null;
  isPauseButtonShown: boolean;
  onPause: () => void;
  isNewBestScore: boolean;
};

const PauseButton = ({ isShown, position, onPause }: { isShown: boolean, position: Vector3, onPause: () => void }) => {
  const [{scale}, api] = useSpring(() => ({ from: { scale: 0 } }));

  useEffect(() => {
    api.start({
      from: { scale: isShown ? 0 : 1 },
      to: { scale: isShown ? 1 : 0 },
      immediate: !isShown,
      config: config.gentle
    })
  }, [isShown, api]);

  return (
    <animated.group scale={scale}>
      <Button position={position} label={'PAUSE'} type={'INFO'} onButtonClick={onPause} enableSound={false} />;
    </animated.group>
  );
};

const Sidebar = ({ isShown, score, bestScore, level, lines, nextPieceType, isPauseButtonShown, onPause, isNewBestScore }: SidebarProps) => {
  const [{ scale }, api] = useSpring(() => ({ scale: 0 }));
  const { sidebar } = useControls({
    sidebar: true
  });
  useEffect(() => {
    api.start({
      from: { scale: isShown ? 0 : 1 },
      to: { scale: isShown ? 1 : 0 },
      immediate: !isShown,
      config: config.stiff
    })
  }, [isShown, api]);

  const sidebarX = 0;
  const pausePosition =new Vector3(sidebarX, 0, 0);
  const scorePosition = new Vector3(sidebarX, -3.2, 0);
  const bestScorePosition = new Vector3(sidebarX, -4.5, 0);
  const levelPosition = new Vector3(sidebarX, -7.2, 0);
  const linesPosition = new Vector3(sidebarX, -10.2, 0);
  const nextPosition = new Vector3(sidebarX, -13.2, 0);

  return (
    <animated.group
      position={SIDEBAR_POSITION}
      rotation-y={Math.PI * -0.25}
      scale={scale}
      visible={sidebar}
    >
      <PauseButton isShown={isPauseButtonShown} position={pausePosition} onPause={onPause} />
      <Info position={scorePosition} label={'SCORE'} value={score}/>
      <Info position={bestScorePosition} label={'SCORE'} value={bestScore} isBest={true} isFlash={isNewBestScore}/>
      <Info position={levelPosition}  label={'LEVEL'} value={level}/>
      <Info position={linesPosition} label={'LINES'} value={lines}/>
      <Info position={nextPosition} label={'NEXT'} value={nextPieceType}/>
    </animated.group>
  )
};

export { Sidebar };