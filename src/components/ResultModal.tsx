import { useEffect, useState, useRef } from "react";
import { Modal } from "antd";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import type { Mesh, Group } from "three";
import type { Item } from "../types";
import { getRarity } from "../lib/rarity";
import { playVictorySound } from "../lib/sound";
import UserAvatar from "./UserAvatar";

function WinnerStage3D() {
  const stageRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (stageRef.current) {
      stageRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <group ref={stageRef} position={[0, -0.6, 0]}>
      {/* 3D Gold Platform Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.8, 2.2, 0.4, 32]} />
        <meshStandardMaterial color="#1a2230" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Glowing Neon Ring */}
      <mesh ref={ringRef} position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#ffd700" side={2} />
      </mesh>

      {/* Floating 3D Diamond / Trophy Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={0.8}>
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
        </mesh>
      </Float>

      <Sparkles count={40} scale={[3, 2, 3]} size={3.5} speed={1} color="#ffd700" />
    </group>
  );
}

type Props = {
  result: Item | null;
  onClose: () => void;
};

export default function ResultModal({ result, onClose }: Props) {
  const [showFireworks, setShowFireworks] = useState(false);

  const FIREWORKS_URL =
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVnbHk1N20yOWtkZmVvbDAyMXcwZm81ZmV1cm84eWRjb3dja2Z6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/S3bp48refqWzwxx70g/giphy.gif";

  useEffect(() => {
    if (!result) {
      setShowFireworks(false);
      return;
    }

    playVictorySound();
    setShowFireworks(true);
    const timer = setTimeout(() => {
      setShowFireworks(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [result]);

  if (!result) return null;

  const rarity = getRarity(result.id);

  return (
    <Modal
      open={!!result}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="cs-result-modal"
      styles={{
        content: {
          backgroundColor: "#0d1117",
          border: `2px solid ${rarity.color}`,
          boxShadow: `0 0 45px -5px ${rarity.glowColor}`,
          borderRadius: "20px",
          padding: "24px",
          overflow: "hidden",
        },
      }}
    >
      <div className="relative flex flex-col items-center gap-4 text-center py-2 min-h-[380px] justify-between">
        {/* Background 3D Showcase Stage Canvas */}
        <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
          <Canvas camera={{ position: [0, 1, 3.8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 5, 2]} intensity={2} color="#ffd700" />
            <pointLight position={[-3, 1, -2]} intensity={1.5} color="#00f2fe" />
            <WinnerStage3D />
          </Canvas>
        </div>

        {/* Fireworks overlay */}
        {showFireworks && (
          <img
            src={FIREWORKS_URL}
            alt="fireworks"
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] z-50 opacity-90"
          />
        )}

        {/* Top Header Tag */}
        <div
          className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse z-10 font-gaming"
          style={{
            backgroundColor: rarity.bgColor,
            color: rarity.color,
            border: `1px solid ${rarity.color}`,
          }}
        >
          ★ CHIẾN THẮNG HÔM NAY ★
        </div>

        {/* Winner Avatar Card Spotlight */}
        <div
          className="relative z-10 group p-2.5 rounded-2xl border-2 transition-transform duration-500 animate-spin-victory shadow-2xl"
          style={{
            borderColor: rarity.color,
            boxShadow: `0 0 40px ${rarity.glowColor}`,
            backgroundColor: "rgba(13, 17, 23, 0.95)",
          }}
        >
          <UserAvatar
            src={result.image}
            name={result.name}
            size={180}
            className="rounded-xl shadow-lg"
          />
        </div>

        {/* Winner Info */}
        <div className="space-y-1 z-10">
          <h2 className="text-2xl font-extrabold text-white font-gaming tracking-wide">
            {result.name}
          </h2>
          <p className="text-sm font-semibold text-yellow-400">
            🍚 Bạn đã trúng giải người đi lấy cơm cho nhóm!
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl cs-btn-gold text-sm z-10 font-gaming"
        >
          ĐÃ HIỂU - ĐI LẤY CƠM NGAY! 🚀
        </button>
      </div>
    </Modal>
  );
}
