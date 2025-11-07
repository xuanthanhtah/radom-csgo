import React from "react";
import type { Item } from "../types";

type Props = {
  repeated: Item[];
  stripRef: React.RefObject<HTMLDivElement>;
  itemWidth: number;
  initialTranslate: number;
  containerWidth?: number;
};

export default function CaseStrip({
  repeated,
  stripRef,
  itemWidth,
  initialTranslate,
  containerWidth,
}: Props) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden border rounded"
        // Use full width of the parent but cap it with `maxWidth` so the
        // strip doesn't force the page to grow when many items are selected.
        style={{
          height: 180,
          width: "100%",
          maxWidth: containerWidth ?? "100%",
        }}
      >
        <div
          ref={stripRef}
          className={`flex items-center h-full`}
          style={{ transform: `translateX(-${initialTranslate}px)` }}
        >
          {repeated.map((it) => (
            <div
              key={it.id}
              className="flex-shrink-0 mx-2 bg-white rounded shadow-sm flex flex-col items-center justify-center"
              style={{ width: itemWidth - 16, height: 140 }}
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-full h-28 object-cover rounded-t"
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
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 h-full w-2 pointer-events-none">
        <div className="w-2 h-full bg-gradient-to-b from-transparent via-yellow-300 to-transparent opacity-80 rounded" />
      </div>
    </div>
  );
}
