import React from "react";
import { Avatar } from "antd";
import type { User, HistoryEntry } from "../types";
import supabase from "../lib/supabase";

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

  // Fetch all history from API
  React.useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      try {
        // Fetch all histories from database, not limited by week
        const { data, error } = await supabase
          .from("Histories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load all histories", error);
          setAllHistory([]);
        } else {
          const entries: HistoryEntry[] = (data || []).map((h: any) => {
            const created = h.created_at || h.createdAt || "";
            const userId = h.userId || h.username || h.user || "";
            const modify = h.modify_date || h.modifyDate || "";
            return {
              created_at: created,
              userId,
              modify_date: modify,
            };
          });
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

  // Count wins per user from all history
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
      }),
    );

    // Sort by count descending
    const sorted = stats.sort((a, b) => b.count - a.count);

    // Calculate rank based on win count (same count = same rank)
    let currentRank = 1;
    const rankedStats = sorted.map((stat, index) => {
      if (index > 0 && stat.count < sorted[index - 1].count) {
        currentRank = index + 1;
      }
      return { ...stat, rank: currentRank };
    });

    return rankedStats;
  }, [allHistory, users]);

  // Define gradient colors for top 10 winners
  const gradients = [
    "from-yellow-400 via-yellow-500 to-yellow-600", // 1st - Gold
    "from-gray-300 via-gray-400 to-gray-500", // 2nd - Silver
    "from-orange-400 via-orange-500 to-orange-600", // 3rd - Bronze
    "from-blue-400 via-blue-500 to-blue-600", // 4th - Blue
    "from-green-400 via-green-500 to-green-600", // 5th - Green
    "from-purple-400 via-purple-500 to-purple-600", // 6th - Purple
    "from-pink-400 via-pink-500 to-pink-600", // 7th - Pink
    "from-indigo-400 via-indigo-500 to-indigo-600", // 8th - Indigo
    "from-red-400 via-red-500 to-red-600", // 9th - Red
    "from-teal-400 via-teal-500 to-teal-600", // 10th - Teal
  ];

  // Trophy emojis for top 3
  const trophies = ["🥇", "🥈", "🥉"];

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-200 to-gray-100 p-[2px]"
          >
            <div className="bg-white rounded-lg p-3 flex items-center gap-3 animate-pulse">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex-shrink-0 w-16 h-8 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (winnerStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có dữ liệu người trúng giải
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {winnerStats.map((stat, index) => {
        const displayName = stat.user?.name || "(unknown)";
        const avatarSrc =
          (stat.user && (stat.user.img || stat.user.image)) || undefined;
        const rank = stat.rank || index + 1;
        const gradient = gradients[(rank - 1) % gradients.length];
        const trophy = rank <= 3 ? trophies[rank - 1] : null;

        return (
          <div
            key={stat.userId}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${gradient} p-[2px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              {/* Rank Number */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white font-bold text-lg">{rank}</span>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  src={avatarSrc}
                  size={48}
                  className="border-2 border-white shadow-md"
                />
              </div>

              {/* Name and Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {displayName}
                  </h3>
                  {trophy && (
                    <span className="text-2xl animate-pulse">{trophy}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Số lần trúng:</span>
                  <span
                    className={`font-bold text-sm bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                  >
                    {stat.count} lần
                  </span>
                </div>
              </div>

              {/* Win Count Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`px-4 py-2 rounded-full bg-gradient-to-r ${gradient} shadow-md`}
                >
                  <div className="text-white font-bold text-xl">
                    {stat.count}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
