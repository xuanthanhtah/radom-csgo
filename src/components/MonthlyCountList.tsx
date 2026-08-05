import React from "react";
import type { User, HistoryEntry } from "../types";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type Props = {
  history: HistoryEntry[];
  users: User[];
};

export default function MonthlyCountList({ history, users }: Props) {
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of history) {
      if (entry.inactive !== true) continue;
      map[entry.userId] = (map[entry.userId] || 0) + 1;
    }
    return map;
  }, [history]);

  const sorted = React.useMemo(() => {
    return users
      .map((u) => ({
        ...u,
        count: counts[u.id] || 0,
      }))
      .filter((u) => u.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [users, counts]);

  const trophies = ["🥇", "🥈", "🥉"];

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        Chưa có ai đi lấy cơm trong tháng này
      </div>
    );
  }

  let currentRank = 1;
  let prevCount: number | null = null;
  const rankedSorted = sorted.map((u, idx) => {
    if (prevCount !== null && u.count < prevCount) {
      currentRank = idx + 1;
    }
    prevCount = u.count;
    return { ...u, rank: currentRank };
  });

  return (
    <div className="space-y-2">
      {rankedSorted.map((u) => {
        const trophy = u.rank <= 3 ? trophies[u.rank - 1] : null;
        const rarity = getRarity(u.id);

        return (
          <div
            key={u.id}
            className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3 transition-all hover:bg-gray-800/80 hover:border-gray-700"
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: rarity.color,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                {u.rank}
              </div>
              <UserAvatar
                src={u.img || u.image}
                name={u.name}
                size={38}
                className="border border-gray-700 flex-shrink-0"
                style={{ borderColor: rarity.color }}
              />
              <div className="min-w-0">
                <div className="font-semibold text-xs text-gray-200 truncate flex items-center gap-1">
                  <span>{u.name}</span>
                  {trophy && <span>{trophy}</span>}
                </div>
                <span className="text-[10px] text-gray-400">
                  Cấp độ: {rarity.name}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 px-2.5 py-1 rounded-md bg-green-950/60 border border-green-500/30 text-xs font-bold text-green-400">
              {u.count} lần
            </div>
          </div>
        );
      })}
    </div>
  );
}
