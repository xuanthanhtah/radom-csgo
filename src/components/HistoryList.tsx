import React from "react";
import { Avatar } from "antd";
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
  // Define gradient colors for history items
  const gradients = [
    "from-cyan-400 via-cyan-500 to-cyan-600",
    "from-sky-400 via-sky-500 to-sky-600",
    "from-blue-400 via-blue-500 to-blue-600",
    "from-indigo-400 via-indigo-500 to-indigo-600",
    "from-violet-400 via-violet-500 to-violet-600",
    "from-purple-400 via-purple-500 to-purple-600",
    "from-fuchsia-400 via-fuchsia-500 to-fuchsia-600",
    "from-pink-400 via-pink-500 to-pink-600",
    "from-rose-400 via-rose-500 to-rose-600",
    "from-red-400 via-red-500 to-red-600",
  ];

  return (
    <div>
      {/* Header with delete all button */}
      <div className="flex justify-end mb-3">
        <button
          className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={() => {
            if (onDeleteAll) onDeleteAll();
          }}
          disabled={!onDeleteAll || history.length === 0}
        >
          🗑️ Xóa lịch sử tuần
        </button>
      </div>

      {/* History list */}
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chưa có lịch sử</div>
      ) : (
        <div className="space-y-2">
          {history
            .slice()
            .reverse()
            .map((entry, index) => {
              const timePart = entry.created_at || "";

              // Find user information from the provided users list
              const user = users.find(
                (u) => String(u.id) === String(entry.userId)
              );
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

              const gradient = gradients[index % gradients.length];

              return (
                <div
                  key={`${entry.userId}-${entry.created_at}`}
                  className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${gradient} p-[2px] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="bg-white rounded-lg p-2.5 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar
                        src={avatarSrc}
                        size={44}
                        className="border-2 border-white shadow-md"
                      />
                    </div>

                    {/* Name and Time */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate text-sm">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-500">🕐</span>
                        <span className="text-xs text-gray-600">
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex-shrink-0">
                      <button
                        className={`px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r ${gradient} text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={() => onDeleteEntry && onDeleteEntry(entry)}
                        disabled={!onDeleteEntry}
                      >
                        ✕ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
