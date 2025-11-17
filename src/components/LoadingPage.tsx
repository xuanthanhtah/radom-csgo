export default function LoadingPage({
  message = "Đang tải...",
}: {
  message?: string;
}): JSX.Element {
  const img =
    "https://res.cloudinary.com/lxthanh269/image/upload/v1762502127/dua_zit/dat_%C4%90%E1%BA%A1t_jmlmpj.png";

  const positions: { left: string; top: string; duration: string }[] = [
    { left: "6%", top: "18%", duration: "3s" },
    { left: "26%", top: "68%", duration: "4s" },
    { left: "46%", top: "28%", duration: "3.5s" },
    { left: "66%", top: "62%", duration: "4.5s" },
    { left: "86%", top: "38%", duration: "5s" },
  ];

  return (
    <div className="min-h-screen relative bg-white overflow-hidden">
      {positions.map((p, i) => (
        <img
          key={i}
          src={img}
          alt={`loading-${i}`}
          className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full animate-spin"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.duration,
            transformOrigin: "50% 50%",
            pointerEvents: "none",
          }}
        />
      ))}

      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mt-4 text-lg text-gray-700">{message}</div>
        </div>
      </div>
    </div>
  );
}
