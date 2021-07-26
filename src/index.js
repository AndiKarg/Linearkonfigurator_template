import { OrbitControls, Text } from 'drei'
import React, { useContext, useState } from 'react'
import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'
import { BoxBufferGeometry, EdgesGeometry, FrontSide } from 'three'
import { useTweaks } from 'use-tweaks'
import './styles.css'

const feet = 12
const longWidth = 8 * feet
const shortWidth = (8 * feet) / 3 //slightly less for kerf
const legHeight = (8 * feet) / 3 //slightly less for kerf
const floorBoardSeparation = (shortWidth - 1.5 * 2) / 5 //5.5 + 1 / 4
//const wallBoardSeparation = 5.5 + oneSixteenth
const ninetyDegrees = Math.PI / 2
const inchUnits = 0.0254

const geometry = new BoxBufferGeometry(1, 1, 1)
const edgesGeometry = new EdgesGeometry(geometry)

const TweaksContext = React.createContext()

function Board(props) {
  const { x = 0, y = 0, z = 0, length = 12, width = 3.5, thickness = 1.5 } = props
  const { explode, wireframe } = useContext(TweaksContext)
  const xyz = [x * explode, y * explode, z * explode]
  const dimensions = [length, width, thickness]
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <group {...props} position={xyz}>
        <mesh
          castShadow
          receiveShadow
          scale={dimensions}
          geometry={geometry}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHovered(false)
          }}>
          <meshStandardMaterial color={hovered ? 0x666666 : 0x666655} />
        </mesh>
        <lineSegments geometry={edgesGeometry} scale={dimensions}>
          <lineBasicMaterial color={0x444433} depthTest={!wireframe} />
        </lineSegments>
        {hovered && (
          <>
            <Text castShadow fontSize={Math.max(2.5, width)} position-z={thickness} outlineWidth="2%">
              {thickness}" x {width}" x {length}"
              <meshBasicMaterial side={FrontSide} depthTest={false} />
            </Text>
            <Text castShadow fontSize={Math.max(2.5, width)} position-z={-thickness} rotation-y={Math.PI} outlineWidth="2%">
              {thickness}" x {width}" x {length}"
              <meshBasicMaterial side={FrontSide} depthTest={false} />
            </Text>
          </>
        )}
      </group>
    </>
  )
}

function TwoBySix(props) {
  return <Board {...props} width={5.5} thickness={1.5} />
}

function Wall(props) {
  const top = legHeight - 5.5 / 2
  const step = 5.5 // + oneSixteenth
  return (
    <>
      <TwoBySix {...props} length={props.length} y={top} />
      <TwoBySix {...props} length={props.length} y={top - step} />
      <TwoBySix {...props} length={props.length} y={top - step * 2} />
    </>
  )
}

function Bar(props) {
  const top = legHeight - 5.5 / 2
  const step = 5.5 // + oneSixteenth
  return (
    <>
      <TwoBySix {...props} length={50} y={top} />
      <TwoBySix {...props} length={100} y={top - step} />
      <TwoBySix {...props} length={150} y={top - step * 2} />
    </>
  )
}

function Scene() {
  const tweakValues = useTweaks({
    explode: { value: 1, min: 1, max: 2 },
    wireframe: false
  })

  return (
    <Canvas camera={{ position: [1, 1.6, 2] }} shadowMap>
      <OrbitControls />
      <ambientLight intensity={1} />
      <directionalLight
        intensity={0.7}
        position={[1, 5, 2]}
        castShadow
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
        shadow-camera-left={-3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-right={3}
        shadow-camera-near={1}
        shadow-camera-far={7}
      />
      <fog attach="fog" args={[0xffffff, 100, 700]} />

      <TweaksContext.Provider value={tweakValues}>
        <group scale={[inchUnits, inchUnits, inchUnits]}>
          <Wall length={longWidth} z={shortWidth / 2 - 1.5 / 2} />
          <Wall length={longWidth} z={-shortWidth / 2 + 1.5 / 2} />

          <Bar length={longWidth} z={-shortWidth / 2 + 1.5 / 2} />

          <mesh rotation-x={-ninetyDegrees} receiveShadow>
            <circleBufferGeometry args={[20 * feet, 128]} />
            <meshStandardMaterial color={0xbbffbb} />
          </mesh>
        </group>
      </TweaksContext.Provider>
    </Canvas>
  )
}

ReactDOM.render(<Scene />, document.getElementById('root'))
