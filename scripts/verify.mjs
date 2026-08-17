// Smoke test: load the built bundle the way the web shell does and assert
// the full take-over contract: root registration (priority -1, five child
// slots), layout service, locale dict, theme presenter, CSS injection,
// board + palette registrations.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const code = readFileSync(join(root, "lib/client.js"), "utf8");

// --- document/window stubs (the bundle touches them in ThemePresenter) ---
const bodyAttrs = {};
const bodyProps = new Map();
const headNodes = [];
globalThis.document = {
  createElement: () => ({ dataset: {}, textContent: "", isConnected: false, remove: () => {} }),
  head: { append: (n) => headNodes.push(n), appendChild: (n) => headNodes.push(n) },
  body: {
    style: { setProperty: (k, v) => bodyProps.set(k, v), removeProperty: (k) => bodyProps.delete(k) },
    setAttribute: (k) => { bodyAttrs[k] = true; },
    removeAttribute: (k) => { delete bodyAttrs[k]; }
  },
  documentElement: { style: { removeProperty: () => {} } }
};
globalThis.getComputedStyle = () => ({ backgroundColor: "rgb(18,20,23)" });
globalThis.window = { innerWidth: 1440 };

let handoff;
globalThis.window.__ModuleLoader__ = { load: (h) => { handoff = h; } };
new Function(code)();
if (!handoff || handoff.id !== "@deepseek-ai/dsh-board-ui") throw new Error("bundle did not register via __ModuleLoader__.load");

const require2 = createRequire("/Users/lvyx/.npm/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-runtime/package.json");
const exports_ = handoff.factory(require2);
if (typeof exports_.apply !== "function") throw new Error("factory did not return apply");
const expectedInject = ["slots", "theme", "locale", "sessions", "workspaces"];
if (JSON.stringify(exports_.inject) !== JSON.stringify(expectedInject))
  throw new Error("inject mismatch: " + JSON.stringify(exports_.inject));

// --- ctx stub and apply ---
const registrations = [];
const provided = {};
const localeRegs = [];
const opened = [];
const setThemeCalls = [];
const themeListeners = [];
let rootInject;
const ctx = {
  effect: (fn) => { fn(); return () => {}; },
  locale: { register: (ns, dicts) => localeRegs.push([ns, Object.keys(dicts)]) },
  theme: {
    getTheme: () => ({ preference: "system", active: { colorScheme: "light", tokens: { "--probe": "1" } }, themes: [], revision: 0 }),
    setTheme: (id) => setThemeCalls.push(id)
  },
  on: (ev, fn) => { if (ev === "theme/change") themeListeners.push(fn); return () => {}; },
  slots: {
    register: (opts, comp) => {
      registrations.push({
        name: opts.name, id: opts.id, priority: opts.priority, order: opts.order,
        locale: opts.locale, hasStore: opts.store !== undefined,
        children: opts.children ? Object.keys(opts.children).sort() : undefined,
        hasComponent: typeof comp === "function"
      });
      if (opts.name === "root" && opts.inject) {
        const stubActions = { syncTheme: () => {}, toggleSidebar: () => {}, openDetails: () => {}, closeDetails: () => {} };
        rootInject = opts.inject(stubActions);
      }
      return () => {};
    }
  },
  reflect: { provide: (name, svc) => { provided[name] = svc; return () => {}; } },
  sessions: { open: (id) => opened.push(id), list: { subscribe: () => () => {}, getSnapshot: () => ({ current: undefined }) } },
  workspaces: {}
};
exports_.apply(ctx);

// --- assertions ---
const rootReg = registrations.find((r) => r.name === "root");
if (!rootReg) throw new Error("no root registration");
if (rootReg.priority !== -1) throw new Error("root priority must be -1, got " + rootReg.priority);
const wantChildren = ["activity", "board", "conversation", "details", "shell.overlay", "sidebar"];
if (JSON.stringify(rootReg.children) !== JSON.stringify(wantChildren))
  throw new Error("root children mismatch: " + JSON.stringify(rootReg.children));
if (!rootReg.hasComponent || !rootReg.hasStore) throw new Error("root entry missing component/store");

const boardReg = registrations.find((r) => r.name === "board");
if (!boardReg || !boardReg.hasStore || boardReg.locale !== "board") throw new Error("board registration wrong");
const paletteReg = registrations.find((r) => r.name === "shell.overlay");
if (!paletteReg || paletteReg.id !== "board-palette") throw new Error("palette registration wrong");
const actReg = registrations.find((r) => r.name === "activity");
if (!actReg || !actReg.hasComponent) throw new Error("activity registration wrong");

if (!provided.layout || typeof provided.layout.toggleSidebar !== "function"
  || typeof provided.layout.openDetails !== "function" || typeof provided.layout.closeDetails !== "function")
  throw new Error("layout service not provided");
if (localeRegs.length !== 1 || localeRegs[0][0] !== "board") throw new Error("locale dict not registered");

// theme presenter: tokens written, light scheme -> no dark attribute
if (!bodyProps.has("--probe")) throw new Error("theme tokens not applied to body");
if (bodyAttrs["data-ds-dark-theme"]) throw new Error("dark attribute set for light scheme");
// dark snapshot through the listener
themeListeners.forEach((fn) => fn({ preference: "dark", active: { colorScheme: "dark", tokens: {} } }));
if (!bodyAttrs["data-ds-dark-theme"]) throw new Error("dark attribute not applied on theme/change");

// css injected
const styleTag = headNodes.find((n) => n.dataset && n.dataset.plugin === "@deepseek-ai/dsh-board-ui");
if (!styleTag || !styleTag.textContent.includes(".bb-frame")) throw new Error("CSS not injected");
if (!styleTag.textContent.includes("body[data-ds-dark-theme]")) throw new Error("dark palette missing");

// inject face: cycleTheme light -> dark from system
if (typeof rootInject.cycleTheme !== "function") throw new Error("cycleTheme missing");
rootInject.cycleTheme();
if (setThemeCalls.length !== 1 || setThemeCalls[0] !== "light")
  throw new Error("cycleTheme did not call setTheme(light): " + JSON.stringify(setThemeCalls));

// --- pure column logic: five lifecycle columns, agent counts aggregated ---
// 待执行 (plans only) / 进行中 / 需要处理 / 验收中 / 已完成; pendingInteraction
// outranks running; finished-unreviewed agent tasks land in 验收中; paused
// cards stay in the running column with the ⏸ badge.
const fake = {
  ids: ["main1", "sub1", "sub2", "subW", "main2", "main3", "main4", "main5", "subD", "main6"],
  byId: {
    main1: { id: "main1", displayTitle: "M1", running: true, updatedAt: 10 },
    sub1: { id: "sub1", displayTitle: "S1", parentId: "main1", origin: "subagent", running: true, updatedAt: 20 },
    sub2: { id: "sub2", displayTitle: "S2", parentId: "main1", origin: "subagent", running: false, completed: true, updatedAt: 30 },
    subW: { id: "subW", displayTitle: "SW", parentId: "main1", origin: "subagent", running: false, updatedAt: 25 },
    main2: { id: "main2", displayTitle: "M2", pendingInteraction: "question", updatedAt: 40 },
    main3: { id: "main3", displayTitle: "M3", blank: true, updatedAt: 50 },
    main4: { id: "main4", displayTitle: "M4", completed: true, updatedAt: 55 },
    main5: { id: "main5", displayTitle: "M5", running: true, pendingInteraction: "approval", updatedAt: 60 },
    subD: { id: "subD", displayTitle: "SD", parentId: "main6", origin: "subagent", running: false, completed: true, updatedAt: 61 },
    main6: { id: "main6", displayTitle: "M6", completed: true, updatedAt: 62 }
  },
  jobsBySession: {}
};
const fake2 = {
  ids: [...fake.ids, "plan1"],
  byId: { ...fake.byId, plan1: { id: "plan1", displayTitle: "P1", running: true, updatedAt: 60 } },
  jobsBySession: {}
};
const cols = exports_.buildColumns(fake2.ids, fake2.byId, fake2.jobsBySession, ["plan1"]);
const allCards = [...cols.pending, ...cols.running, ...cols.action_required, ...cols.reviewing, ...cols.completed];
if (allCards.length !== 5) throw new Error("expected 5 main-task cards, got " + allCards.length);
if (allCards.some((c) => c.id === "plan1")) throw new Error("planning session leaked into a status column");
if (cols.pending.length !== 0) throw new Error("no session may derive into the pending column (plans only)");
const m1 = allCards.find((c) => c.id === "main1");
if (!m1 || m1.status !== "running") throw new Error("main1 must be running: " + JSON.stringify(m1));
if (m1.agentRunning !== 1 || m1.agentDone !== 1 || m1.agentWaiting !== 1 || m1.agentFailed !== 0 || m1.agentTotal !== 3)
  throw new Error("subagent counts wrong: " + JSON.stringify(m1));
const m5 = allCards.find((c) => c.id === "main5");
if (!m5 || m5.status !== "action_required") throw new Error("pending interaction must outrank running: " + JSON.stringify(m5));
const m4 = allCards.find((c) => c.id === "main4");
if (!m4 || m4.status !== "completed") throw new Error("agentless finished session must be completed (review gate): " + JSON.stringify(m4));
const m6 = allCards.find((c) => c.id === "main6");
if (!m6 || m6.status !== "reviewing") throw new Error("finished-unreviewed agent task must be reviewing: " + JSON.stringify(m6));
if (cols.action_required.length !== 2 || cols.running.length !== 1 || cols.reviewing.length !== 1 || cols.completed.length !== 1)
  throw new Error("column assignment wrong: " + JSON.stringify({ a: cols.action_required.length, r: cols.running.length, v: cols.reviewing.length, c: cols.completed.length }));

// --- card status vocabulary ---
if (exports_.cardStatusOf({ running: true }) !== "running") throw new Error("cardStatusOf running wrong");
if (exports_.cardStatusOf({ running: true, pendingInteraction: true }) !== "action_required") throw new Error("cardStatusOf pending precedence wrong");
if (exports_.cardStatusOf({ completed: true }) !== "reviewing") throw new Error("cardStatusOf reviewing wrong");
if (exports_.cardStatusOf({}) !== "completed") throw new Error("cardStatusOf completed wrong");
if (exports_.cardStatusOf({}, true) !== "paused") throw new Error("cardStatusOf paused wrong");
if (exports_.columnOf({ blank: true }) !== null) throw new Error("columnOf blank wrong");
if (exports_.taskStatusOf({ running: true, pendingInteraction: "plan-review" }) !== "action_required")
  throw new Error("plan-review pending must map to action_required");

// --- paused sessions keep their card in the running column with the ⏸ badge ---
const pausedCols = exports_.buildColumns(fake2.ids, fake2.byId, fake2.jobsBySession, ["plan1"], undefined, ["main6"]);
const m6r = pausedCols.running.find((c) => c.id === "main6");
if (!m6r || m6r.status !== "paused") throw new Error("paused session must stay in the running column with status paused");
if ([...pausedCols.reviewing, ...pausedCols.completed].some((c) => c.id === "main6"))
  throw new Error("paused session must not land in reviewing/completed");

// --- settled subagent catalog: authoritative activity + failures (✕) ---
const withCatalog = exports_.buildColumns(
  fake2.ids, fake2.byId, fake2.jobsBySession, ["plan1"],
  { main1: { state: "ready", entries: [
    { kind: "child", id: "sub1", activity: "running" },
    { kind: "child", id: "sub2", activity: "inactive" },
    { kind: "child", id: "subW", activity: "inactive" },
    { kind: "diagnostic", id: "sub3", reason: "corrupt" }
  ] } }
);
const m1c = [...withCatalog.running, ...withCatalog.action_required, ...withCatalog.reviewing, ...withCatalog.completed].find((c) => c.id === "main1");
if (!m1c || m1c.agentRunning !== 1 || m1c.agentDone !== 1 || m1c.agentWaiting !== 1 || m1c.agentFailed !== 1 || m1c.agentTotal !== 4)
  throw new Error("catalog-enriched agent counts wrong: " + JSON.stringify(m1c));
// a loading/error catalog must not disturb list-derived counts
const withPendingCatalog = exports_.buildColumns(
  fake2.ids, fake2.byId, fake2.jobsBySession, ["plan1"],
  { main1: { state: "loading", entries: [{ kind: "diagnostic", id: "sub3", reason: "corrupt" }] } }
);
const m1p = [...withPendingCatalog.running, ...withPendingCatalog.action_required, ...withPendingCatalog.reviewing, ...withPendingCatalog.completed].find((c) => c.id === "main1");
if (!m1p || m1p.agentRunning !== 1 || m1p.agentDone !== 1 || m1p.agentWaiting !== 1 || m1p.agentFailed !== 0 || m1p.agentTotal !== 3)
  throw new Error("unsettled catalog must not change counts: " + JSON.stringify(m1p));

// --- plan-start detection from the runtime conversation nodes ---
// Node shapes are the runtime's own: user nodes carry a top-level
// `content: ContentBlock[]`, assistant nodes a top-level `blocks` with
// `{kind:"tool-call",name}` entries — a planning session that already
// started must leave 待执行 even if it later finished.
const startedNodes = [
  { kind: "user", seq: 1, time: 1, content: [{ type: "text", text: "帮我规划一下看板重构" }] },
  { kind: "assistant", seq: 2, time: 2, turn: 1, step: 1, blocks: [{ kind: "text", text: "好的，计划如下…" }] },
  { kind: "user", seq: 3, time: 3, content: [{ type: "text", text: "开始执行吧" }] },
  { kind: "assistant", seq: 4, time: 4, turn: 1, step: 2, blocks: [{ kind: "tool-call", callId: "c1", name: "subagent", argsRaw: "{}" }] }
];
if (!exports_.planStartedInConversation(startedNodes)) throw new Error("planStartedInConversation must detect the start command");
const toolOnlyNodes = [
  { kind: "user", seq: 1, time: 1, content: [{ type: "text", text: "动手做吧" }] },
  { kind: "assistant", seq: 2, time: 2, turn: 1, step: 1, blocks: [{ kind: "tool-call", callId: "c1", name: "bash", argsRaw: "{}" }] }
];
if (!exports_.planStartedInConversation(toolOnlyNodes)) throw new Error("planStartedInConversation must detect a non-read-only tool call");
const planningOnlyNodes = [
  { kind: "user", seq: 1, time: 1, content: [{ type: "text", text: "这个任务怎么做？" }] },
  { kind: "assistant", seq: 2, time: 2, turn: 1, step: 1, blocks: [
    { kind: "tool-call", callId: "c1", name: "web_search", argsRaw: "{}" },
    { kind: "text", text: "建议分三步…" }
  ] }
];
if (exports_.planStartedInConversation(planningOnlyNodes)) throw new Error("read-only planning tools must NOT count as started");
if (exports_.planStartedInConversation([])) throw new Error("empty conversation must not count as started");

// --- workspace mapping: list items are RAW host views ---
const rawViews = exports_.workspaceViewsOf({
  items: [
    { workspaceId: "ws1", title: "A", sessionIds: ["s1", "s2"] },
    { workspaceId: "ws2", title: "B", sessionIds: ["s3"] }
  ]
});
if (rawViews.length !== 2) throw new Error("workspaceViewsOf should return raw views, got " + rawViews.length);
if (exports_.workspaceIdOfSession(rawViews, "s3") !== "ws2") throw new Error("workspaceIdOfSession wrong");
if (exports_.workspaceColorOf(rawViews, "ws2") !== exports_.workspaceColorOf(rawViews, "ws2")) throw new Error("color stability");

console.log("root children:", JSON.stringify(rootReg.children));
console.log("layout service:", Object.keys(provided));
console.log("locale ns:", JSON.stringify(localeRegs));
console.log("css bytes:", styleTag.textContent.length);
console.log("SMOKE TEST PASSED");
