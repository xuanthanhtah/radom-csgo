import React from "react";
import type { Item } from "../types";

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
  itemGap,
}: Props) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-3xl playful-card"
        // Use full width of the parent but cap it with `maxWidth` so the
        // strip doesn't force the page to grow when many items are selected.
        style={{
          height: 180,
          width: "auto",
          maxWidth: containerWidth ?? "100%",
        }}
      >
        <div
          ref={stripRef}
          className={`flex items-center h-full`}
          style={{
            transform: `translateX(-${initialTranslate}px)`,
            gap: itemGap ?? 0,
          }}
        >
          {repeated.map((it) => (
            <div
              key={it.id}
              className="flex-shrink-0 bg-gradient-to-br from-kid-yellow/30 to-kid-pink/10 hover:scale-105 transform transition-transform duration-300 rounded-xl shadow-lg flex flex-col items-center justify-center"
              style={{ width: itemWidth, height: 140 }}
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-full h-28 object-cover rounded-t animate-float-slow"
                />
              ) : (
                <div className="w-full h-28 bg-gray-100 flex items-center justify-center">
                  No image
                </div>
              )}
              <div className="p-2 text-sm text-center">{it.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 h-full w-4 pointer-events-none">
        <div className="marker-glow animate-pulse-slow" />
      </div>
    </div>
  );
}
