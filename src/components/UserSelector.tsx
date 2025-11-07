import React from "react";
import { Button, Avatar, Empty, Spin } from "antd";
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
  if (loading) return <Spin />;

  if (!users || users.length === 0)
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm">Người dùng (0)</div>
          <div className="flex gap-2">
            <Button size="small" onClick={onSelectAll} disabled>
              Chọn tất cả
            </Button>
            <Button size="small" onClick={onClear} disabled>
              Bỏ chọn
            </Button>
          </div>
        </div>
        <Empty description="Không có người dùng" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">Người dùng ({users.length})</div>
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

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {users.map((u) => {
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
                `w-full cursor-pointer select-none p-3 rounded border bg-white flex flex-col items-center justify-center text-center transition-shadow ` +
                (selected
                  ? "border-yellow-400 shadow-md bg-yellow-50"
                  : "border-gray-200 hover:shadow-sm")
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
        })}
      </div>
    </div>
  );
}
