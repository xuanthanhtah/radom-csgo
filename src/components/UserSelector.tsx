import React from "react";
import { Button, Avatar, Empty } from "antd";
import type { User } from "../types";

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

  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lowerSearch = searchTerm.toLowerCase().trim();
    return users.filter((user) =>
      user.name.toLowerCase().includes(lowerSearch)
    );
  }, [users, searchTerm]);

  if (loading)
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm flex items-center gap-2">
            <span className="h-3 w-36 rounded bg-gray-200 animate-pulse block" />
          </div>
          <div className="flex gap-2">
            <Button size="small" disabled>
              Chọn tất cả
            </Button>
            <Button size="small" disabled>
              Bỏ chọn
            </Button>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full p-3 rounded border bg-white border-gray-200 flex flex-col items-center justify-center animate-pulse"
            >
              <div className="w-20 h-20 rounded-full bg-gray-200" />
              <div className="mt-3 h-3 w-24 bg-gray-200 rounded" />
              <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );

  if (!users || users.length === 0)
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm">Thành viên hội đồng hương (0)</div>
          <div className="flex gap-2">
            <Button size="small" onClick={onSelectAll} disabled>
              Chọn tất cả
            </Button>
            <Button size="small" onClick={onClear} disabled>
              Bỏ chọn
            </Button>
          </div>
        </div>
        <Empty description="Chết hết rồi hay gì mà không thấy ai vậy?" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          Thành viên hội đồng hương ({users.length})
        </div>
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={onSelectAll}
            disabled={users.length === 0}
          >
            Chọn tất cả
          </Button>
          <Button
            size="small"
            onClick={onClear}
            disabled={selectedIds.length === 0}
          >
            Bỏ chọn
          </Button>
        </div>
      </div>

      {/* Search field */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Tìm kiếm thành viên..."
            className="w-full px-4 py-2.5 pr-10 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-1.5 text-xs text-gray-500">
            Tìm thấy {filteredUsers.length} kết quả
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Không tìm thấy thành viên nào
          </div>
        ) : (
          filteredUsers.map((u) => {
            const selected = selectedIds.includes(u.id);
            const src = (u as any).img || u.image;
            return (
              <div
                key={u.id}
                onClick={() => onToggle(u.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onToggle(u.id);
                }}
                className={
                  `w-full cursor-pointer select-none p-3 rounded border flex flex-col items-center justify-center text-center transition-transform transform ` +
                  (selected
                    ? "ring-2 ring-kid-yellow/40 shadow-xl bg-gradient-to-br from-kid-yellow/30 to-kid-orange/20 scale-105"
                    : "bg-white border-gray-200 hover:shadow-sm hover:scale-105")
                }
              >
                {src ? (
                  <img
                    src={src}
                    alt={u.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <Avatar size={64}>{u.name?.[0] || "U"}</Avatar>
                )}
                <div className="mt-2 text-sm truncate w-full">{u.name}</div>
                <div className="mt-2 text-xs text-gray-600">
                  {selected ? "Đã chọn" : "Nhấn để chọn"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
