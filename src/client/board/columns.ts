/** Status column derivation for the task board — pure functions over the
 * sessions list projection (runtime's byId shape: id / displayTitle / running /
 * completed / pendingInteraction / blank / updatedAt / parentId / origin) plus
 * the subagent catalog (subagentsByParent) for authoritative per-card agent
 * execution totals.
 *
 * Task lifecycle (five columns — 待执行 / 进行中 / 需要处理 / 验收中 / 已完成):
 *
 *   待执行 ──开始执行──▶ 进行中 ──全部 Agent 完成──▶ 验收中 ──验收通过──▶ 已完成
 *                        │  ▲                        │
 *                需要人工 │  │ 处理完成               │ 验收失败
 *                        ▼  │                        ▼
 *                    需要处理 ──────────────────▶ 进行中（重新执行）
 *
 * 需要处理 is a BRANCH state, not a mandatory hop; 失败 and 暂停 are task-level
 * operation states shown ON cards, never extra columns.
 *
 * State mapping on the runtime projection (no backend changes — the host has
 * no acceptance/review state today, so 验收中 is a front-end mapping, see
 * taskStatusOf): the runtime itself treats a pending user interaction
 * (approval / plan-review / question) as PRIMARY, outranking live running
 * (dsh-client-ui-workspace renders the amber warning before the running
 * indicator), so a session blocked on the user belongs in 需要处理 even while
 * its turn is technically open.
 *
 * Workspace mapping rides the workspaces list projection (workspace views
 * carry a sessionIds array — runtime's workspace.list shape). */

export type TaskStatus =
  | "pending"          // 待执行 — created, not started
  | "running"          // 进行中 — turn open, agent(s) executing
  | "paused"           // ⏸ 已暂停 — client-side pause mark; stays in the running column
  | "action_required"  // 需要处理 — user interaction blocking the agent
  | "reviewing"        // 验收中 — execution finished, final acceptance pending
  | "completed";       // 已完成 — accepted

/** Column keys — every status except the card-level "paused" pseudo-state. */
export type ColumnKey = Exclude<TaskStatus, "paused">;

export const COLUMNS: { key: ColumnKey; dot: string }[] = [
  { key: "pending", dot: "var(--bb-brand)" },
  { key: "running", dot: "var(--bb-col-running)" },
  { key: "action_required", dot: "var(--bb-col-pending)" },
  { key: "reviewing", dot: "var(--bb-brand)" },
  { key: "completed", dot: "var(--bb-col-done)" }
];

/** Full task lifecycle status for one session; null hides it (blank drafts).
 *
 * Priority: 需要处理 (live user-blocking interaction — the runtime's own
 * presentation gives it precedence over running) → 进行中 (turn open) →
 * paused (client pause mark; the card stays in the 进行中 column) → 验收中 →
 * 已完成.
 *
 * TODO(acceptance): the host exposes no review/acceptance state. 验收中 is a
 * front-end mapping onto the runtime's real `completed` flag (the host's
 * "finished while not selected and not yet opened" reminder, cleared on
 * open): an agent task whose execution closed but which nobody has reviewed
 * yet is shown as awaiting final acceptance, and opening it (the review) is
 * the acceptance step. Replace with a real master-agent/acceptance RPC when
 * the backend grows one. */
export function taskStatusOf(session, paused = false) {
  if (session.blank) return null;
  if (session.pendingInteraction) return "action_required";
  if (session.running) return "running";
  if (paused) return "paused";
  if (session.completed === true) return "reviewing";
  return "completed";
}

/** Column a session card belongs to; null hides it (blank drafts). */
export function columnOf(session, paused = false) {
  const status = taskStatusOf(session, paused);
  return status === null ? null : status === "paused" ? "running" : status;
}

/** Card badge status for a rendered card (blank sessions never render). */
export function cardStatusOf(session, paused = false) {
  return taskStatusOf(session, paused) ?? "completed";
}

/** Direct-children index: parentId -> child session ids (one pass). */
export function childrenMapOf(ids, byId) {
  const childrenOf = new Map();
  for (const id of ids) {
    const parentId = byId[id]?.parentId;
    if (parentId === undefined) continue;
    const list = childrenOf.get(parentId) ?? [];
    list.push(id);
    childrenOf.set(parentId, list);
  }
  return childrenOf;
}

/** Per-card sub-agent execution totals — never fabricated, always real data.
 *
 * Two honest sources, merged:
 *  - the sessions list: every session whose parentId is the card id (always
 *    available) supplies running vs done vs waiting via the child's live
 *    running bit and the runtime's `completed` flag;
 *  - the subagent catalog (subagentsByParent), once its pull settled
 *    (state === "ready"): the authoritative direct-child catalog. Its
 *    activity bit overrides the list bit, its diagnostic rows (corrupt /
 *    unsupported / unavailable) count as failed (✕), and children it knows
 *    that already left the list are still counted.
 * Without a settled catalog the counts fold from the list alone and failed
 * stays 0.
 *
 * TODO(agent-state): the runtime reports no durable queued/failed outcome for
 * children (the subagent catalog exposes only running/inactive — see
 * dsh-client-ui-subagent's own "the catalog has no durable outcome" note).
 * A child counts as waiting (○) only while its parent session is executing
 * and the runtime has NOT flagged its completion — the honest reading of the
 * flags; replace with the real per-child queue state once the host reports
 * one. */
export function agentStatsOf(parentId, byId, childrenOf, subagentsByParent) {
  const childIds = childrenOf.get(parentId) ?? [];
  const catalog = subagentsByParent?.[parentId];
  const ready = catalog != null && catalog.state === "ready" && Array.isArray(catalog.entries);
  const failedIds = new Set();
  const activityOf = new Map();
  if (ready) {
    for (const entry of catalog.entries) {
      if (entry.kind === "diagnostic") failedIds.add(entry.id);
      else activityOf.set(entry.id, entry.activity === "running");
    }
  }
  // A child can only be genuinely queued while its parent is executing.
  const parentLive = byId[parentId]?.running === true;
  let running = 0;
  let done = 0;
  let waiting = 0;
  let failed = 0;
  for (const kid of childIds) {
    const child = byId[kid];
    if (child === undefined || child.blank) continue;
    if (failedIds.has(kid)) { failed += 1; continue; }
    const live = activityOf.get(kid);
    if (live !== undefined ? live : child.running) { running += 1; continue; }
    if (parentLive && child.completed !== true) waiting += 1;
    else done += 1;
  }
  if (ready) {
    for (const entry of catalog.entries) {
      if (childIds.includes(entry.id)) continue;
      if (entry.kind === "diagnostic") failed += 1;
      else if (entry.activity === "running") running += 1;
      else done += 1; // catalog-only child past its list lifetime — done
    }
  }
  return {
    agentRunning: running,
    agentDone: done,
    agentWaiting: waiting,
    agentFailed: failed,
    agentTotal: running + done + waiting + failed
  };
}

/** Split the list projection into column item lists, newest activity first.
 * Only MAIN tasks become cards (subagent sessions carry parentId and are
 * aggregated into per-card agent counts instead); planning sessions (plans)
 * are excluded — they live in the 待执行 column until executed. Paused ids
 * (board store) keep their cards in the 进行中 column with the ⏸ badge. */
export function buildColumns(ids, byId, jobsBySession, planningIds, subagentsByParent, pausedIds) {
  const planning = new Set(planningIds ?? []);
  const paused = new Set(pausedIds ?? []);
  const buckets = { pending: [], running: [], action_required: [], reviewing: [], completed: [] };
  const childrenOf = childrenMapOf(ids, byId);
  for (const id of ids) {
    const session = byId[id];
    if (session === undefined) continue;
    if (session.parentId !== undefined) continue; // subagent session — not a card
    if (planning.has(id)) continue; // plan — stays in the 待执行 column
    const stats = agentStatsOf(id, byId, childrenOf, subagentsByParent);
    let status = taskStatusOf(session, paused.has(id));
    if (status === null) continue;
    // 验收中 requires actual agent work — a plain Q&A session has no
    // acceptance step and goes straight to 已完成 (see taskStatusOf TODO).
    if (status === "reviewing" && stats.agentTotal === 0) status = "completed";
    const key = status === "paused" ? "running" : status;
    const jobs = Array.isArray(jobsBySession?.[id]) ? jobsBySession[id].length : 0;
    buckets[key].push({ id, session, jobs, status, ...stats });
  }
  for (const list of Object.values(buckets)) {
    list.sort((a, b) => (b.session.updatedAt ?? 0) - (a.session.updatedAt ?? 0));
  }
  return buckets;
}

/** Host workspace views (workspaceId / title / path / sessionIds) from the
 * workspaces list store. The list items ARE the raw host views (the official
 * workspace browser reads item.sessionIds directly — no getSnapshot wrapper). */
export function workspaceViewsOf(list) {
  const views = [];
  for (const item of list?.items ?? []) {
    if (item !== null && typeof item === "object" && item.workspaceId !== undefined) {
      views.push(item);
    }
  }
  return views;
}

/** Stable per-workspace accent colors (tower.im-style project labels). */
export const WORKSPACE_COLORS = [
  "#4176e6",
  "#1da565",
  "#e08800",
  "#d64545",
  "#8b5cf6",
  "#0e9aa7",
  "#e35db0",
  "#6b7280"
];

/** Workspace accent color, stable by the workspace's position in the list. */
export function workspaceColorOf(views, workspaceId) {
  const idx = views.findIndex((v) => v.workspaceId === workspaceId);
  if (idx === -1) return "var(--bb-text-3)";
  return WORKSPACE_COLORS[idx % WORKSPACE_COLORS.length];
}

/** Workspace owning a session; "" means ungrouped (no workspace claims it). */
export function workspaceIdOfSession(views, sessionId) {
  for (const view of views) {
    if (Array.isArray(view.sessionIds) && view.sessionIds.includes(sessionId))
      return view.workspaceId;
  }
  return "";
}

/** Apply the workspace filter to the flat session id list. */
export function filterSessionsByWorkspace(ids, byId, views, filter) {
  if (filter == null) return ids;
  const allowed = new Set(views.find((v) => v.workspaceId === filter)?.sessionIds ?? []);
  return ids.filter((id) => allowed.has(id));
}

/** Compact relative time for a card footer. */
export function relativeTime(updatedAt, t) {
  if (!updatedAt) return "";
  const diff = Date.now() - updatedAt;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t("card.now");
  if (min < 60) return min + " " + t("card.min");
  const hour = Math.floor(min / 60);
  if (hour < 24) return hour + " " + t("card.hour");
  const day = Math.floor(hour / 24);
  if (day < 30) return day + " " + t("card.day");
  const d = new Date(updatedAt);
  return (d.getMonth() + 1) + "/" + d.getDate();
}

/** A planning session starts executing when the user says so IN the chat. */
export const START_RE = /^(开始执行|开始任务|执行计划|执行吧|开始吧|请开始|start|execute)/i;
/** Read-only inspection tools a planning conversation may legitimately use;
 * any OTHER tool call means the session is actually executing work (非plan) —
 * it leaves the 待执行 column and flows into the normal status columns. */
export const READ_ONLY_TOOLS = new Set(["read", "read_image", "grep", "glob", "web_search", "skill", "list_agents", "get_goal", "job_list", "job_output"]);

/** Did a planning conversation actually START executing? Two real signals,
 * read off the runtime conversation nodes (ConversationNode shapes):
 *  - the user's LAST text message matches a start command (开始执行 etc.);
 *  - any assistant step carried a non-read-only tool call (writing files,
 *    running commands, spawning subagents — real execution actions).
 * Node shapes are the runtime's own: user nodes carry a top-level
 * `content: ContentBlock[]` (`{type:"text",text}` blocks), assistant nodes a
 * top-level `blocks: AssistantBlock[]` (`{kind:"tool-call",name}` blocks). */
export function planStartedInConversation(nodes, readOnlyTools = READ_ONLY_TOOLS) {
  if (!Array.isArray(nodes)) return false;
  const userNodes = nodes.filter((n) => n.kind === "user");
  const last = userNodes[userNodes.length - 1];
  const text = Array.isArray(last?.content)
    ? last.content.filter((c) => c?.type === "text" && typeof c.text === "string").map((c) => c.text).join(" ").trim()
    : "";
  if (START_RE.test(text)) return true;
  for (const node of nodes) {
    if (node.kind !== "assistant" || !Array.isArray(node.blocks)) continue;
    if (node.blocks.some((b) => b?.kind === "tool-call" && typeof b.name === "string" && b.name !== "" && !readOnlyTools.has(b.name))) return true;
  }
  return false;
}
