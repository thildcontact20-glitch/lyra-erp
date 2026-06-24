'use client'
import { Canvas } from '@react-three/fiber'
import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import * as THREE from 'three'

function Scene3D() {
  const meshRef = useRef<THREE.Points>(null!)
  const count = 200
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20
  }
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#C9A961" transparent opacity={0.3} />
    </points>
  )
}

export default function ImmersiveBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <Scene3D />
      </Canvas>
    </div>
  )
}
