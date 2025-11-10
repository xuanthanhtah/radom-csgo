import { useRef, useEffect } from "react";
import { Modal } from "antd";
import type { Item } from "../types";

type Props = {
  result: Item | null;
  onClose: () => void;
};

export default function ResultModal({ result, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!result) return;

    const img = imgRef.current;
    if (!img) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const comp = window.getComputedStyle(img);
    const animName =
      comp.animationName || comp.getPropertyValue("animation-name");

    let rafId: number | null = null;

    // fallback nếu KHÔNG có animation từ CSS -> animate one rotation over 1s using timestamps
    if (!animName || animName === "none") {
      let start: number | null = null;
      const duration = 1000; // 1s to match CSS

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const deg = progress * 360;
        img.style.transform = `rotate(${deg}deg)`;
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (img) img.style.transform = "";
    };
  }, [result]);

  return (
    <Modal
      open={!!result}
      onCancel={onClose}
      footer={null}
      title={result?.name || ""}
    >
      {result && (
        <div className="flex flex-col items-center gap-4">
          {result.image ? (
            <img
              ref={imgRef}
              src={result.image}
              alt={result.name}
              className="w-64 h-64 object-cover rounded shadow-2xl animate-spin-slow"
              style={{
                /* CSS now defines a single-iteration forwards animation */
                transformOrigin: "center",
              }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100" />
          )}
          <div className="text-lg">
            Người chơi <strong>{result.name}</strong> được chọn
          </div>
        </div>
      )}
    </Modal>
  );
}
