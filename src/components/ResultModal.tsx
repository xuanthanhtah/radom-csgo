import { useRef, useEffect, useState } from "react";
import { Modal } from "antd";
import type { Item } from "../types";

type Props = {
  result: Item | null;
  onClose: () => void;
};

export default function ResultModal({ result, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const fireworksTimeoutRef = useRef<number | null>(null);

  const FIREWORKS_URL =
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVnbHk1N20yOWtkZmVvbDAyMXcwZm81ZmV1cm84eWRjb3dja2Z6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/S3bp48refqWzwxx70g/giphy.gif";

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

  // show fireworks GIF briefly when a new result appears
  useEffect(() => {
    // clear any previous timeout
    if (fireworksTimeoutRef.current !== null) {
      window.clearTimeout(fireworksTimeoutRef.current);
      fireworksTimeoutRef.current = null;
    }

    if (!result) {
      setShowFireworks(false);
      return;
    }

    setShowFireworks(true);
    // auto-hide after 3s (typical short fireworks burst)
    fireworksTimeoutRef.current = window.setTimeout(() => {
      setShowFireworks(false);
      fireworksTimeoutRef.current = null;
    }, 3000);

    return () => {
      if (fireworksTimeoutRef.current !== null) {
        window.clearTimeout(fireworksTimeoutRef.current);
        fireworksTimeoutRef.current = null;
      }
    };
  }, [result]);

  return (
    <Modal
      open={!!result}
      onCancel={onClose}
      footer={null}
      title={`Chúc mừng ${result?.name || ""}!`}
    >
      {result && (
        <div className="relative flex flex-col items-center gap-4">
          {showFireworks && (
            <img
              src={FIREWORKS_URL}
              alt="fireworks"
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 z-50"
            />
          )}

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
            Người được chọn để đi lấy cơm là : <strong>{result.name}</strong>{" "}
            !!!
          </div>
        </div>
      )}
    </Modal>
  );
}
