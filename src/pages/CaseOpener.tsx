import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Row, Col, message } from "antd";
// small weighted picker implemented locally (no extra dependency)
import type { Item, User, HistoryEntry } from "../types";
import CaseStrip from "../components/CaseStrip";
import HistoryList from "../components/HistoryList";
import ResultModal from "../components/ResultModal";
import UserSelector from "../components/UserSelector";
import supabase from "../lib/supabase";

// Users will be loaded from Supabase `User` table

export default function CaseOpener(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [tempName, setTempName] = useState("");

  const stripRef = useRef<HTMLDivElement | null>(null);

  const ITEM_WIDTH = 160;
  const ITEM_GAP = 24; // px gap between items (matches Tailwind mx-3 total)
  const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // full step from one item left edge to next
  // REPEAT controls how many times the items are repeated to form the strip.
  // We'll compute it dynamically below (after `items`) so we don't create many
  // duplicates when only a few items are selected.

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Combine DB users and local ad-hoc users so both can be selected for a spin
  const combinedUsers = React.useMemo(
    () => [...users, ...localUsers],
    [users, localUsers]
  );

  const items = React.useMemo<Item[]>(
    () =>
      combinedUsers
        .filter((u) => selectedIds.includes(u.id))
        // Supabase returns the image url in the `img` field; fall back to `image` if present
        .map((u) => ({
          id: u.id,
          name: u.name,
          image: (u as any).img || u.image || "",
        })),
    [combinedUsers, selectedIds]
  );

  // Choose a smaller repeat count when there are very few items so we don't
  // render a long strip of identical copies (e.g. selecting 1 user shouldn't
  // produce 24 visible clones). Keep a bigger repeat for smooth animation
  // when there are many items.
  const REPEAT = items.length <= 1 ? 6 : 24;

  const repeated = React.useMemo(() => {
    const out: (Item & { originalId?: string })[] = [];
    for (let r = 0; r < REPEAT; r++) {
      for (const it of items)
        out.push({ ...it, originalId: it.id, id: `${it.id}-${r}` });
    }
    return out;
  }, [items, REPEAT]);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      const { data, error } = await supabase.from("User").select("*");
      if (!mounted) return;
      if (error) {
        console.error("Failed to load users", error);
        message.error("Không thể tải người dùng");
        setUsers([]);
      } else {
        setUsers((data as User[]) || []);
      }
      setUsersLoading(false);
    };
    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper: compute start (Monday) and end (Friday) of current week for resets
  const getWeekBounds = () => {
    const now = new Date();
    const date = new Date(now);
    // JS: 0=Sun,1=Mon,... Normalize so Monday is day 0
    const day = date.getDay();
    const diffToMon = (day + 6) % 7; // days since Monday
    const mon = new Date(date);
    mon.setDate(date.getDate() - diffToMon);
    mon.setHours(0, 0, 0, 0);
    const fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);
    fri.setHours(23, 59, 59, 999);
    return { start: mon, end: fri };
  };

  // Load histories limited to the current week and remove older week data on startup
  useEffect(() => {
    let mounted = true;
    const fetchHistories = async () => {
      try {
        const { start, end } = getWeekBounds();
        const startISO = start.toISOString();
        const endISO = end.toISOString();

        // Remove any old histories (before this week's Monday)
        try {
          await supabase.from("Histories").delete().lt("created_at", startISO);
        } catch (e) {
          // ignore deletion errors but log
          console.warn("Failed to delete old histories at startup", e);
        }

        const { data, error } = await supabase
          .from("Histories")
          .select("*")
          .gte("created_at", startISO)
          .lte("created_at", endISO)
          .order("created_at", { ascending: false })
          .limit(200);

        if (!mounted) return;

        if (error) {
          console.error("Failed to load histories", error);
          message.error("Không thể tải lịch sử");
          return;
        }

        const entries: HistoryEntry[] = (data || []).map((h: any) => {
          const created = h.created_at || h.createdAt || "";
          const userId = h.userId || h.username || h.user || "";
          return { created_at: created, userId };
        });

        setHistory(entries);
      } catch (err) {
        console.error("Unexpected error loading histories", err);
        if (mounted) message.error("Không thể tải lịch sử");
      }
    };

    fetchHistories();
    return () => {
      mounted = false;
    };
  }, []);

  // Note: histories are loaded / trimmed in the startup effect above (filtered to current week)

  const toggleSelected = (id: string) => {
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const selectAll = () => setSelectedIds(combinedUsers.map((u) => u.id));

  const clearSelected = () => setSelectedIds([]);

  const onOpen = () => {
    if (items.length === 0) {
      message.warning("Hãy thêm ít nhất 1 người trước khi quay");
      return;
    }
    setSpinning(true);
    setResult(null);

    // Build wins count for this week and compute weights per player.
    const winsCount = history.reduce<Record<string, number>>((m, e) => {
      m[e.userId] = (m[e.userId] || 0) + 1;
      return m;
    }, {});

    const weightMap: Record<string, number> = {};
    for (const it of items) {
      const wins = winsCount[it.id] || 0;
      // Reduce by 80% per win -> multiply weight by 0.2 each time
      weightMap[it.id] = Math.pow(0.2, wins);
      // ensure non-zero
      if (!isFinite(weightMap[it.id]) || weightMap[it.id] <= 0)
        weightMap[it.id] = 0.000001;
    }

    // Weighted random pick
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

    // Find the chosen item's index within the unique items array (0..items.length-1)
    const chosenLocalIndexRaw = items.findIndex((i) => i.id === chosen.id);
    const chosenLocalIndex = chosenLocalIndexRaw >= 0 ? chosenLocalIndexRaw : 0;

    // Compute a base index centered in the repeated strip and add a number of full rotations
    const baseIndex =
      Math.floor(REPEAT / 2) * items.length + (chosenLocalIndex || 0);
    const rotations = 6; // full cycles before landing
    const finalIndex = baseIndex + items.length * rotations;
    const final = Math.max(0, finalIndex * ITEM_STEP - centerOffset);

    const repeatedSnapshot = repeated.slice();

    const strip = stripRef.current;
    if (!strip) return;

    strip.style.transition = "transform 4s cubic-bezier(.17,.67,.34,1)";
    strip.style.transform = `translateX(-${final}px)`;

    setTimeout(() => {
      setSpinning(false);

      const landingRepeated =
        repeatedSnapshot[finalIndex] ||
        repeatedSnapshot[finalIndex % repeatedSnapshot.length];
      const winner = landingRepeated || chosen;

      // If the winner is a cloned item from `repeated`, prefer its originalId
      // (we stored it on the clone) so saved/displayed id is the user's real id.
      const resultId = (winner as any).originalId || winner.id;
      setResult({ id: resultId, name: winner.name, image: winner.image });
      const entry: HistoryEntry = {
        created_at: new Date().toISOString(),
        userId: resultId,
      };
      setHistory((h) => [...h, entry]);

      // Save winner to Supabase `Histories` table (use ISO timestamp)
      (async () => {
        try {
          const { data: histData, error: histError } = await supabase
            .from("Histories")
            .insert([
              { userId: resultId, created_at: new Date().toISOString() },
            ])
            .select();

          if (histError) {
            console.error("Failed to insert history", histError);
            message.error("Không thể lưu lịch sử");
          } else {
            // Optionally do something with histData, e.g., console.log or update UI
            // console.log('History saved', histData);
          }
        } catch (err) {
          console.error("Unexpected error saving history", err);
          message.error("Không thể lưu lịch sử");
        }
      })();

      const baseIndex =
        Math.floor(REPEAT / 2) * items.length +
        Math.max(
          0,
          items.findIndex((i) => i.name === winner.name)
        );
      const baseMove = Math.max(0, baseIndex * ITEM_STEP - centerOffset);
      strip.style.transition = "none";
      strip.style.transform = `translateX(-${baseMove}px)`;
    }, 4200);
  };

  // Add a temporary (ad-hoc) player that is NOT saved to DB
  const addTempPlayer = () => {
    const name = tempName?.trim();
    if (!name) {
      message.warning("Nhập tên người chơi tạm thời");
      return;
    }
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
  };

  // Delete a single history entry (by exact created_at + userId match)
  const onDeleteEntry = async (entry: HistoryEntry) => {
    try {
      await supabase
        .from("Histories")
        .delete()
        .match({ userId: entry.userId, created_at: entry.created_at });
      setHistory((h) =>
        h.filter(
          (x) =>
            !(x.userId === entry.userId && x.created_at === entry.created_at)
        )
      );
      message.success("Đã xóa bản ghi");
    } catch (e) {
      console.error("Failed to delete history entry", e);
      message.error("Không thể xóa bản ghi");
    }
  };

  // Delete all histories for current week
  const onDeleteAll = async () => {
    try {
      const { start, end } = getWeekBounds();
      await supabase
        .from("Histories")
        .delete()
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
      setHistory([]);
      message.success("Đã xóa lịch sử tuần");
    } catch (e) {
      console.error("Failed to delete all histories", e);
      message.error("Không thể xóa lịch sử");
    }
  };

  // Use a fixed, responsive visible container width so the selection box
  // does NOT stretch/shrink as the number of items changes. We compute a
  // reasonable max (900px) but adapt to window width on small screens.
  const FIXED_MAX_VISIBLE = 900;
  const [containerVisibleWidth, setContainerVisibleWidth] =
    React.useState<number>(
      // safe initial: at least one item width
      Math.max(ITEM_STEP, Math.min(FIXED_MAX_VISIBLE, 720))
    );

  React.useEffect(() => {
    const update = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
      // subtract approximate page paddings/margins so the strip fits nicely
      const available = Math.max(ITEM_STEP, vw - 160);
      const chosen = Math.min(FIXED_MAX_VISIBLE, available);
      setContainerVisibleWidth(Math.max(ITEM_STEP, chosen));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ITEM_STEP]);

  // Offset to center an item under the fixed marker in the middle of the
  // container. We subtract this from translate values so the chosen item's
  // center aligns with the marker instead of the left edge.
  const centerOffset = Math.max((containerVisibleWidth - ITEM_STEP) / 2, 0);

  const initialTranslate =
    Math.floor(REPEAT / 2) * items.length * ITEM_STEP - centerOffset;

  return (
    <div className="p-6 min-w-[640px] mx-auto">
      {/* Single-page two-column layout: left = main interaction, right = history */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="basis-[70%]">
          <Card title="Vòng quay may mắn" className="soft-card w-full">
            <div className="mb-4">
              <UserSelector
                users={combinedUsers}
                selectedIds={selectedIds}
                onToggle={toggleSelected}
                onSelectAll={() =>
                  setSelectedIds(combinedUsers.map((u) => u.id))
                }
                onClear={clearSelected}
                loading={usersLoading}
              />
            </div>

            <div className="mb-3 flex gap-2 items-center">
              <input
                type="text"
                value={tempName}
                onChange={(e) =>
                  setTempName((e.target as HTMLInputElement).value)
                }
                placeholder="Thêm tên tạm thời..."
                className="border rounded p-2 flex-1"
              />
              <Button onClick={addTempPlayer} type="default">
                Thêm tạm
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex justify-center">
                <CaseStrip
                  repeated={repeated}
                  stripRef={stripRef}
                  itemWidth={ITEM_WIDTH}
                  itemGap={ITEM_GAP}
                  initialTranslate={initialTranslate}
                  containerWidth={containerVisibleWidth}
                />
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <Button
                  className="playful-btn bg-gradient-to-r from-kid-pink to-kid-orange w-full"
                  type="primary"
                  onClick={onOpen}
                  loading={spinning}
                >
                  Mở hòm
                </Button>
              </div>
              <div className="w-40">
                <Button
                  className="playful-btn bg-white text-gray-800 w-full"
                  onClick={() => {
                    setUsers([]);
                    setResult(null);
                    setHistory([]);
                  }}
                >
                  Xóa tất cả
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="basis-[30%]">
          <Card title="Lịch sử" className="soft-card w-full">
            <div className="history-panel -mx-4 px-4">
              <HistoryList
                history={history}
                users={combinedUsers}
                onDeleteEntry={onDeleteEntry}
                onDeleteAll={onDeleteAll}
              />
            </div>
          </Card>
        </div>
      </div>

      <ResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
