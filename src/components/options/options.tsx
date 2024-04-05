import {Text, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useEffect, useState} from "react";
import {Button} from "../button/button.tsx";
import {Vector3} from "three";
import {Sound} from "../../sound.ts";
import {Slider} from "../uikit/slider.tsx";
import {Root} from "@react-three/uikit";

const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay4Offset - 0.05});

const HEADING_POSITION = new Vector3(0, 8.5, 0.01);

const MUSIC_VOLUME_LABEL_POSITION = new Vector3(0, 5.5, 0.01);
const SFX_VOLUME_LABEL_POSITION = new Vector3(0, 0.5, 0.01);

const CLOSE_BUTTON_POSITION = new Vector3(0, -8, 0);

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

const LabelValue = ({ position, opacity, label, value }: { position: Vector3, opacity: SpringValue<number>, label: string, value: number }) => {
  return (
    <Text position={position} fontSize={0.8} letterSpacing={0.1} outlineWidth={0.03} outlineColor={0xFFFFFF}>
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={0xFFFFFF}
        opacity={opacity}
        transparent={true}
      />
      {label}: {Math.round(value).toString(10)}
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

const CLOSED = {
  opacity: 0,
  positionY: OVERLAY_POSITION.y + 22
};
const OPEN = {
  opacity: 1,
  positionY: OVERLAY_POSITION.y
};

const Options = ({ onClose }: { onClose: () => void }) => {
  const [musicVolume, setMusicVolume] = useState(Sound.getInstance().musicVolume() * 10);
  const [sfxVolume, setSfxVolume] = useState(Sound.getInstance().soundFXVolume() * 10);
  const [{ opacity, positionY }, api] = useSpring(() => ({
    from: CLOSED
  }));

  const onMusicVolumeChange = useCallback((value: number): void => {
    if (value !== musicVolume) {
      setMusicVolume(value);
      Sound.getInstance().setMusicVolume(roundToOneDecimalPlace(value * 0.1));
    }
  }, [sfxVolume]);

  const onSfxVolumeChange = useCallback((value: number): void => {
    if (value !== sfxVolume) {
      setSfxVolume(value);
      Sound.getInstance().setSoundFXVolume(roundToOneDecimalPlace(value * 0.1));
      Sound.getInstance().playSoundFX('COUNT');
    }
  }, [sfxVolume]);

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

        <LabelValue position={MUSIC_VOLUME_LABEL_POSITION} opacity={opacity} label={'Music Volume'} value={musicVolume}/>
        <VolumeSlider translateY={-1800} initialValue={musicVolume} onVolumeChange={onMusicVolumeChange} />

        <LabelValue position={SFX_VOLUME_LABEL_POSITION} opacity={opacity} label={'SFX Volume'} value={sfxVolume}/>
        <VolumeSlider translateY={+700} initialValue={sfxVolume} onVolumeChange={onSfxVolumeChange} />

        <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} opacity={opacity} onButtonClick={onButtonClick} />
      </animated.mesh>
    </>
  )
}

export { Options };