import {Plane, Text} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useEffect, useState} from "react";
import {Border} from "../border/border.tsx";
import {Button} from "../button/button.tsx";
import {Vector3} from "three";
import {Sound} from "../../sound.ts";
import {Slider} from "../uikit/slider.tsx";
import {Root} from "@react-three/uikit";

const OVERLAY_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay4Offset});
const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;
const BORDER_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1 - (BORDER_WIDTH * 0.5), y: -1 + (BORDER_HEIGHT * 0.5), z: TetrisConstants.z.overlay5Offset});
const HEADING_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +8.5, z: TetrisConstants.z.overlay4Offset});

const MUSIC_VOLUME_LABEL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +5.5, z: TetrisConstants.z.overlay4Offset});
const SFX_VOLUME_LABEL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 +0.5, z: TetrisConstants.z.overlay4Offset});

const CLOSE_BUTTON_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1 -8, z: TetrisConstants.z.overlay4Offset});

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
          transformTranslateX={1200}
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

const Options = ({ onClose }: { onClose: () => void }) => {
  const [musicVolume, setMusicVolume] = useState(Sound.getInstance().musicVolume() * 10);
  const [sfxVolume, setSfxVolume] = useState(Sound.getInstance().soundFXVolume() * 10);
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: {
      duration: 300
    }
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

  useEffect(() => {
    api.start({ to: { opacity: 1 } });
  }, [api]);

  return (
    <>
      <Plane position={OVERLAY_POSITION} args={[BORDER_WIDTH, BORDER_HEIGHT]}>
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent={true}
          color={TetrisConstants.color.black}
          opacity={opacity}
        />
      </Plane>
      <Border position={BORDER_POSITION} width={BORDER_WIDTH} height={BORDER_HEIGHT} />

      <Heading position={HEADING_POSITION} opacity={opacity} text={'OPTIONS'} />

      <LabelValue position={MUSIC_VOLUME_LABEL_POSITION} opacity={opacity} label={'Music Volume'} value={musicVolume}/>
      <VolumeSlider translateY={-1800} initialValue={musicVolume} onVolumeChange={onMusicVolumeChange} />

      <LabelValue position={SFX_VOLUME_LABEL_POSITION} opacity={opacity} label={'SFX Volume'} value={sfxVolume}/>
      <VolumeSlider translateY={+700} initialValue={sfxVolume} onVolumeChange={onSfxVolumeChange} />

      <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} onButtonClick={onClose} />
    </>
  )
}

export { Options };