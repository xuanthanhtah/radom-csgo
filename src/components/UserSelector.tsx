import React from "react";
import { Empty } from "antd";
import type { User } from "../types";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type Props = {
  users: User[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
  loading?: boolean;
};

export default function UserSelector({
  users,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  loading,
}: Props) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const removeDiacritics = (str: string): string => {
    const map: { [key: string]: string } = {
      à: "a", á: "a", ả: "a", ã: "a", ạ: "a", ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
      â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a", đ: "d", è: "e", é: "e", ẻ: "e", ẽ: "e",
      ẹ: "e", ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e", ì: "i", í: "i", ỉ: "i", ĩ: "i",
      ị: "i", ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o", ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o",
      ộ: "o", ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o", ù: "u", ú: "u", ủ: "u", ũ: "u",
      ụ: "u", ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u", ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
    };
    return str
      .toLowerCase()
      .split("")
      .map((char) => map[char] || char)
      .join("");
  };

  const filteredUsers = React.useMemo(() => {
    let result = users;
    if (searchTerm.trim()) {
      const lowerSearch = removeDiacritics(searchTerm.toLowerCase().trim());
      result = users.filter((user) =>
        removeDiacritics(user.name.toLowerCase()).includes(lowerSearch)
      );
    }
    return result.slice().sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [users, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-gray-800 rounded animate-pulse" />
            <div className="h-7 w-20 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-800 bg-gray-900/60 flex flex-col items-center animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800" />
              <div className="mt-2 h-3 w-20 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="py-6 text-center">
        <Empty description={<span className="text-gray-400">Chưa có thành viên nào</span>} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <span>👥 Danh sách người chơi</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
            {selectedIds.length} / {users.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={users.length === 0}
            className="px-3 py-1 text-xs font-semibold rounded-md cs-btn-dark disabled:opacity-40"
          >
            ✓ Chọn tất cả
          </button>
          <button
            onClick={onClear}
            disabled={selectedIds.length === 0}
            className="px-3 py-1 text-xs font-semibold rounded-md cs-btn-dark disabled:opacity-40"
          >
            ✕ Bỏ chọn
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Tìm tên thành viên..."
          className="w-full px-3.5 py-2 text-sm bg-gray-900/90 border border-gray-700/80 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500 text-sm">
            Không tìm thấy thành viên khớp từ khóa
          </div>
        ) : (
          filteredUsers.map((u) => {
            const selected = selectedIds.includes(u.id);
            const src = (u as any).img || u.image;
            const rarity = getRarity(u.id);

            return (
              <div
                key={u.id}
                onClick={() => onToggle(u.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onToggle(u.id);
                }}
                className={`relative group cursor-pointer select-none p-2.5 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  selected
                    ? "bg-gradient-to-b from-gray-800/90 to-gray-900/90 scale-[1.02]"
                    : "bg-gray-900/50 border-gray-800/80 hover:bg-gray-800/60 hover:border-gray-700"
                }`}
                style={{
                  borderColor: selected ? rarity.color : undefined,
                  boxShadow: selected
                    ? `0 0 14px -2px ${rarity.glowColor}`
                    : undefined,
                }}
              >
                {/* Selection Badge */}
                {selected && (
                  <div
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-sm z-10"
                    style={{ backgroundColor: rarity.color }}
                  >
                    ✓
                  </div>
                )}

                {/* Avatar */}
                <UserAvatar
                  src={src}
                  name={u.name}
                  size={56}
                  className={`border-2 transition-transform duration-200 ${
                    selected ? "scale-105" : "group-hover:scale-105"
                  }`}
                  style={{
                    borderColor: selected ? rarity.color : "#374151",
                  }}
                />

                {/* User Name */}
                <div className="mt-2 text-xs font-semibold text-gray-200 truncate w-full">
                  {u.name}
                </div>

                {/* Status Indicator */}
                <span
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: selected ? rarity.color : "#6b7280" }}
                >
                  {selected ? "Sẵn sàng" : "Bấm để tham gia"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
