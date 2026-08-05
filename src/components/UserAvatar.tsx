import { useState, useEffect } from "react";
import { Avatar } from "antd";

type Props = {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function UserAvatar({
  src,
  name,
  size = 40,
  className = "",
  style = {},
}: Props) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Convert HTTP to HTTPS if needed, or handle missing src
  const sanitizedSrc = src ? src.replace(/^http:\/\//i, "https://") : undefined;

  if (sanitizedSrc && !imgError) {
    return (
      <img
        src={sanitizedSrc}
        alt={name}
        onError={() => setImgError(true)}
        className={`object-cover rounded-full ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  return (
    <Avatar
      size={size}
      className={`flex-shrink-0 font-bold bg-gray-800 text-yellow-400 border border-gray-700 ${className}`}
      style={style}
    >
      {name ? name[0].toUpperCase() : "U"}
    </Avatar>
  );
}
