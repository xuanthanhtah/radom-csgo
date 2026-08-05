import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Html } from "@react-three/drei";
import type { Mesh, Group } from "three";
import type { Item } from "../types";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type CrateProps = {
  isSpinning: boolean;
  winner: Item | null;
};

function CSGOWeaponCrate({ isSpinning, winner }: CrateProps) {
  const groupRef = useRef<Group>(null);
  const lidRef = useRef<Mesh>(null);
  const winnerCardRef = useRef<Group>(null);

  useFrame((_, delta) => {
    // Idle rotation when not inspecting winner
    if (groupRef.current && !isSpinning && !winner) {
      groupRef.current.rotation.y += delta * 0.35;
    }

    // Lid animation: open when spinning or when showing winner
    if (lidRef.current) {
      const targetLidAngle = winner ? -Math.PI * 0.65 : isSpinning ? -Math.PI * 0.55 : 0;
      lidRef.current.rotation.x += (targetLidAngle - lidRef.current.rotation.x) * delta * 6;
    }

    // Winner card rising animation from inside crate
    if (winnerCardRef.current) {
      const targetY = winner ? 1.6 : 0;
      const targetScale = winner ? 1 : 0.001;
      winnerCardRef.current.position.y += (targetY - winnerCardRef.current.position.y) * delta * 5;
      winnerCardRef.current.scale.x += (targetScale - winnerCardRef.current.scale.x) * delta * 5;
      winnerCardRef.current.scale.y += (targetScale - winnerCardRef.current.scale.y) * delta * 5;
      winnerCardRef.current.scale.z += (targetScale - winnerCardRef.current.scale.z) * delta * 5;
    }
  });

  const rarity = winner ? getRarity(winner.id) : null;

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Crate Base */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 1.4]} />
        <meshStandardMaterial
          color="#1e2530"
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Crate Metallic Reinforcement Ribs */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.46, 1.24, 0.4]} />
        <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.3, 1.24, 1.46]} />
        <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.3, 1.24, 1.46]} />
        <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Crate Lock Emblem */}
      <mesh position={[0, 0, 0.72]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
      </mesh>

      {/* Crate Opening Lid */}
      <group position={[0, 0.6, -0.7]}>
        <mesh ref={lidRef} position={[0, 0, 0.7]}>
          <boxGeometry args={[2.44, 0.18, 1.44]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 3D Winner Reveal Card rising up out of crate */}
      <group ref={winnerCardRef} position={[0, 0, 0]} scale={[0.001, 0.001, 0.001]}>
        {winner && rarity && (
          <Html center distanceFactor={4} transform sprite={false} zIndexRange={[100, 0]}>
            <div
              className="p-3.5 rounded-2xl border-2 shadow-2xl flex flex-col items-center gap-2 select-none animate-spin-victory"
              style={{
                borderColor: rarity.color,
                backgroundColor: "rgba(13, 17, 23, 0.95)",
                boxShadow: `0 0 35px ${rarity.glowColor}`,
                width: 220,
              }}
            >
              <div
                className="w-full py-0.5 text-[10px] font-bold text-center uppercase tracking-widest rounded"
                style={{ backgroundColor: rarity.bgColor, color: rarity.color }}
              >
                ★ CHIẾN THẮNG HÔM NAY ★
              </div>

              <UserAvatar
                src={winner.image}
                name={winner.name}
                size={96}
                className="rounded-xl border-2 border-yellow-500 shadow-md"
              />

              <div className="text-center">
                <div className="font-extrabold text-white text-base font-gaming">
                  {winner.name}
                </div>
                <div className="text-[11px] font-bold text-yellow-400 mt-0.5">
                  🍚 Đi lấy cơm ngay!
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Inside Light & Sparkles when Lid Opens or Winner Revealed */}
      {(isSpinning || winner) && (
        <group position={[0, 0.4, 0]}>
          <pointLight color="#ffcc00" intensity={winner ? 6 : 4} distance={4} />
          <Sparkles
            count={winner ? 60 : 40}
            scale={[3, 2, 2]}
            size={winner ? 5 : 4}
            speed={2}
            color={winner ? "#ffd700" : "#00f2fe"}
          />
        </group>
      )}
    </group>
  );
}

type Props = {
  isSpinning?: boolean;
  winner?: Item | null;
  onCloseWinner?: () => void;
};

export default function CSCase3D({
  isSpinning = false,
  winner = null,
  onCloseWinner,
}: Props) {
  return (
    <div className="w-full h-72 sm:h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border border-yellow-500/50 shadow-2xl transition-all">
      {/* Top Banner overlay */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-10 flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest font-gaming">
            3D UNBOXING ENGINE
          </span>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-900/80 px-2 py-1 rounded border border-gray-800">
          🖱️ Kéo để xoay 360°
        </span>
      </div>

      {/* Bottom Winner Action Overlay */}
      {winner && (
        <div className="absolute bottom-3 inset-x-4 z-20 flex justify-center">
          <button
            onClick={onCloseWinner}
            className="px-6 py-2.5 rounded-xl cs-btn-gold text-xs sm:text-sm font-bold shadow-2xl font-gaming animate-gold-pulse"
          >
            ✅ XÁC NHẬN {winner.name.toUpperCase()} ĐÃ ĐI LẤY CƠM!
          </button>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.4, 4.8], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={2} color="#ffffff" castShadow />
        <pointLight position={[-5, 2, -3]} intensity={1.5} color="#00f2fe" />
        <pointLight position={[5, -2, 3]} intensity={1.5} color="#f5af19" />

        <Float speed={winner ? 0.5 : 1.5} rotationIntensity={winner ? 0.2 : 0.5} floatIntensity={0.5}>
          <CSGOWeaponCrate isSpinning={isSpinning} winner={winner} />
        </Float>

        <Sparkles count={40} scale={6} size={3} speed={0.5} color="#ffd700" />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 3.5} />
      </Canvas>
    </div>
  );
}
