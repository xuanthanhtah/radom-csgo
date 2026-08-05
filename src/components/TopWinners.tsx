import React from "react";
import type { User, HistoryEntry } from "../types";
import supabase from "../lib/supabase";
import { getRarity } from "../lib/rarity";
import UserAvatar from "./UserAvatar";

type WinnerStats = {
  userId: string;
  count: number;
  user?: User;
  rank?: number;
};

type Props = {
  users: User[];
};

export default function TopWinners({ users }: Props) {
  const [allHistory, setAllHistory] = React.useState<HistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Histories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load all histories", error);
          setAllHistory([]);
        } else {
          const entries: HistoryEntry[] = (data || []).map((h: any) => ({
            created_at: h.created_at || h.createdAt || "",
            userId: h.userId || h.username || h.user || "",
            modify_date: h.modify_date || h.modifyDate || "",
            inactive: typeof h.inactive === "boolean" ? h.inactive : true,
          }));
          setAllHistory(entries);
        }
      } catch (err) {
        console.error("Unexpected error loading all histories", err);
        setAllHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, []);

  const winnerStats = React.useMemo(() => {
    const counts: Record<string, number> = {};

    allHistory.forEach((entry) => {
      if (entry.userId && entry.inactive !== false) {
        counts[entry.userId] = (counts[entry.userId] || 0) + 1;
      }
    });

    const stats: WinnerStats[] = Object.entries(counts).map(
      ([userId, count]) => ({
        userId,
        count,
        user: users.find((u) => String(u.id) === String(userId)),
      })
    );

    const sorted = stats.sort((a, b) => b.count - a.count);

    let currentRank = 1;
    return sorted.map((stat, index) => {
      if (index > 0 && stat.count < sorted[index - 1].count) {
        currentRank = index + 1;
      }
      return { ...stat, rank: currentRank };
    });
  }, [allHistory, users]);

  const trophies = ["🥇", "🥈", "🥉"];
  const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3 animate-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-gray-800" />
            <div className="w-10 h-10 rounded-full bg-gray-800" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-28 bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (winnerStats.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        Chưa có dữ liệu bảng xếp hạng
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {winnerStats.map((stat, index) => {
        const displayName = stat.user?.name || "(Chưa xác định)";
        const avatarSrc = (stat.user && (stat.user.img || stat.user.image)) || undefined;
        const rank = stat.rank || index + 1;
        const trophy = rank <= 3 ? trophies[rank - 1] : null;
        const rankColor = rank <= 3 ? rankColors[rank - 1] : "#4b5563";
        const rarity = getRarity(stat.userId);

        return (
          <div
            key={stat.userId}
            className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3 transition-all hover:bg-gray-800/80 hover:border-gray-700"
            style={{
              borderLeftWidth: rank <= 3 ? "4px" : "1px",
              borderLeftColor: rankColor,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Rank Badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md"
                style={{
                  backgroundColor: rank <= 3 ? rankColor : "#1f2937",
                  color: rank <= 3 ? "#000000" : "#9ca3af",
                }}
              >
                {rank}
              </div>

              {/* Avatar */}
              <UserAvatar
                src={avatarSrc}
                name={displayName}
                size={38}
                className="border border-gray-700 flex-shrink-0"
                style={{ borderColor: rarity.color }}
              />

              {/* Name */}
              <div className="min-w-0">
                <div className="font-semibold text-xs text-gray-200 truncate flex items-center gap-1">
                  <span>{displayName}</span>
                  {trophy && <span className="text-sm">{trophy}</span>}
                </div>
                <span className="text-[10px] text-gray-400">
                  Tỷ lệ giảm đợt tiếp: {Math.max(0, 100 - Math.pow(0.1, stat.count) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Total Win Count */}
            <div className="flex-shrink-0 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-bold text-yellow-400">
              {stat.count} lần
            </div>
          </div>
        );
      })}
    </div>
  );
}
