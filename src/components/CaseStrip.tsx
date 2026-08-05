import React from "react";
import type { Item } from "../types";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type Props = {
  repeated: Item[];
  stripRef: React.RefObject<HTMLDivElement>;
  itemWidth: number;
  initialTranslate: number;
  containerWidth?: number;
  itemGap?: number;
};

export default function CaseStrip({
  repeated,
  stripRef,
  itemWidth,
  initialTranslate,
  containerWidth,
  itemGap = 24,
}: Props) {
  return (
    <div className="relative w-full max-w-full my-4">
      {/* Top Pointer Arrow */}
      <div className="cs-marker-pointer-top" />
      {/* Bottom Pointer Arrow */}
      <div className="cs-marker-pointer-bottom" />
      {/* Center Vertical Laser Line */}
      <div className="cs-marker-laser" />

      {/* Track Container */}
      <div
        className="overflow-hidden rounded-xl border border-gray-700/80 bg-gradient-to-b from-gray-900/90 to-gray-950/90 shadow-2xl relative"
        style={{
          height: 190,
          width: "100%",
          maxWidth: containerWidth ?? "100%",
        }}
      >
        <div
          ref={stripRef}
          className="flex items-center h-full py-3"
          style={{
            transform: `translateX(-${initialTranslate}px)`,
            gap: itemGap,
            willChange: "transform",
          }}
        >
          {repeated.map((it) => {
            const rarity = getRarity((it as any).originalId || it.id);
            return (
              <div
                key={it.id}
                className="flex-shrink-0 relative rounded-lg border flex flex-col items-center justify-between overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105"
                style={{
                  width: itemWidth,
                  height: 160,
                  backgroundColor: "rgba(22, 27, 34, 0.95)",
                  borderColor: rarity.borderColor,
                  boxShadow: `0 4px 15px -3px ${rarity.glowColor}`,
                }}
              >
                {/* Rarity Tag Header */}
                <div
                  className="w-full text-[10px] font-bold tracking-widest text-center py-0.5 uppercase"
                  style={{
                    backgroundColor: rarity.bgColor,
                    color: rarity.color,
                  }}
                >
                  {rarity.tag}
                </div>

                {/* Avatar Image */}
                <div className="flex-1 w-full flex items-center justify-center p-2">
                  <UserAvatar
                    src={it.image}
                    name={it.name}
                    size={88}
                    className="rounded-md border border-gray-700/60 shadow-md"
                  />
                </div>

                {/* Name Label */}
                <div className="w-full bg-gray-900/95 py-1 px-2 text-center text-xs font-semibold text-gray-200 truncate border-t border-gray-800">
                  {it.name}
                </div>

                {/* Bottom Rarity Color Stripe */}
                <div
                  className="w-full h-1"
                  style={{ backgroundColor: rarity.color }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
