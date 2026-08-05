import { useEffect, useState } from "react";
import { Modal } from "antd";
import type { Item } from "../types";
import { getRarity } from "../lib/rarity";
import { playVictorySound } from "../lib/sound";
import UserAvatar from "./UserAvatar";

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
      width={480}
      className="cs-result-modal"
      styles={{
        content: {
          backgroundColor: "#161b22",
          border: `2px solid ${rarity.color}`,
          boxShadow: `0 0 40px -5px ${rarity.glowColor}`,
          borderRadius: "16px",
          padding: "24px",
        },
      }}
    >
      <div className="relative flex flex-col items-center gap-5 text-center py-2">
        {/* Fireworks overlay */}
        {showFireworks && (
          <img
            src={FIREWORKS_URL}
            alt="fireworks"
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] z-50 opacity-90"
          />
        )}

        {/* Top Header Tag */}
        <div
          className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse"
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
          className="relative group p-2 rounded-2xl border-2 transition-transform duration-500 animate-spin-victory shadow-2xl"
          style={{
            borderColor: rarity.color,
            boxShadow: `0 0 35px ${rarity.glowColor}`,
            backgroundColor: "rgba(13, 17, 23, 0.95)",
          }}
        >
          <UserAvatar
            src={result.image}
            name={result.name}
            size={192}
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
          className="w-full py-3 rounded-lg cs-btn-gold text-sm z-10 mt-2"
        >
          ĐÃ HIỂU - ĐI LẤY CƠM NGAY! 🚀
        </button>
      </div>
    </Modal>
  );
}
