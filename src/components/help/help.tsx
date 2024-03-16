import {Line, Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Border} from "../border/border.tsx";
import {Button, ButtonType} from "../button/button.tsx";
import {Vector3} from "three";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay4Offset});
const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;
const BORDER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 - (BORDER_WIDTH * 0.5), y: -1 + (BORDER_HEIGHT * 0.5), z: TetrisConstants.z.overlay5Offset});
const HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +8.5, z: TetrisConstants.z.overlay4Offset});

const HOW_TO_PLAY_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -4.5, y: -1 +6.5, z: TetrisConstants.z.overlay4Offset});
const HOW_TO_PLAY_LINE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -4.5, y: -1 +5.8, z: TetrisConstants.z.overlay5Offset});

const CONTROLS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +6.5, z: TetrisConstants.z.overlay4Offset});
const CONTROLS_LINE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +5.8, z: TetrisConstants.z.overlay5Offset});

const SCORING_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +4.5, y: -1 +6.5, z: TetrisConstants.z.overlay4Offset});
const SCORING_LINE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +4.5, y: -1 +5.8, z: TetrisConstants.z.overlay5Offset});

const CONTENT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +4, z: TetrisConstants.z.overlay4Offset});

const CLOSE_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -8, z: TetrisConstants.z.overlay4Offset});

const HOW_TO_PLAY_TEXT = [
  'Arrange falling blocks to complete',
  'lines and scores points.',
  '',
  'Every 10 lines cleared, levels up and',
  'increases the game speed.',
  '',
  'Prevent blocks piling up to the top',
  'and ending the game.',
  '',
  'Aim for a high score.'
];

const SCORING_TEXT = [
  ['ACTION',    'POINTS'],
  ['Single',    '100*'],
  ['Double',    '300*'],
  ['Triple',    '500*'],
  ['Tetris',    '800*'],
  ['Combo',     '50 × combo count*'],
  ['Soft drop', '1 per cell'],
  ['Hard drop', '2 per cell'],
  ['',          '(* multiplied by level)']
];

const CONTROLS_TEXT: [string, string, string][] = [
  ['ACTION',     'MOBILE',     'DESKTOP'],
  ['Move left',  'Drag left',  'Left arrow'],
  ['Move right', 'Drag right', 'Right arrow'],
  ['Rotate',     'Tap',        'Up arrow'],
  ['Soft drop',  'Drag down',  'Down arrow'],
  ['Hard drop',  'Swipe down', 'Space'],
];

const Heading = ({ position, opacity, text }: { position: Vector3, opacity: SpringValue<number>, text: string }) => {
  return (
    <Text position={position} fontSize={1} letterSpacing={0.1} outlineWidth={0.05} outlineColor={0xFFFFFF}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={opacity}
        transparent={true}
      />
      {text}
    </Text>
  );
};

type Tab = 'HOW_TO_PLAY' | 'SCORING' | 'CONTROLS';

const Tabs = ({ onTabChanged }: { onTabChanged: (tab: Tab) => void }) => {
  const [selected, setSelected] = useState<Tab>('HOW_TO_PLAY');

  const changeTab = useCallback((tab: Tab) => {
    setSelected(tab);
    onTabChanged(tab);
  }, [onTabChanged]);

  const buttonType = useCallback((tab: Tab): ButtonType => {
    return tab === selected ? 'TAB' : 'TAB_UNSELECTED';
  }, [selected]);

  const linePosition = useMemo((): Vector3 => {
    switch(selected) {
      case 'HOW_TO_PLAY': return HOW_TO_PLAY_LINE_POSITION;
      case 'SCORING': return SCORING_LINE_POSITION;
      case 'CONTROLS': return CONTROLS_LINE_POSITION;
    }
  }, [selected]);

  return (
    <>
      <Button position={HOW_TO_PLAY_BUTTON_POSITION} label={'HOW TO PLAY'} type={buttonType('HOW_TO_PLAY')} onButtonClick={() => changeTab('HOW_TO_PLAY')} />
      <Button position={CONTROLS_BUTTON_POSITION} label={'CONTROLS'} type={buttonType('CONTROLS')} onButtonClick={() => changeTab('CONTROLS')} />
      <Button position={SCORING_BUTTON_POSITION} label={'SCORING'} type={buttonType('SCORING')} onButtonClick={() => changeTab('SCORING')} />
      <Line key={selected} position={linePosition} points={[[-2.5, 0], [2.5, 0]]} color={"grey"} lineWidth={2} dashed={false} />
    </>
  );
};

const Content = ({ position, opacity, text, fontSize=0.6, isBold=false }: { position: Vector3, opacity: SpringValue<number>, text: string, fontSize?: number, isBold?: boolean }) => {
  return (
    <Text position={position} fontSize={fontSize} letterSpacing={isBold ? 0.1 : 0.05} outlineWidth={isBold ? 0.04 : 0.01} outlineColor={0xFFFFFF}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={opacity}
        transparent={true}
      />
      {text}
    </Text>
  );
};

const HowToPlay = ({ opacity }: { opacity: SpringValue<number> }) => {
  return (
    <>
      {HOW_TO_PLAY_TEXT.map((text, index) => {
          const pos1 = CONTENT_POSITION.clone().add({x: 0, y: -index, z: 0});
          return (
              <Content key={`${index}`} position={pos1} opacity={opacity} text={text} />
          )
      })}
    </>
  )
};

const Scoring = ({ opacity }: { opacity: SpringValue<number> }) => {
  return (
    <>
      {SCORING_TEXT.map((text, index) => {
        const isBold = (index === 0);
        const pos0 = CONTENT_POSITION.clone().add({x: -3, y: -index, z: 0});
        const pos1 = CONTENT_POSITION.clone().add({x: +3, y: -index, z: 0});
        return (
          <group key={`${index}`}>
            <Content position={pos0} opacity={opacity} text={text[0]} isBold={isBold} />
            <Content position={pos1} opacity={opacity} text={text[1]} isBold={isBold} />
          </group>
        )
      })}
    </>
  )
};

const Controls = ({ opacity }: { opacity: SpringValue<number> }) => {
  return (
    <>
      {CONTROLS_TEXT.map((text, index) => {
          const isBold = (index === 0);
          const pos0 = CONTENT_POSITION.clone().add({x: -4.5, y: -index, z: 0});
          const pos1 = CONTENT_POSITION.clone().add({x: 0,    y: -index, z: 0});
          const pos2 = CONTENT_POSITION.clone().add({x: 4.5,  y: -index, z: 0});
          return (
            <group key={`${index}`}>
              <Content position={pos0} opacity={opacity} text={text[0]} isBold={isBold} />
              <Content position={pos1} opacity={opacity} text={text[1]} isBold={isBold} />
              <Content position={pos2} opacity={opacity} text={text[2]} isBold={isBold} />
            </group>
          )
      })}
    </>
  )
};

const Help = ({ onClose }: { onClose: () => void }) => {
  const [selectedTab, setSelectedTab] = useState<Tab>('HOW_TO_PLAY');
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  const onTabChanged = useCallback((tab: Tab) => {
    setSelectedTab(tab);
  }, []);

  useEffect(() => {
    api.start({ to: { opacity: 1 } });
  }, [api]);

  return (
    <>
      <Plane position={OVERLAY_POSITION} args={[TetrisConstants.gameWidth, TetrisConstants.gameHeight]}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={TetrisConstants.color.black}
          opacity={opacity}
        />
      </Plane>
      <Border position={BORDER_POSITION} width={BORDER_WIDTH} height={BORDER_HEIGHT} />

      <Heading position={HEADING_POSITION} opacity={opacity} text={'HELP'} />

      <Tabs onTabChanged={onTabChanged} />

      {selectedTab === 'HOW_TO_PLAY' ? <HowToPlay opacity={opacity} />  : null}
      {selectedTab === 'SCORING' ? <Scoring opacity={opacity} /> : null}
      {selectedTab === 'CONTROLS' ? <Controls opacity={opacity} /> : null}

      <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} onButtonClick={onClose} />
    </>
  )
}

export { Help };