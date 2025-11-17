export default function LoadingPage({
  message = "Đang tải...",
}: {
  message?: string;
}): JSX.Element {
  const positions: {
    left: string;
    top: string;
    duration: string;
    img: string;
  }[] = [
    {
      left: "6%",
      top: "18%",
      duration: "1s",
      img: "https://res.cloudinary.com/lxthanh269/image/upload/v1762502127/dua_zit/dat_%C4%90%E1%BA%A1t_jmlmpj.png",
    },
    {
      left: "26%",
      top: "68%",
      duration: "2s",
      img: "https://res.cloudinary.com/lxthanh269/image/upload/v1762502127/dua_zit/thanh_Th%C3%A0nh_qp436e.png",
    },
    {
      left: "46%",
      top: "28%",
      duration: "2s",
      img: "https://res.cloudinary.com/lxthanh269/image/upload/v1762502125/dua_zit/tam_T%C3%A2m_sry7oy.png",
    },
    {
      left: "66%",
      top: "62%",
      duration: "2s",
      img: "https://res.cloudinary.com/lxthanh269/image/upload/v1762502124/dua_zit/luan_Lu%C3%A2n_hiyg6u.png",
    },
    {
      left: "86%",
      top: "38%",
      duration: "2s",
      img: "https://res.cloudinary.com/lxthanh269/image/upload/v1762502123/dua_zit/quang_Quang_h50iwr.png",
    },
  ];

  return (
    <div className="min-h-screen relative bg-white overflow-hidden">
      {positions.map((p, i) => (
        <img
          key={i}
          src={p.img}
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
