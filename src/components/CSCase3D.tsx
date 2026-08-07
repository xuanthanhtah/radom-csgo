import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Group } from "three";
import type { Item } from "../types";
import { getRarity } from "../lib/rarity";
import { playVictorySound } from "../lib/sound";
import UserAvatar from "./UserAvatar";

// Dynamic 2D Fireworks Canvas shooting rockets from left & right sides
function SideFireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
      gravity: number;
    };

    let particles: Particle[] = [];
    const colors = ["#ffd700", "#ffaa00", "#00f2fe", "#ff4081", "#ffffff", "#e040fb", "#7c4dff"];

    const createExplosion = (startX: number, startY: number) => {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 2,
          decay: Math.random() * 0.014 + 0.008,
          gravity: 0.07,
        });
      }
    };

    // Launch rocket explosions from Left and Right sides of screen
    const triggerSideBursts = () => {
      // Left side burst
      createExplosion(width * 0.12 + Math.random() * width * 0.08, height * 0.2 + Math.random() * height * 0.25);
      // Right side burst
      createExplosion(width * 0.8 + Math.random() * width * 0.08, height * 0.2 + Math.random() * height * 0.25);
    };

    triggerSideBursts();
    const interval = setInterval(triggerSideBursts, 1100);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 top-0 left-0 pointer-events-none z-30 w-screen h-screen" />;
}

type CrateProps = {
  winner: Item | null;
};

function CSGOWeaponCrate({ winner }: CrateProps) {
  const crateGroupRef = useRef<Group>(null);
  const lidRef = useRef<Mesh>(null);
  const winnerCardRef = useRef<Group>(null);
  const shockwaveRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);

  // Physics & Animation state refs
  const lidAngleRef = useRef(0);
  const lidVelRef = useRef(0);

  const cardYRef = useRef(0.1);
  const cardVelYRef = useRef(0);
  const cardScaleRef = useRef(0.001);
  const cardRotYRef = useRef(0);

  const shockwaveScaleRef = useRef(0.1);
  const shockwaveOpacityRef = useRef(0);

  const prevWinnerRef = useRef<Item | null>(null);

  // Trigger burst sound and jump impulse when winner opens
  useEffect(() => {
    if (winner && !prevWinnerRef.current) {
      playVictorySound();

      // Launch high spring jump impulse
      cardYRef.current = 0.2;
      cardVelYRef.current = 11.5; // High upward jump impulse!
      cardScaleRef.current = 0.1;
      cardRotYRef.current = -Math.PI * 2; // 360-degree flip spin

      // Lid pop impulse back
      lidVelRef.current = -20.0;

      // Shockwave burst
      shockwaveScaleRef.current = 0.2;
      shockwaveOpacityRef.current = 1.0;
    }
    prevWinnerRef.current = winner;
  }, [winner]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.getElapsedTime();

    // 1. Lid opening animation with damped spring recoil
    const targetLidAngle = winner ? -Math.PI * 0.75 : 0;
    const lidSpring = 160;
    const lidDamping = 11;
    const lidForce = (targetLidAngle - lidAngleRef.current) * lidSpring;
    lidVelRef.current += (lidForce - lidVelRef.current * lidDamping) * delta;
    lidAngleRef.current += lidVelRef.current * delta;

    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngleRef.current;
    }

    // 2. Winner Card Spring Jump Animation ("người trong hòm nhảy lên")
    if (winner) {
      const hoverY = 1.95 + Math.sin(time * 2.8) * 0.1;
      const springTension = 55;
      const springDamping = 6.5;

      const forceY = (hoverY - cardYRef.current) * springTension;
      cardVelYRef.current +=
        (forceY - cardVelYRef.current * springDamping) * delta;
      cardYRef.current += cardVelYRef.current * delta;

      // Scale up with elastic overshoot
      const targetScale = 1.0;
      cardScaleRef.current += (targetScale - cardScaleRef.current) * delta * 8;

      // Unwind spin rotation towards 0
      cardRotYRef.current += (0 - cardRotYRef.current) * delta * 7;
    } else {
      cardYRef.current += (0.1 - cardYRef.current) * delta * 10;
      cardScaleRef.current += (0.001 - cardScaleRef.current) * delta * 10;
      cardRotYRef.current = 0;
      cardVelYRef.current = 0;
    }

    if (winnerCardRef.current) {
      winnerCardRef.current.position.y = cardYRef.current;
      const s = Math.max(0.001, cardScaleRef.current);
      winnerCardRef.current.scale.set(s, s, s);
      winnerCardRef.current.rotation.y = cardRotYRef.current;
    }

    // 3. Floating Neon Pedestal under winner avatar
    if (ringRef.current) {
      ringRef.current.position.y = cardYRef.current - 0.65;
      ringRef.current.rotation.y += delta * 1.5;
    }

    // 4. Shockwave ring expansion & fade out
    if (shockwaveRef.current) {
      if (shockwaveOpacityRef.current > 0.01) {
        shockwaveScaleRef.current += delta * 6.0;
        shockwaveOpacityRef.current -= delta * 1.5;
        shockwaveRef.current.scale.set(
          shockwaveScaleRef.current,
          shockwaveScaleRef.current,
          1,
        );
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = Math.max(0, shockwaveOpacityRef.current);
      } else {
        shockwaveRef.current.scale.set(0, 0, 0);
      }
    }

    // 5. Crate subtle alignment
    if (crateGroupRef.current) {
      if (winner) {
        crateGroupRef.current.rotation.y +=
          (0 - crateGroupRef.current.rotation.y) * delta * 5;
      }
    }
  });

  const rarity = winner ? getRarity(winner.id) : null;
  const themeColor = rarity ? rarity.color : "#ffd700";

  return (
    <group
      ref={crateGroupRef}
      position={[0, -0.6, 0]}
      scale={[0.55, 0.55, 0.55]}
    >
      {/* Crate Main Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 1.4]} />
        <meshStandardMaterial
          color="#1e2530"
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Metallic Reinforcement Frames */}
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

      {/* Glowing Front Lock Emblem */}
      <mesh position={[0, 0, 0.72]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          metalness={1}
          roughness={0.1}
          emissive="#ffaa00"
          emissiveIntensity={winner ? 1.5 : 0}
        />
      </mesh>

      {/* Crate Opening Lid */}
      <group position={[0, 0.6, -0.7]}>
        <mesh ref={lidRef} position={[0, 0, 0.7]}>
          <boxGeometry args={[2.44, 0.18, 1.44]} />
          <meshStandardMaterial
            color="#2c3e50"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Horizontal Shockwave Ring on Opening */}
      <mesh
        ref={shockwaveRef}
        position={[0, 0.65, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.2, 2.2, 32]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Neon Pedestal underneath Winner Avatar */}
      <group ref={ringRef} position={[0, 1.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.07, 16, 32]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={winner ? 2.2 : 0}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 3D Winner Reveal Card Jumping out of crate */}
      <group
        ref={winnerCardRef}
        position={[0, 0, 0]}
        scale={[0.001, 0.001, 0.001]}
      >
        {winner && rarity && (
          <Html
            center
            distanceFactor={3.6}
            transform
            sprite={false}
            zIndexRange={[100, 0]}
          >
            <div
              className="p-4 rounded-2xl border-2 shadow-2xl flex flex-col items-center gap-2.5 select-none animate-spin-victory relative overflow-hidden backdrop-blur-md"
              style={{
                borderColor: rarity.color,
                backgroundColor: "rgba(13, 17, 23, 0.96)",
                boxShadow: `0 0 50px ${rarity.glowColor}, inset 0 0 20px ${rarity.glowColor}`,
                width: 250,
              }}
            >
              {/* Shimmer line top overlay */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: rarity.color }}
              />

              <div
                className="w-full py-1 text-[11px] font-black text-center uppercase tracking-widest rounded shadow-md font-gaming flex items-center justify-center gap-1"
                style={{
                  backgroundColor: rarity.bgColor,
                  color: rarity.color,
                  border: `1px solid ${rarity.color}`,
                }}
              >
                <span>🏆 CHIẾN THẮNG 🏆</span>
              </div>

              <div className="relative group">
                <UserAvatar
                  src={winner.image}
                  name={winner.name}
                  size={112}
                  className="rounded-2xl border-2 border-yellow-400 shadow-xl object-cover"
                />
                <div className="absolute -bottom-2.5 inset-x-0 flex justify-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-500 text-black border border-yellow-300 shadow uppercase tracking-wider">
                    {rarity.tag}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <div className="font-extrabold text-white text-xl font-gaming drop-shadow">
                  {winner.name}
                </div>
                <div className="text-xs font-bold text-yellow-400 mt-1 flex items-center justify-center gap-1">
                  <span>🍚</span>
                  <span>ĐI LẤY CƠM NGAY!</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Inside Light & Burst Sparkles */}
      {winner && (
        <group position={[0, 0.4, 0]}>
          <pointLight color={themeColor} intensity={22} distance={10} />
          <Sparkles
            count={140}
            scale={[6, 5, 6]}
            size={7}
            speed={2.8}
            color={themeColor}
          />
        </group>
      )}
    </group>
  );
}

// 6 Moving Theater Stage Spotlights (3 from top-left screen corner, 3 from top-right screen corner aiming directly at chest)
function MovingTheaterSpotlights() {
  const meshRef0 = useRef<Mesh>(null);
  const meshRef1 = useRef<Mesh>(null);
  const meshRef2 = useRef<Mesh>(null);
  const meshRef3 = useRef<Mesh>(null);
  const meshRef4 = useRef<Mesh>(null);
  const meshRef5 = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const meshRefs = [meshRef0, meshRef1, meshRef2, meshRef3, meshRef4, meshRef5];

    // 3 Left screen corner origins
    const leftOrigins = [
      new THREE.Vector3(-9.5, 6.8, 0.5),
      new THREE.Vector3(-8.8, 6.4, 0.5),
      new THREE.Vector3(-8.1, 6.0, 0.5),
    ];

    // 3 Right screen corner origins
    const rightOrigins = [
      new THREE.Vector3(8.1, 6.0, 0.5),
      new THREE.Vector3(8.8, 6.4, 0.5),
      new THREE.Vector3(9.5, 6.8, 0.5),
    ];

    const origins = [...leftOrigins, ...rightOrigins];
    const chestPos = new THREE.Vector3(0, -0.6, 0);

    origins.forEach((origin, i) => {
      const mesh = meshRefs[i].current;
      if (!mesh) return;

      // Dynamic target movement swaying around the chest [0, -0.6, 0]
      const targetOffset = new THREE.Vector3(
        Math.sin(time * (1.4 + i * 0.2) + i * 1.2) * 1.3 + (i < 3 ? -0.5 : 0.5),
        Math.cos(time * (1.2 + i * 0.15) + i * 0.8) * 0.4,
        Math.sin(time * 1.5 + i) * 0.5
      );

      const currentTarget = chestPos.clone().add(targetOffset);
      const midPoint = origin.clone().add(currentTarget).multiplyScalar(0.5);
      const distance = origin.distanceTo(currentTarget);

      mesh.position.copy(midPoint);
      mesh.scale.set(1, distance / 12.0, 1);

      mesh.lookAt(currentTarget);
      mesh.rotateX(Math.PI / 2);
    });
  });

  const beamColors = ["#ffd700", "#00f2fe", "#ff4081", "#7c4dff", "#ffe599", "#00e676"];

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef0}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[0]} transparent opacity={0.24} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef1}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[1]} transparent opacity={0.22} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef2}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[2]} transparent opacity={0.24} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef3}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[3]} transparent opacity={0.24} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef4}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[4]} transparent opacity={0.22} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef5}>
        <cylinderGeometry args={[1.8, 0.08, 12.0, 32, 1, true]} />
        <meshBasicMaterial color={beamColors[5]} transparent opacity={0.24} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

type Props = {
  winner: Item | null;
  onClose: () => void;
};

export default function CSCase3D({ winner, onClose }: Props) {
  // ESC key shortcut listener to close overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && winner) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [winner, onClose]);

  if (!winner) return null;

  const softGoldColor = "#ffe599";

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen overflow-hidden pointer-events-auto flex items-center justify-center animate-fade-in m-0 p-0">
      {/* Dynamic Fireworks Bursting from Left & Right Sides */}
      <SideFireworksCanvas />

      {/* Full-Screen Page-Wide Radial Glow Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0 backdrop-blur-md transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(26, 22, 15, 0.45) 0%, rgba(5, 7, 12, 0.95) 85%)`,
        }}
      />

      {/* Small Close Button '✕' Pinned to Top-Right of Viewport */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 w-11 h-11 rounded-full bg-gray-900/90 border border-yellow-500/60 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:scale-110 active:scale-95 flex items-center justify-center text-xl font-bold transition-all shadow-2xl cursor-pointer"
        title="Đóng (Esc)"
      >
        ✕
      </button>

      {/* Floating Victory Tag at Top Center of Screen */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2">
        <span className="px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs sm:text-sm font-black uppercase tracking-widest font-gaming shadow-2xl backdrop-blur-md flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping inline-block" />
          ★ KẾT QUẢ QUAY HÒM CS:GO ★
        </span>
      </div>

      {/* 100vw x 100vh Fullscreen 3D Stage Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 45 }}
        style={{ width: "100vw", height: "100vh", position: "absolute", inset: 0, background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />

        {/* Dynamic Moving Theater Stage Spotlights (3 from left, 3 from right) */}
        <MovingTheaterSpotlights />

        {/* Soft Gentle Champagne Gold Overhead Stage Spotlight */}
        <spotLight
          position={[0, 14, 5]}
          angle={0.9}
          penumbra={1.0}
          intensity={14}
          color={softGoldColor}
          castShadow
        />

        {/* Side Fill Spotlights for Soft Screen-Wide Rim Lights */}
        <spotLight position={[-8, 9, -3]} angle={0.7} penumbra={0.9} intensity={5} color="#fff2c2" />
        <spotLight position={[8, 9, 3]} angle={0.7} penumbra={0.9} intensity={5} color="#ffd700" />
        <directionalLight position={[0, 10, 6]} intensity={1.8} color="#ffffff" castShadow />

        <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.4}>
          <CSGOWeaponCrate winner={winner} />
        </Float>

        {/* Page-Wide Floating Gold Sparkle Dust */}
        <Sparkles
          count={150}
          scale={[14, 12, 14]}
          size={4.5}
          speed={1.0}
          color="#ffd700"
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.5}
        />
      </Canvas>
    </div>
  );
}
