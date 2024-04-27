/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Text, Wireframe} from "@react-three/drei";
import {TetrisConstants} from "../../tetrisConstants.ts";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {GridUtils} from "../playfield/playfield.tsx";
import {useCallback, useContext, useEffect} from "react";
import {Button} from "../button/button.tsx";
import {Vector3} from "three";
import {AppContext, Score} from "../context/AppContext.tsx";

const BORDER_WIDTH = TetrisConstants.gameWidth - 2;
const BORDER_HEIGHT = TetrisConstants.gameHeight - 2;

const MODAL_POSITION = GridUtils.gridPosToScreen(TetrisConstants.center).add({x: -1, y: -1, z: TetrisConstants.z.overlay4Offset});

const HEADING_POSITION = new Vector3(0, 8.5, 0.01);

const CONTENT_POSITION = new Vector3(0, 6.5, 0.05);

const CLOSE_BUTTON_POSITION = new Vector3(0, -8, 0);

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

const Content = ({ x, opacity, text, fontSize=0.6, isBold=false }: { x: number, opacity: SpringValue<number>, text: string, fontSize?: number, isBold?: boolean }) => {
  return (
    <Text position-x={x} fontSize={fontSize} letterSpacing={isBold ? 0.1 : 0.05} outlineWidth={isBold ? 0.04 : 0.01} outlineColor={0xFFFFFF}>
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

const str = (value: number) : string => value === -1 ? '_' : `${value}`;

const Table = ({ scores, opacity }: { scores: Score[]; opacity: SpringValue<number> }) => {
  const content: [string, string, string][] = [];
  content.push(['SCORE', 'LEVEL', 'LINES']);
  scores.forEach(score => {
    content.push([str(score.score), str(score.level), str(score.lines)]);
  })
  while (content.length < 11) {
    content.push([str(-1), str(-1), str(-1)]);
  }

  return (
    <>
      {content.map((text, index) => {
        const isBold = (index <= 1);
        const fontSize = (index === 1) ? 0.9 : 0.6;
        const yOffset = (index === 0) ? 0 : (index === 1) ? 1.2 : 1.2 + (index - 1) * 1.07
        const y = CONTENT_POSITION.y - yOffset;
        return (
          <group
            key={`${index}`}
            position-x={CONTENT_POSITION.x}
            position-y={y}
            position-z={CONTENT_POSITION.z}
          >
            {index > 0 ? <Content x={-4.5} opacity={opacity} text={`#${index}`} fontSize={fontSize} isBold={isBold} /> : null}
            <Content x={-2} opacity={opacity} text={text[0]} fontSize={fontSize} isBold={isBold} />
            <Content x={1.5} opacity={opacity} text={text[1]} fontSize={fontSize} isBold={isBold} />
            <Content x={4.5} opacity={opacity} text={text[2]} fontSize={fontSize} isBold={isBold} />
          </group>
        )
      })}
    </>
  )
};

const CLOSED = {
  opacity: 0,
  positionY: MODAL_POSITION.y - 20
};
const OPEN = {
  opacity: 1,
  positionY: MODAL_POSITION.y
};

const BestScores = ({ onClose }: { onClose: () => void }) => {
  const {appState} = useContext(AppContext)!;
  const [{ opacity, positionY }, api] = useSpring(() => ({
    from: CLOSED
  }));

  const onButtonClick = useCallback(() => {
    api.start({
      to: CLOSED,
      config: { duration: 100 },
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
        position-x={MODAL_POSITION.x}
        position-y={positionY}
        position-z={MODAL_POSITION.z}
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

        <Heading position={HEADING_POSITION} opacity={opacity} text={'BEST SCORES'} />
        <Table opacity={opacity} scores={appState.bestScores} />
        <Button position={CLOSE_BUTTON_POSITION} label={'CLOSE'} opacity={opacity} onButtonClick={onButtonClick} />
      </animated.mesh>
    </>
  )
}

export { BestScores };