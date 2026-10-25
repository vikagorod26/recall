import { useCallback, useMemo, useState } from "react";
import { load, save } from "./storage.js";

// Infinite, non-repeating deck ("shuffle bag").
// Every tip in the pool is shown once, in random order, before any repeats.
// When a round is used up a new shuffled round starts; the tips already
// waiting in the queue are moved to the end of that round so nothing shows
// twice in a row. With `persistKey`, tips seen in earlier visits are skipped
// until the round is complete.
// `lead`: tips dealt first, in random order, before the shuffle bag (used for
// the tips of the chosen "why play?" reason). They're shown once per change
// and don't count toward the round.

const LOOKAHEAD = 3; // top card + 2 behind it

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function topUp(queue, poolIds) {
  let q = queue;
  while (q.length < LOOKAHEAD + 1) {
    const round = shuffle(poolIds);
    const waiting = new Set(q);
    q = [...q, ...round.filter(id => !waiting.has(id)), ...round.filter(id => waiting.has(id))];
  }
  return q;
}

export function useInfiniteDeck(pool, { persistKey, lead = [] } = {}) {
  const poolIds = useMemo(() => pool.map(t => t.id), [pool]);
  const leadKey = lead.map(t => t.id).join(",");
  const byId = useMemo(
    () => Object.fromEntries([...pool, ...lead].map(t => [t.id, t])),
    [pool, leadKey],
  );
  const poolKey = poolIds.join(",") + "|" + leadKey;

  const init = () => {
    const inPool = new Set(poolIds);
    let seen = (persistKey ? load(persistKey, []) : []).filter(id => inPool.has(id));
    if (seen.length >= poolIds.length) seen = [];
    const seenSet = new Set(seen);
    const unseen = shuffle(poolIds.filter(id => !seenSet.has(id)));
    const leadIds = shuffle(lead.map(t => t.id).filter(id => !inPool.has(id)));
    return { poolKey, seen, queue: [...leadIds, ...topUp(unseen, poolIds)] };
  };

  const [state, setState] = useState(init);
  // pool changed (different categories): start over from that pool
  const current = state.poolKey === poolKey ? state : init();
  if (current !== state) setState(current);

  const advance = useCallback(() => {
    setState(s => {
      const [shown, ...rest] = s.queue;
      const counts = poolIds.includes(shown) && !s.seen.includes(shown);
      let seen = counts ? [...s.seen, shown] : s.seen;
      if (seen.length >= poolIds.length) seen = []; // round complete
      if (persistKey) save(persistKey, seen);
      return { ...s, seen, queue: topUp(rest, poolIds) };
    });
  }, [poolIds, persistKey]);

  const visible = current.queue.slice(0, LOOKAHEAD).map(id => byId[id]);
  return { visible, advance };
}
