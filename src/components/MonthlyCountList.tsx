import React from "react";
import { Avatar } from "antd";
import type { User, HistoryEntry } from "../types";

type Props = {
  history: HistoryEntry[];
  users: User[];
};

export default function MonthlyCountList({ history, users }: Props) {
  // Đếm số lần mỗi user lấy trong tháng
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of history) {
      if (entry.inactive !== true) continue;
      map[entry.userId] = (map[entry.userId] || 0) + 1;
    }
    return map;
  }, [history]);

  // Sắp xếp theo số lần giảm dần
  const sorted = React.useMemo(() => {
    return users
      .map((u) => ({
        ...u,
        count: counts[u.id] || 0,
      }))
      .filter((u) => u.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [users, counts]);

  // Gradient và icon cho top 10 giống TopWinners
  const gradients = [
    "from-green-400 via-green-500 to-green-600", // 1st
    "from-gray-300 via-gray-400 to-gray-500", // 2nd
    "from-orange-400 via-orange-500 to-orange-600", // 3rd
    "from-blue-400 via-blue-500 to-blue-600",
    "from-purple-400 via-purple-500 to-purple-600",
    "from-pink-400 via-pink-500 to-pink-600",
    "from-indigo-400 via-indigo-500 to-indigo-600",
    "from-red-400 via-red-500 to-red-600",
    "from-teal-400 via-teal-500 to-teal-600",
    "from-cyan-400 via-cyan-500 to-cyan-600",
  ];
  const trophies = ["🥇", "🥈", "🥉"];

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có ai lấy trong tháng này
      </div>
    );
  }

  // Xử lý rank giống TopWinners: cùng số lần = cùng thứ hạng
  let currentRank = 1;
  let prevCount: any = null;
  const rankedSorted = sorted.map((u, idx) => {
    if (prevCount !== null && u.count < prevCount) {
      currentRank = idx + 1;
    }
    prevCount = u.count;
    return { ...u, rank: currentRank };
  });

  return (
    <div className="space-y-3">
      {rankedSorted.map((u, idx) => {
        const gradient = gradients[(u.rank - 1) % gradients.length];
        const trophy = u.rank <= 3 ? trophies[u.rank - 1] : null;
        return (
          <div
            key={u.id}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${gradient} p-[2px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              {/* Rank Number */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white font-bold text-lg">{u.rank}</span>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  src={u.img || u.image}
                  size={48}
                  className="border-2 border-white shadow-md"
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {u.name} {trophy && <span>{trophy}</span>}
                  </h3>
                </div>
              </div>

              {/* Count */}
              <div className="text-lg font-bold text-green-700 min-w-[32px] text-right">
                {u.count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
