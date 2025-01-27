import {Float, Text, Text3D, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {GridUtils} from "../playfield/playfield.tsx";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {useCallback, useEffect, useState} from "react";
import {Button} from "../button/button.tsx";
import {Color, Vector3} from "three";
import {useControls} from "leva";

const WELCOME_MESSAGE = [
  'WELCOME TO THE BLOCK PARTY.',
  "THE PLACE FOR GEOMETRIC CHAOS."
];

const MODAL_WIDTH = TetrisConstants.gameWidth;
const MODAL_HEIGHT = TetrisConstants.gameHeight-7.5;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay3Offset - 0.05});

const TEXT_POSITION = new Vector3(-7.6, 2.2, 1);

const WELCOME_MESSAGE_POSITION = new Vector3(0, -1, 0.01);

const CLOSE_BUTTON_POSITION  = new Vector3(0, -5, 0);

type CustomTextType = 'MESSAGE';

type CustomTextSettings = {
  fontSize: number,
  outlineWidth: number,
  color: Color,
  outlineColor: Color
};

const CUSTOM_TEXT_SETTINGS = new Map<CustomTextType, CustomTextSettings>([
  ['MESSAGE',     { fontSize: 0.7, outlineWidth: 0.04, color: new Color(0xFFFFFF), outlineColor: new Color(0xFFFFFF) }],
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

export type WelcomeMode = 'CLOSED' | 'OPEN';

type WelcomeProps = {
  mode: WelcomeMode,
  onEnter: () => void,
};

const Welcome = ({ mode, onEnter }: WelcomeProps) => {
  const [{ opacity, positionY }, api] = useSpring(() => ({ from: CLOSED }));
  const [showModal, setShowModal] = useState(false);
  const { title } = useControls('Welcome', {
    title: true
  });

  const open = useCallback(() => {
    api.start({
      to: OPEN,
      config: config.gentle
    });
  }, [api]);

  const onEnterButtonClick = useCallback(() => {
    onEnter();
    api.start({
      to: CLOSED,
      config: config.stiff,
      onRest: () => {
        setShowModal(false);
      }
    });
  }, [api, onEnter]);

  useEffect(() => {
    open();
  }, [open]);

  useEffect(() => {
    if (mode !== 'CLOSED') {
      setShowModal(true);
    }
  }, [mode]);

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

            {title ? (
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
            ) : null}
            {WELCOME_MESSAGE.map((text, index) => {
              const position = WELCOME_MESSAGE_POSITION.clone().add({x: 0, y: -index * 1.2, z: 0});
              return <CustomText type='MESSAGE' key={`${index}`} position={position} text={text}
                                 opacity={opacity}/>;
            })}
            <Button position={CLOSE_BUTTON_POSITION} label={'ENTER'} onButtonClick={onEnterButtonClick}
                    enableSound={false} opacity={opacity} enabled={true}/>
          </animated.mesh>
        </>
      ) : null}
    </>
  );
}

export {Welcome}