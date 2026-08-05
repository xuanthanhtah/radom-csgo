import { useState } from "react";
import { Modal } from "antd";
import type { User, HistoryEntry } from "../types";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type Props = {
  history: HistoryEntry[];
  users: User[];
  onDeleteEntry?: (entry: HistoryEntry) => void;
  onDeleteAll?: () => void;
  loading?: boolean;
};

export default function HistoryList({
  history,
  users,
  onDeleteEntry,
  onDeleteAll,
  loading,
}: Props) {
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<HistoryEntry | null>(null);

  return (
    <div className="space-y-3">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">
          Tổng số lượt quay: <strong className="text-yellow-400">{history.length}</strong>
        </span>
        <button
          className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600/80 hover:bg-red-500 text-white disabled:opacity-30 transition-all"
          onClick={() => setConfirmDeleteAllOpen(true)}
          disabled={!onDeleteAll || history.length === 0}
        >
          🗑️ Xóa lịch sử tháng
        </button>
      </div>

      {/* History List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-gray-800 rounded" />
                <div className="h-2.5 w-20 bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Chưa có lịch sử quay trong tháng này
        </div>
      ) : (
        <div className="space-y-2">
          {history
            .slice()
            .reverse()
            .map((entry) => {
              const timePart = entry.created_at || "";
              const user = users.find(
                (u) => String(u.id) === String(entry.userId)
              );
              const displayName = user?.name || "(Chưa xác định)";
              const avatarSrc = (user && (user.img || user.image)) || undefined;
              const rarity = getRarity(entry.userId);

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
                <div
                  key={`${entry.userId}-${entry.created_at}`}
                  className="group relative p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3 transition-all hover:bg-gray-800/80 hover:border-gray-700"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: rarity.color,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      src={avatarSrc}
                      name={displayName}
                      size={38}
                      className="border border-gray-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-200 truncate">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <span>🕒</span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Single Entry Button */}
                  <button
                    onClick={() => setEntryToDelete(entry)}
                    className="opacity-60 group-hover:opacity-100 p-1 text-xs text-gray-400 hover:text-red-400 transition-opacity"
                    title="Xóa lượt này"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Confirmation Modal - Delete All */}
      <Modal
        title="⚠️ Xác nhận xóa toàn bộ lịch sử"
        open={confirmDeleteAllOpen}
        onOk={() => {
          if (onDeleteAll) onDeleteAll();
          setConfirmDeleteAllOpen(false);
        }}
        onCancel={() => setConfirmDeleteAllOpen(false)}
        okText="Xóa tất cả"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-300 text-sm">
          Bạn có chắc chắn muốn xóa toàn bộ lịch sử quay của tháng hiện tại không?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* Confirmation Modal - Delete Single Entry */}
      <Modal
        title="⚠️ Xác nhận xóa lượt quay"
        open={!!entryToDelete}
        onOk={() => {
          if (entryToDelete && onDeleteEntry) {
            onDeleteEntry(entryToDelete);
          }
          setEntryToDelete(null);
        }}
        onCancel={() => setEntryToDelete(null)}
        okText="Xóa lượt này"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-300 text-sm">
          Bạn có chắc chắn muốn xóa kết quả quay này không? Tỷ lệ trúng của người chơi sẽ được tính toán lại.
        </p>
      </Modal>
    </div>
  );
}
