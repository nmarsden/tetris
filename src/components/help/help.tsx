import {Line, Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useEffect, useState} from "react";
import {Border} from "../border/border.tsx";
import {Button, ButtonType} from "../button/button.tsx";
import {Vector3} from "three";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: 4});
const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;
const BORDER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 - (BORDER_WIDTH * 0.5), y: -1 + (BORDER_HEIGHT * 0.5), z: 5});
const HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +8.5, z: 4});

const HOW_TO_PLAY_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -3.5, y: -1 +6.5, z: 4});
const HOW_TO_PLAY_LINE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 -3.5, y: -1 +5.5, z: 5});
const HOW_TO_PLAY_CONTENT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +4, z: 4});

const CONTROLS_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +3.5, y: -1 +6.5, z: 4});
const CONTROLS_LINE_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 +3.5, y: -1 +5.5, z: 5});
const CONTROLS_CONTENT_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +3, z: 4});

const CLOSE_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -8.5, z: 4});

const HOW_TO_PLAY_TEXT_ONE = [
  'Arrange falling blocks to complete',
  'lines. Speed increases as the game',
  'progresses. Aim for a high score.'
];
const HOW_TO_PLAY_TEXT_TWO = [
  ['Action',    'Points'],
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
  ['move left',  'drag left',  'left arrow'],
  ['move right', 'drag right', 'right arrow'],
  ['rotate',     'tap',        'up arrow'],
  ['soft drop',  'drag down',  'down arrow'],
  ['hard drop',  'swipe down', 'space'],
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

type Tab = 'HOW_TO_PLAY' | 'CONTROLS';

const Tabs = ({ onTabChanged }: { onTabChanged: (tab: Tab) => void }) => {
  const [selected, setSelected] = useState<Tab>('HOW_TO_PLAY');

  const changeTab = useCallback((tab: Tab) => {
    setSelected(tab);
    onTabChanged(tab);
  }, [onTabChanged]);

  const buttonType = useCallback((tab: Tab): ButtonType => {
    return tab === selected ? 'TAB' : 'TAB_UNSELECTED';
  }, [selected]);

  return (
    <>
      <Button position={HOW_TO_PLAY_BUTTON_POSITION} label={'HOW TO PLAY'} type={buttonType('HOW_TO_PLAY')} onButtonClick={() => changeTab('HOW_TO_PLAY')} />
      <Button position={CONTROLS_BUTTON_POSITION} label={'CONTROLS'} type={buttonType('CONTROLS')} onButtonClick={() => changeTab('CONTROLS')} />
      {selected === 'HOW_TO_PLAY' ?
        <Line key={'line1'} position={HOW_TO_PLAY_LINE_POSITION} points={[[-3.3, 0], [3.3, 0]]} color={"grey"} lineWidth={2} dashed={false} /> :
        <Line key={'line2'} position={CONTROLS_LINE_POSITION} points={[[-3.3, 0], [3.3, 0]]} color={"grey"} lineWidth={2} dashed={false} />
      }
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
  const yOffset = -HOW_TO_PLAY_TEXT_ONE.length * 1.1
  return (
    <>
      {HOW_TO_PLAY_TEXT_ONE.map((text, index) => {
          const pos1 = HOW_TO_PLAY_CONTENT_POSITION.clone().add({x: 0,  y: -index * 1, z: 0});
          return (
              <Content key={`${index}`} position={pos1} opacity={opacity} text={text} />
          )
      })}
      {HOW_TO_PLAY_TEXT_TWO.map((text, index) => {
        const isBold = (index === 0);
        const pos0 = HOW_TO_PLAY_CONTENT_POSITION.clone().add({x: -3, y: yOffset - index * 0.9, z: 0});
        const pos1 = HOW_TO_PLAY_CONTENT_POSITION.clone().add({x: +3, y: yOffset - index * 0.9, z: 0});
        return (
          <group key={`${index}`}>
            <Content position={pos0} opacity={opacity} text={text[0]} fontSize={0.5} isBold={isBold} />
            <Content position={pos1} opacity={opacity} text={text[1]} fontSize={0.5} isBold={isBold} />
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
          const pos0 = CONTROLS_CONTENT_POSITION.clone().add({x: -4.5, y: -index * 1, z: 0});
          const pos1 = CONTROLS_CONTENT_POSITION.clone().add({x: 0,    y: -index * 1, z: 0});
          const pos2 = CONTROLS_CONTENT_POSITION.clone().add({x: 4.5,  y: -index * 1, z: 0});
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
  const [isShowControls, setShowControls] = useState(false);
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
  }));

  const onTabChanged = useCallback((tab: Tab) => {
    setShowControls(tab === 'CONTROLS');
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

      {isShowControls ? <Controls opacity={opacity} /> : <HowToPlay opacity={opacity} />}

      <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} onButtonClick={onClose} />
    </>
  )
}

export { Help };