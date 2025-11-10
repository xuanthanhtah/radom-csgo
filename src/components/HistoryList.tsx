import React from "react";
import { List, Avatar } from "antd";
import type { User, HistoryEntry } from "../types";

type Props = {
  history: HistoryEntry[];
  users: User[];
  onDeleteEntry?: (entry: HistoryEntry) => void;
  onDeleteAll?: () => void;
};

export default function HistoryList({
  history,
  users,
  onDeleteEntry,
  onDeleteAll,
}: Props) {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          className="text-sm text-red-600 underline"
          onClick={() => {
            if (onDeleteAll) onDeleteAll();
          }}
          disabled={!onDeleteAll || history.length === 0}
        >
          Xóa lịch sử tuần
        </button>
      </div>
      <List
        dataSource={history.slice().reverse()}
        renderItem={(entry) => {
          const timePart = entry.created_at || "";

          // Find user information from the provided users list
          const user = users.find((u) => u.id === entry.userId);
          const displayName = user?.name || "(unknown)";
          const avatarSrc = (user && (user.img || user.image)) || undefined;

          // Format timestamp for Vietnamese locale
          let formattedTime = "";
          if (timePart) {
            const d = new Date(timePart);
            if (!isNaN(d.getTime())) {
              try {
                formattedTime = new Intl.DateTimeFormat("vi-VN", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(d);
              } catch (e) {
                formattedTime = d.toLocaleString("vi-VN");
              }
            }
          }

          return (
            <List.Item className="mb-3">
              <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={avatarSrc} size={40} />
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-600">{formattedTime}</div>
                    <div>{displayName}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-red-600"
                    onClick={() => onDeleteEntry && onDeleteEntry(entry)}
                    disabled={!onDeleteEntry}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
