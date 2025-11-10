import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Row, Col, message } from "antd";
import sample from "lodash/sample";
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

  const stripRef = useRef<HTMLDivElement | null>(null);

  const ITEM_WIDTH = 160;
  const ITEM_GAP = 24; // px gap between items (matches Tailwind mx-3 total)
  const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // full step from one item left edge to next
  // REPEAT controls how many times the items are repeated to form the strip.
  // We'll compute it dynamically below (after `items`) so we don't create many
  // duplicates when only a few items are selected.

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const items = React.useMemo<Item[]>(
    () =>
      users
        .filter((u) => selectedIds.includes(u.id))
        // Supabase returns the image url in the `img` field; fall back to `image` if present
        .map((u) => ({
          id: u.id,
          name: u.name,
          image: (u as any).img || u.image || "",
        })),
    [users, selectedIds]
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

  // Load history entries from Supabase `Histories` table on mount and
  // populate the local `history` state so the HistoryList shows persisted
  // records across page loads.
  useEffect(() => {
    let mounted = true;
    const fetchHistories = async () => {
      try {
        const { data, error } = await supabase
          .from("Histories")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (!mounted) return;

        if (error) {
          console.error("Failed to load histories", error);
          message.error("Không thể tải lịch sử");
          return;
        }

        // Map DB rows to structured HistoryEntry objects containing the
        // created_at timestamp and the stored user id (username column
        // currently contains the user id in this project).
        const entries: HistoryEntry[] = (data || []).map((h: any) => {
          const created = h.created_at || h.createdAt || "";
          // Histories currently stores the user id in `username` column
          const userId = h.username || h.userId || h.user || "";
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

  const toggleSelected = (id: string) => {
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const selectAll = () => setSelectedIds(users.map((u) => u.id));

  const clearSelected = () => setSelectedIds([]);

  const onOpen = () => {
    if (items.length === 0) {
      message.warning("Hãy thêm ít nhất 1 người trước khi quay");
      return;
    }
    setSpinning(true);
    setResult(null);

    // Pick a random item from the current `items` list so the result is
    // random each time. `sample` returns undefined for empty arrays, but we
    // guard above against empty `items` so this is safe.
    const chosen = (sample(items) as Item) || items[0];

    // Find the chosen item's index within the unique items array (0..items.length-1)
    const chosenLocalIndexRaw = items.findIndex((i) => i.name === chosen.name);
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

      // Save winner to Supabase `Histories` table
      (async () => {
        try {
          const { data: histData, error: histError } = await supabase
            .from("Histories")
            .insert([{ userId: resultId, created_at: new Date().toString() }])
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

  // Limit the visible container width so selecting many items doesn't expand
  // the container off-screen. Keep at least one item width, but cap to 900px
  // (adjustable) for large selections.
  const containerVisibleWidth = Math.max(
    Math.min(items.length * ITEM_STEP, 900),
    ITEM_STEP
  );

  // Offset to center an item under the fixed marker in the middle of the
  // container. We subtract this from translate values so the chosen item's
  // center aligns with the marker instead of the left edge.
  const centerOffset = Math.max((containerVisibleWidth - ITEM_STEP) / 2, 0);

  const initialTranslate =
    Math.floor(REPEAT / 2) * items.length * ITEM_STEP - centerOffset;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 items-start">
        <div className="w-full">
          <Card title="Case Opener" className="playful-card w-full">
            <Row gutter={16} className="mb-4">
              <Col span={24}>
                <UserSelector
                  users={users}
                  selectedIds={selectedIds}
                  onToggle={toggleSelected}
                  onSelectAll={selectAll}
                  onClear={clearSelected}
                  loading={usersLoading}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col span={24} className="flex justify-center">
                <CaseStrip
                  repeated={repeated}
                  stripRef={stripRef}
                  itemWidth={ITEM_WIDTH}
                  itemGap={ITEM_GAP}
                  initialTranslate={initialTranslate}
                  containerWidth={containerVisibleWidth}
                />
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Button
                  className="playful-btn bg-gradient-to-r from-kid-pink to-kid-orange"
                  type="primary"
                  onClick={onOpen}
                  loading={spinning}
                >
                  Mở hòm
                </Button>
              </Col>
              <Col span={12} className="text-right">
                <Button
                  className="playful-btn bg-white text-gray-800"
                  onClick={() => {
                    setUsers([]);
                    setResult(null);
                    setHistory([]);
                  }}
                >
                  Xóa tất cả
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        <div className="w-full">
          <Card title="Lịch sử" className="playful-card w-full">
            <HistoryList history={history} users={users} />
          </Card>
        </div>
      </div>

      <ResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
