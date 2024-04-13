import {Line, Text, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Button, ButtonType} from "../button/button.tsx";
import {Vector3} from "three";
import {Sound} from "../../sound.ts";
import {Slider} from "../uikit/slider.tsx";
import {Root, setPreferredColorScheme} from "@react-three/uikit";
import {Switch} from "../uikit/switch.tsx";
import {AppContext} from "../context/AppContext.tsx";

const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay4Offset});

const HEADING_POSITION = new Vector3(0, 8.5, 0.01);

const AUDIO_BUTTON_POSITION = new Vector3(-2.3, 6.5, 0);
const AUDIO_LINE_POSITION = new Vector3(-2.3, 5.8, 0.01);

const EFFECTS_BUTTON_POSITION = new Vector3(2.3, 6.5, 0);
const EFFECTS_LINE_POSITION = new Vector3(2.3, 5.8, 0.01);

const MUSIC_VOLUME_LABEL_POSITION = new Vector3(0, 4, 0.01);
const MUSIC_VOLUME_SLIDER_TRANSLATE_Y = -1200;

const SFX_VOLUME_LABEL_POSITION = new Vector3(0, -1, 0.01);
const SFX_VOLUME_SLIDER_TRANSLATE_Y = 1300;

const CAMERA_SHAKE_SWITCH_TRANSLATE_Y = -1700;
const CAMERA_SHAKE_LABEL_POSITION = new Vector3(-2.2, 3.4, 0.01);

const CONFETTI_SWITCH_TRANSLATE_Y = -500;
const CONFETTI_LABEL_POSITION = new Vector3(-2.2, 0.95, 0.01);

const POPUPS_SWITCH_TRANSLATE_Y = 700;
const POPUPS_LABEL_POSITION = new Vector3(-2.2, -1.45, 0.01);

const BACKGROUND_SWITCH_TRANSLATE_Y = 1900;
const BACKGROUND_LABEL_POSITION = new Vector3(-2.2, -3.85, 0.01);

const CLOSE_BUTTON_POSITION = new Vector3(0, -8, 0);

setPreferredColorScheme("dark");

function roundToOneDecimalPlace(num: number) {
  return +(num.toFixed(1));
}

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

type Tab = 'AUDIO' | 'EFFECTS';

const Tabs = ({ onTabChanged }: { onTabChanged: (tab: Tab) => void }) => {
  const [selected, setSelected] = useState<Tab>('AUDIO');

  const changeTab = useCallback((tab: Tab) => {
    setSelected(tab);
    onTabChanged(tab);
  }, [onTabChanged]);

  const buttonType = useCallback((tab: Tab): ButtonType => {
    return tab === selected ? 'TAB' : 'TAB_UNSELECTED';
  }, [selected]);

  const linePosition = useMemo((): Vector3 => {
    switch(selected) {
      case 'AUDIO': return AUDIO_LINE_POSITION;
      case 'EFFECTS': return EFFECTS_LINE_POSITION;
    }
  }, [selected]);

  return (
    <>
      <Button position={AUDIO_BUTTON_POSITION} label={'AUDIO'} type={buttonType('AUDIO')} onButtonClick={() => changeTab('AUDIO')} />
      <Button position={EFFECTS_BUTTON_POSITION} label={'EFFECTS'} type={buttonType('EFFECTS')} onButtonClick={() => changeTab('EFFECTS')} />
      <Line key={selected} position={linePosition} points={[[-2.5, 0], [2.5, 0]]} color={"grey"} lineWidth={2} dashed={false} />
    </>
  );
};

const LabelValue = ({ position, opacity, label, value, align = 'center' }: { position: Vector3, opacity: SpringValue<number>, label: string, value: number | string, align?: 'center' | 'left' }) => {
  return (
    <Text position={position} fontSize={0.8} letterSpacing={0.1} outlineWidth={0.03} outlineColor={0xFFFFFF} anchorX={align}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={opacity}
        transparent={true}
      />
      {label}: {(typeof value === 'number') ? Math.round(value).toString(10) : value}
    </Text>
  );
};

const VolumeSlider = ({ translateY, initialValue, onVolumeChange }: { translateY: number, initialValue: number, onVolumeChange: (value: number) => void }) => {
  return (
    <Root backgroundColor="red"
          backgroundOpacity={0}
          sizeX={12}
          sizeY={2}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          transformTranslateX={0}
          transformTranslateY={translateY}
          transformTranslateZ={100}
    >
      <Slider
        defaultValue={initialValue}
        min={0}
        max={10}
        step={1}
        width={100}
        transformScale={50}
        onValueChange={onVolumeChange}
      />
    </Root>
  );
};

const ToggleSwitch = ({ translateY, initialValue, onChange }: { translateY: number, initialValue: boolean, onChange: (value: boolean) => void }) => {
  const onCheckedChange = useCallback((value: boolean) => {
    Sound.getInstance().playSoundFX('BUTTON');
    onChange(value)
  }, [onChange]);

  return (
    <Root backgroundColor="red"
          backgroundOpacity={0}
          sizeX={12}
          sizeY={2}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          transformTranslateX={-2100}
          transformTranslateY={translateY}
          transformTranslateZ={100}
    >
      <Switch
        defaultChecked={initialValue}
        transformScale={35}
        onCheckedChange={onCheckedChange}
      />
    </Root>
  );
};

const Audio = ({ opacity }: { opacity: SpringValue<number> }) => {
  const {appState, setMusicVolume, setSoundFXVolume} = useContext(AppContext)!;
  const [musicVolumeValue, setMusicVolumeValue] = useState(appState.musicVolume * 10);
  const [sfxVolumeValue, setSfxVolumeValue] = useState(appState.soundFXVolume * 10);

  const onMusicVolumeChange = useCallback((value: number): void => {
    if (value !== musicVolumeValue) {
      setMusicVolumeValue(value);
      setMusicVolume(roundToOneDecimalPlace(value * 0.1));
      Sound.getInstance().setMusicVolume(roundToOneDecimalPlace(value * 0.1));
    }
  }, [musicVolumeValue, setMusicVolume]);

  const onSfxVolumeChange = useCallback((value: number): void => {
    if (value !== sfxVolumeValue) {
      setSfxVolumeValue(value);
      setSoundFXVolume(roundToOneDecimalPlace(value * 0.1));
      Sound.getInstance().setSoundFXVolume(roundToOneDecimalPlace(value * 0.1));
      Sound.getInstance().playSoundFX('COUNT');
    }
  }, [setSoundFXVolume, sfxVolumeValue]);

  return (
    <>
      <LabelValue position={MUSIC_VOLUME_LABEL_POSITION} opacity={opacity} label={'Music Volume'} value={musicVolumeValue} />
      <VolumeSlider translateY={MUSIC_VOLUME_SLIDER_TRANSLATE_Y} initialValue={musicVolumeValue} onVolumeChange={onMusicVolumeChange} />

      <LabelValue position={SFX_VOLUME_LABEL_POSITION} opacity={opacity} label={'SFX Volume'} value={sfxVolumeValue} />
      <VolumeSlider translateY={SFX_VOLUME_SLIDER_TRANSLATE_Y} initialValue={sfxVolumeValue} onVolumeChange={onSfxVolumeChange} />
    </>
  )
};

const Effects = ({ opacity }: { opacity: SpringValue<number> }) => {
  const {appState, setCameraShake, setConfetti, setPopups, setBackground} = useContext(AppContext)!;

  const onCameraShakeChange = useCallback((value: boolean): void => {
    setCameraShake(value);
  }, [setCameraShake]);

  const onConfettiChange = useCallback((value: boolean): void => {
    setConfetti(value);
  }, [setConfetti]);

  const onPopupsChange = useCallback((value: boolean): void => {
    setPopups(value);
  }, [setPopups]);

  const onBackgroundChange = useCallback((value: boolean): void => {
    setBackground(value);
  }, [setBackground]);

  return (
    <>
      <ToggleSwitch translateY={CAMERA_SHAKE_SWITCH_TRANSLATE_Y} initialValue={appState.cameraShake} onChange={onCameraShakeChange} />
      <LabelValue position={CAMERA_SHAKE_LABEL_POSITION} opacity={opacity} label={'Camera Shake'} value={appState.cameraShake ? 'ON' : 'OFF'} align={'left'} />

      <ToggleSwitch translateY={CONFETTI_SWITCH_TRANSLATE_Y} initialValue={appState.confetti} onChange={onConfettiChange} />
      <LabelValue position={CONFETTI_LABEL_POSITION} opacity={opacity} label={'Confetti'} value={appState.confetti ? 'ON' : 'OFF'} align={'left'} />

      <ToggleSwitch translateY={POPUPS_SWITCH_TRANSLATE_Y} initialValue={appState.popups} onChange={onPopupsChange} />
      <LabelValue position={POPUPS_LABEL_POSITION} opacity={opacity} label={'Popups'} value={appState.popups ? 'ON' : 'OFF'} align={'left'} />

      <ToggleSwitch translateY={BACKGROUND_SWITCH_TRANSLATE_Y} initialValue={appState.background} onChange={onBackgroundChange} />
      <LabelValue position={BACKGROUND_LABEL_POSITION} opacity={opacity} label={'Background'} value={appState.background ? 'ON' : 'OFF'} align={'left'} />
    </>
  )
};

const CLOSED = {
  opacity: 0,
  positionY: OVERLAY_POSITION.y + 22
};
const OPEN = {
  opacity: 1,
  positionY: OVERLAY_POSITION.y
};

const Options = ({ onClose }: { onClose: () => void }) => {
  const [selectedTab, setSelectedTab] = useState<Tab>('AUDIO');
  const [{ opacity, positionY }, api] = useSpring(() => ({
    from: CLOSED
  }));

  const onTabChanged = useCallback((tab: Tab) => {
    setSelectedTab(tab);
  }, []);

  const onButtonClick = useCallback(() => {
    api.start({
      to: CLOSED,
      config: config.stiff,
      onRest: () => onClose()
    });
  }, [api, onClose]);

  useEffect(() => {
    api.start({
      to: OPEN,
      config: config.gentle
    });
  }, [api]);

  return (
    <>
      <animated.mesh
        position-x={OVERLAY_POSITION.x}
        position-y={positionY}
        position-z={OVERLAY_POSITION.z}
      >
        <planeGeometry args={[BORDER_WIDTH, BORDER_HEIGHT]} />
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={'#000F2e'}
          opacity={opacity}
        />
        <Wireframe simplify={true} stroke={'white'} backfaceStroke={'white'} thickness={0.01}/>

        <Heading position={HEADING_POSITION} opacity={opacity} text={'OPTIONS'} />

        <Tabs onTabChanged={onTabChanged} />

        {selectedTab === 'AUDIO' ? <Audio opacity={opacity} />  : null}
        {selectedTab === 'EFFECTS' ? <Effects opacity={opacity} />  : null}

        <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} opacity={opacity} onButtonClick={onButtonClick} />
      </animated.mesh>
    </>
  )
}

export { Options };