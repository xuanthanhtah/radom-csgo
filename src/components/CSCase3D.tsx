import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshWobbleMaterial } from "@react-three/drei";
import type { Mesh } from "three";

function FloatingCrate() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.2}>
      {/* Outer Metallic CS:GO Crate */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2.2, 1.4, 1.4]} />
        <MeshWobbleMaterial
          color="#f39c12"
          factor={0.05}
          speed={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function CSCase3D() {
  return (
    <div className="w-full h-36 relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-950/20 via-gray-900/40 to-yellow-950/20 border border-yellow-500/30">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffcc00" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#ff6600" />
        <FloatingCrate />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6">
        <div>
          <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-bold uppercase tracking-widest">
            3D INTERACTIVE EXPERIENCE
          </span>
          <h3 className="text-lg font-bold text-white font-gaming mt-1">
            WEAPON CRATE #01
          </h3>
        </div>
      </div>
    </div>
  );
}
