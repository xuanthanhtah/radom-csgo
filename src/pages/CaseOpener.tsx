import React, { useState, useRef, useEffect } from "react";
import { message } from "antd";
import type { Item, User, HistoryEntry } from "../types";
import CaseStrip from "../components/CaseStrip";
import CSCase3D from "../components/CSCase3D";
import HistoryList from "../components/HistoryList";
import TopWinners from "../components/TopWinners";
import MonthlyCountList from "../components/MonthlyCountList";
import ResultModal from "../components/ResultModal";
import UserSelector from "../components/UserSelector";
import supabase from "../lib/supabase";
import { isSoundEnabled, toggleSound, playTickSound } from "../lib/sound";

export default function CaseOpener(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [tempName, setTempName] = useState("");
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [activeTab, setActiveTab] = useState<
    "history" | "topWinners" | "monthlyCount"
  >("history");

  const stripRef = useRef<HTMLDivElement | null>(null);

  const ITEM_WIDTH = 150;
  const ITEM_GAP = 16;
  const ITEM_STEP = ITEM_WIDTH + ITEM_GAP;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const combinedUsers = React.useMemo(
    () => [...users, ...localUsers],
    [users, localUsers]
  );

  const items = React.useMemo<Item[]>(
    () =>
      combinedUsers
        .filter((u) => selectedIds.includes(u.id))
        .map((u) => ({
          id: u.id,
          name: u.name,
          image: (u as any).img || u.image || "",
        })),
    [combinedUsers, selectedIds]
  );

  const REPEAT = items.length <= 1 ? 8 : 30;

  const repeated = React.useMemo(() => {
    const out: (Item & { originalId?: string })[] = [];
    for (let r = 0; r < REPEAT; r++) {
      for (const it of items) {
        out.push({ ...it, originalId: it.id, id: `${it.id}-${r}` });
      }
    }
    return out;
  }, [items, REPEAT]);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("inActive", true);
      if (!mounted) return;
      if (error) {
        console.error("Failed to load users", error);
        message.error("Không thể tải danh sách người dùng");
        setUsers([]);
      } else {
        const loadedUsers = (data as User[]) || [];
        setUsers(loadedUsers);
        // Default select all users on load
        setSelectedIds(loadedUsers.map((u) => u.id));
      }
      setUsersLoading(false);
    };
    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const getMonthBounds = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return { start: firstDay, end: lastDay };
  };

  const fetchHistories = async () => {
    setHistoryLoading(true);
    try {
      const { start, end } = getMonthBounds();
      const startISO = start.toISOString();

      try {
        await supabase
          .from("Histories")
          .update({ inactive: false, modify_date: new Date().toISOString() })
          .lt("created_at", startISO);
      } catch (e) {
        console.warn("Failed to mark old histories inactive", e);
      }

      const { data, error } = await supabase
        .from("Histories")
        .select("*")
        .eq("inactive", true)
        .gte("created_at", startISO)
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Failed to load histories", error);
        message.error("Không thể tải lịch sử");
        return;
      }

      const entries: HistoryEntry[] = (data || []).map((h: any) => ({
        created_at: h.created_at || h.createdAt || "",
        userId: h.userId || h.username || h.user || "",
        modify_date: h.modify_date || h.modifyDate || "",
        inactive: typeof h.inactive === "boolean" ? h.inactive : true,
      }));

      setHistory(entries);
    } catch (err) {
      console.error("Unexpected error loading histories", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const selectAll = () => setSelectedIds(combinedUsers.map((u) => u.id));
  const clearSelected = () => setSelectedIds([]);

  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  const onOpen = () => {
    if (items.length === 0) {
      message.warning("Hãy chọn ít nhất 1 người chơi trước khi quay!");
      return;
    }
    setSpinning(true);
    setResult(null);

    const winsCount = history.reduce<Record<string, number>>((m, e) => {
      if (e.inactive !== true) return m;
      m[e.userId] = (m[e.userId] || 0) + 1;
      return m;
    }, {});

    const weightMap: Record<string, number> = {};
    for (const it of items) {
      const wins = winsCount[it.id] || 0;
      weightMap[it.id] = Math.pow(0.1, wins);
      if (!isFinite(weightMap[it.id]) || weightMap[it.id] <= 0) {
        weightMap[it.id] = 0.000001;
      }
    }

    const pickWeighted = (arr: Item[]) => {
      const weights = arr.map((a) => weightMap[a.id] ?? 1);
      const total = weights.reduce((s, v) => s + v, 0);
      if (total <= 0) return arr[0];
      let r = Math.random() * total;
      for (let i = 0; i < arr.length; i++) {
        if (r < weights[i]) return arr[i];
        r -= weights[i];
      }
      return arr[arr.length - 1];
    };

    const chosen = pickWeighted(items) || items[0];
    const chosenIndexRaw = items.findIndex((i) => i.id === chosen.id);
    const chosenIndex = chosenIndexRaw >= 0 ? chosenIndexRaw : 0;

    const baseIndex = Math.floor(REPEAT / 2) * items.length + chosenIndex;
    const rotations = 5;
    const finalIndex = baseIndex + items.length * rotations;
    const finalTranslate = Math.max(0, finalIndex * ITEM_STEP - centerOffset);

    const repeatedSnapshot = repeated.slice();
    const strip = stripRef.current;
    if (!strip) return;

    const totalDurationMs = 4000;
    const startTime = Date.now();

    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalDurationMs) {
        clearInterval(tickInterval);
        return;
      }
      const progress = elapsed / totalDurationMs;
      if (Math.random() < Math.pow(1 - progress, 1.8)) {
        playTickSound();
      }
    }, 45);

    strip.style.transition = "transform 4s cubic-bezier(.15,.85,.35,1.0)";
    strip.style.transform = `translateX(-${finalTranslate}px)`;

    setTimeout(() => {
      clearInterval(tickInterval);
      playTickSound();
      setSpinning(false);

      const landingRepeated =
        repeatedSnapshot[finalIndex] ||
        repeatedSnapshot[finalIndex % repeatedSnapshot.length];
      const winner = landingRepeated || chosen;

      const resultId = (winner as any).originalId || winner.id;
      setResult({ id: resultId, name: winner.name, image: winner.image });
      const nowIso = new Date().toISOString();

      (async () => {
        try {
          const { error: histError } = await supabase
            .from("Histories")
            .insert([
              {
                userId: resultId,
                created_at: nowIso,
                inactive: true,
                modify_date: nowIso,
              },
            ]);

          if (histError) {
            console.error("Failed to insert history", histError);
            message.error("Không thể lưu lịch sử quay");
          } else {
            await fetchHistories();
          }
        } catch (err) {
          console.error("Unexpected error saving history", err);
        }
      })();

      const resetBaseIndex =
        Math.floor(REPEAT / 2) * items.length +
        Math.max(0, items.findIndex((i) => i.name === winner.name));
      const baseMove = Math.max(0, resetBaseIndex * ITEM_STEP - centerOffset);
      strip.style.transition = "none";
      strip.style.transform = `translateX(-${baseMove}px)`;
    }, 4150);
  };

  const addTempPlayer = async () => {
    const name = tempName?.trim();
    if (!name) {
      message.warning("Vui lòng nhập tên người chơi tạm thời");
      return;
    }

    const defaultImage =
      "https://res.cloudinary.com/lxthanh269/image/upload/v1762502123/dua_zit/images_pygfgg.jpg";

    try {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .insert([{ name, img: defaultImage, inActive: true }])
        .select();

      if (userError || !userData || userData.length === 0) {
        throw userError || new Error("No user returned");
      }

      const newUser = userData[0] as User;
      setUsers((s) => [...s, newUser]);
      setSelectedIds((s) => [...s, newUser.id]);
      setTempName("");
      message.success("Đã thêm người chơi mới!");
    } catch (err) {
      console.warn("DB insert failed, adding local user fallback", err);
      const id = `temp-${Date.now()}`;
      const u: User = {
        id,
        name,
        image:
          "https://res.cloudinary.com/lxthanh269/image/upload/v1762755701/dua_zit/meme-meo-cuoi-5_ggceyd.jpg",
      };
      setLocalUsers((s) => [...s, u]);
      setSelectedIds((s) => [...s, id]);
      setTempName("");
      message.success("Đã thêm người chơi tạm thời!");
    }
  };

  const onDeleteEntry = async (entry: HistoryEntry) => {
    try {
      await supabase
        .from("Histories")
        .update({ inactive: false, modify_date: new Date().toISOString() })
        .match({ userId: entry.userId, created_at: entry.created_at });
      setHistory((h) =>
        h.filter(
          (x) =>
            !(x.userId === entry.userId && x.created_at === entry.created_at)
        )
      );
      message.success("Đã xóa lượt quay thành công");
    } catch (e) {
      console.error("Failed to delete history entry", e);
      message.error("Không thể xóa lượt quay");
    }
  };

  const onDeleteAll = async () => {
    try {
      const { start, end } = getMonthBounds();
      await supabase
        .from("Histories")
        .update({ inactive: false, modify_date: new Date().toISOString() })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
      setHistory([]);
      message.success("Đã xóa toàn bộ lịch sử tháng này");
    } catch (e) {
      console.error("Failed to delete histories", e);
      message.error("Không thể xóa lịch sử");
    }
  };

  const [containerVisibleWidth, setContainerVisibleWidth] = useState<number>(720);

  useEffect(() => {
    const update = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
      const available = Math.max(ITEM_STEP, vw - (vw < 768 ? 40 : 120));
      setContainerVisibleWidth(Math.min(900, available));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ITEM_STEP]);

  const centerOffset = Math.max((containerVisibleWidth - ITEM_STEP) / 2, 0);
  const initialTranslate =
    Math.floor(REPEAT / 2) * items.length * ITEM_STEP - centerOffset;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 cs-card p-4 sm:p-5 border-l-4 border-l-yellow-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-gaming tracking-wide">
              CS:GO CASE OPENER
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Quay ròm chọn người đi lấy cơm • Tỷ lệ giảm 90% mỗi lần thắng
            </p>
          </div>
        </div>

        {/* Controls: Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="px-3.5 py-2 rounded-lg cs-btn-dark text-xs sm:text-sm font-semibold flex items-center gap-2"
          title="Bật / Tắt âm thanh quay hòm"
        >
          <span>{soundOn ? "🔊 Âm thanh: BẬT" : "🔇 Âm thanh: TẮT"}</span>
        </button>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Interaction & Case Opening */}
        <div className="lg:col-span-8 space-y-6">
          <div className="cs-card p-4 sm:p-6 space-y-5">
            {/* User Selector Component */}
            <UserSelector
              users={combinedUsers}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
              onSelectAll={selectAll}
              onClear={clearSelected}
              loading={usersLoading}
            />

            {/* Temporary Player Input */}
            <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTempPlayer();
                }}
                placeholder="➕ Thêm tên người chơi tạm thời..."
                className="flex-1 px-3.5 py-2 text-sm bg-gray-900/90 border border-gray-700/80 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all"
              />
              <button
                onClick={addTempPlayer}
                className="px-4 py-2 text-sm font-semibold rounded-lg cs-btn-dark flex-shrink-0"
              >
                Thêm tạm
              </button>
            </div>

            {/* Case Opener Strip Carousel */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center justify-between">
                <span>🎯 Ròm quay CS:GO ({items.length} người sẵn sàng)</span>
                {spinning && (
                  <span className="text-yellow-400 font-bold animate-pulse">
                    ⚡ Đang quay ròm...
                  </span>
                )}
              </div>
              <CaseStrip
                repeated={repeated}
                stripRef={stripRef}
                itemWidth={ITEM_WIDTH}
                itemGap={ITEM_GAP}
                initialTranslate={initialTranslate}
                containerWidth={containerVisibleWidth}
              />
            </div>

            {/* Action Spin Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onOpen}
                disabled={spinning || items.length === 0}
                className="flex-1 py-3.5 rounded-xl cs-btn-gold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {spinning ? "ĐANG QUAY RÒM..." : "🚀 BẮT ĐẦU QUAY HÒM!"}
              </button>
              <button
                onClick={clearSelected}
                disabled={spinning || selectedIds.length === 0}
                className="sm:w-44 py-3.5 rounded-xl cs-btn-dark text-xs sm:text-sm font-bold text-gray-300 disabled:opacity-40"
              >
                ✕ Bỏ chọn tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - History, Leaderboard & Monthly Stats */}
        <div className="lg:col-span-4">
          <div className="cs-card p-4 sm:p-5 space-y-4">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-900/90 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  activeTab === "history"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📜 Lịch sử
              </button>
              <button
                onClick={() => setActiveTab("monthlyCount")}
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  activeTab === "monthlyCount"
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📅 Trong tháng
              </button>
              <button
                onClick={() => setActiveTab("topWinners")}
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  activeTab === "topWinners"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                🏆 Top Thắng
              </button>
            </div>

            {/* Tab Panel Content */}
            <div className="history-panel">
              {activeTab === "history" && (
                <HistoryList
                  history={history}
                  users={combinedUsers}
                  onDeleteEntry={onDeleteEntry}
                  onDeleteAll={onDeleteAll}
                  loading={historyLoading}
                />
              )}
              {activeTab === "monthlyCount" && (
                <MonthlyCountList history={history} users={combinedUsers} />
              )}
              {activeTab === "topWinners" && (
                <TopWinners users={combinedUsers} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Unboxing Modal Overlay - Centered, Transparent Background, Top-Right X Close Button */}
      <CSCase3D winner={result} onClose={() => setResult(null)} />
    </div>
  );
}
