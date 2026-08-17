window.__ModuleLoader__.load({id:"@deepseek-ai/dsh-board-ui",factory:(require)=>{
var __boardUiBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/client/index.tsx
  var index_exports = {};
  __export(index_exports, {
    BUILD_TAG: () => BUILD_TAG,
    apply: () => apply,
    buildColumns: () => buildColumns,
    cardStatusOf: () => cardStatusOf,
    columnOf: () => columnOf,
    inject: () => inject,
    planStartedInConversation: () => planStartedInConversation,
    taskStatusOf: () => taskStatusOf,
    workspaceColorOf: () => workspaceColorOf,
    workspaceIdOfSession: () => workspaceIdOfSession,
    workspaceViewsOf: () => workspaceViewsOf
  });
  var import_client = __require("@deepseek-ai/dsh-client-runtime/client");

  // src/client/theme/tokens.css
  var tokens_default = '/* board-ui design tokens \u2014 restrained palette (Linear/Vercel-style):\n   blue = task / interaction / progress, green = running ONLY, orange = waiting,\n   gray = neutral stats. Light defaults; dark layer on body[data-ds-dark-theme]. */\n[class^="bb-"],\n[class^="bb-"]::before,\n[class^="bb-"]::after {\n  box-sizing: border-box;\n}\n\n/* Reduced motion: honor the OS setting across every board-ui surface. */\n@media (prefers-reduced-motion: reduce) {\n  [class^="bb-"],\n  [class^="bb-"]::before,\n  [class^="bb-"]::after {\n    animation: none !important;\n    transition: none !important;\n  }\n}\n\n:root {\n  --bb-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",\n    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;\n  --bb-font-mono: "SF Mono", "JetBrains Mono", Menlo, Consolas, "PingFang SC",\n    "Microsoft YaHei", monospace;\n\n  --bb-canvas: #f8fafc;\n  --bb-panel: #ffffff;\n  --bb-panel-2: #f8fafc;\n  --bb-border: #e2e8f0;\n  --bb-border-strong: #cbd5e1;\n  --bb-text: #0f172a;\n  --bb-text-2: #64748b;\n  --bb-text-3: #94a3b8;\n  --bb-brand: #2563eb;\n  --bb-brand-strong: #1d4ed8;\n  --bb-brand-soft: #eff6ff;\n  --bb-col-running: #16a34a;\n  --bb-col-running-soft: #f0fdf4;\n  --bb-col-pending: #d97706;\n  --bb-col-pending-strong: #f59e0b;\n  --bb-col-pending-soft: #fff7ed;\n  --bb-col-done: #64748b;\n  --bb-col-done-soft: #f1f5f9;\n  --bb-success: #16a34a;\n  --bb-success-soft: #f0fdf4;\n  --bb-col-failed: #dc2626;\n  --bb-col-failed-soft: #fef2f2;\n  --bb-overlay: rgba(15, 23, 42, 0.32);\n\n  --bb-shadow-card: 0 1px 2px rgba(15, 23, 42, 0.05);\n  --bb-shadow-card-hover: 0 4px 12px rgba(15, 23, 42, 0.08);\n  --bb-shadow-pop: 0 12px 40px rgba(15, 23, 42, 0.16);\n\n  --bb-radius: 8px;\n  --bb-radius-lg: 12px;\n  --bb-ease: cubic-bezier(0.4, 0, 0.2, 1);\n  --bb-topbar-h: 48px;\n}\n\nbody[data-ds-dark-theme] {\n  --bb-canvas: #0b1220;\n  --bb-panel: #111827;\n  --bb-panel-2: #0f172a;\n  --bb-border: #1f2937;\n  --bb-border-strong: #334155;\n  --bb-text: #e5e7eb;\n  --bb-text-2: #94a3b8;\n  --bb-text-3: #64748b;\n  --bb-brand: #3b82f6;\n  --bb-brand-strong: #60a5fa;\n  --bb-brand-soft: #1d2e52;\n  --bb-col-running: #22c55e;\n  --bb-col-running-soft: #052e16;\n  --bb-col-pending: #fbbf24;\n  --bb-col-pending-strong: #f59e0b;\n  --bb-col-pending-soft: #3a2a05;\n  --bb-col-done: #94a3b8;\n  --bb-col-done-soft: #1f2937;\n  --bb-success: #4ade80;\n  --bb-success-soft: #052e16;\n  --bb-col-failed: #f87171;\n  --bb-col-failed-soft: #450a0a;\n  --bb-overlay: rgba(0, 0, 0, 0.5);\n\n  --bb-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.35);\n  --bb-shadow-card-hover: 0 8px 22px rgba(0, 0, 0, 0.45);\n  --bb-shadow-pop: 0 16px 48px rgba(0, 0, 0, 0.55);\n}\n';

  // src/client/frame/frame.css
  var frame_default = ".bb-frame {\n  position: fixed;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  background: var(--bb-canvas);\n  color: var(--bb-text);\n  font-family: var(--bb-font);\n  font-size: 14px;\n  line-height: 1.5;\n  overflow: hidden;\n}\n\n/* \u2500\u2500 top bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.bb-topbar {\n  height: var(--bb-topbar-h);\n  flex: none;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 0 16px;\n  background: var(--bb-panel);\n  border-bottom: 1px solid var(--bb-border);\n}\n.bb-brand {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 600;\n  font-size: 14px;\n  letter-spacing: 0.2px;\n}\n.bb-build-tag {\n  font-family: var(--bb-font-mono);\n  font-size: 10px;\n  color: var(--bb-text-3);\n  background: var(--bb-panel-2);\n  border: 1px solid var(--bb-border);\n  border-radius: 4px;\n  padding: 1px 5px;\n  font-weight: 400;\n}\n.bb-brand-dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 3px;\n  background: linear-gradient(135deg, var(--bb-brand), #7aa2ff);\n  box-shadow: 0 0 0 3px var(--bb-brand-soft);\n}\n.bb-search {\n  flex: 0 1 420px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  height: 32px;\n  padding: 0 10px;\n  margin: 0 auto;\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  background: var(--bb-panel-2);\n  color: var(--bb-text-3);\n  font-size: 13px;\n  cursor: pointer;\n  transition: border-color 0.15s var(--bb-ease), box-shadow 0.15s var(--bb-ease);\n}\n.bb-search:hover {\n  border-color: var(--bb-border-strong);\n  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.06);\n}\n.bb-search kbd {\n  margin-left: auto;\n  padding: 1px 6px;\n  border: 1px solid var(--bb-border);\n  border-bottom-width: 2px;\n  border-radius: 5px;\n  background: var(--bb-panel);\n  font-family: var(--bb-font-mono);\n  font-size: 11px;\n  color: var(--bb-text-3);\n}\n/* workspace switcher */\n.bb-switcher { position: relative; flex: none; margin-left: 14px; }\n.bb-switcher-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  height: 32px;\n  padding: 0 10px;\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  background: var(--bb-panel);\n  color: var(--bb-text);\n  font-family: inherit;\n  font-size: 13px;\n  font-weight: 550;\n  cursor: pointer;\n  transition: border-color 0.15s var(--bb-ease), box-shadow 0.15s var(--bb-ease);\n}\n.bb-switcher-btn:hover { border-color: var(--bb-border-strong); box-shadow: 0 1px 4px rgba(16, 24, 40, 0.06); }\n.bb-switcher-label { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.bb-switcher-caret { font-size: 10px; color: var(--bb-text-3); }\n.bb-switcher-menu {\n  position: absolute;\n  top: calc(100% + 6px);\n  left: 0;\n  z-index: 90;\n  min-width: 180px;\n  padding: 4px;\n  background: var(--bb-panel);\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  box-shadow: var(--bb-shadow-pop);\n  display: flex;\n  flex-direction: column;\n}\n.bb-switcher-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  text-align: left;\n  padding: 7px 10px;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--bb-text);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n}\n.bb-switcher-item:hover { background: var(--bb-brand-soft); color: var(--bb-brand-strong); }\n.bb-switcher-item.is-selected { background: var(--bb-brand-soft); color: var(--bb-brand-strong); font-weight: 600; }\n\n.bb-topbar-right { display: flex; align-items: center; gap: 8px; }\n.bb-theme-btn {\n  height: 32px;\n  padding: 0 10px;\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  background: var(--bb-panel);\n  color: var(--bb-text-2);\n  font-size: 12px;\n  cursor: pointer;\n  transition: all 0.15s var(--bb-ease);\n}\n.bb-theme-btn:hover { border-color: var(--bb-border-strong); color: var(--bb-text); }\n\n/* \u2500\u2500 main: nav | board (the drawer floats over the board) \u2500 */\n.bb-main {\n  flex: 1;\n  min-height: 0;\n  position: relative;\n  display: grid;\n  grid-template-columns: 280px minmax(0, 1fr);\n  transition: grid-template-columns 0.22s var(--bb-ease);\n}\n.bb-nav {\n  min-width: 0;\n  overflow: hidden;\n  background: var(--bb-panel-2);\n  border-right: 1px solid var(--bb-border);\n}\n.bb-board { min-width: 0; overflow: hidden; display: flex; flex-direction: column; }\n\n/* floating drawer: slides in over the board, never squeezes it */\n.bb-drawer {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  flex-direction: row;\n  background: var(--bb-panel);\n  border-left: 1px solid var(--bb-border);\n  box-shadow: -16px 0 40px rgba(16, 24, 40, 0.16);\n  z-index: 30;\n  overflow: hidden;\n  transform: translateX(105%);\n  pointer-events: none;\n  transition: transform 0.22s var(--bb-ease);\n}\n.bb-frame[data-drawer-open] .bb-drawer { transform: none; pointer-events: auto; }\n\n.bb-drawer-handle {\n  position: absolute;\n  left: -3px;\n  top: 0;\n  bottom: 0;\n  width: 6px;\n  z-index: 2;\n  cursor: col-resize;\n  background: transparent;\n  transition: background 0.12s var(--bb-ease);\n}\n.bb-drawer-handle:hover,\n.bb-drawer-handle[data-dragging] { background: var(--bb-brand); opacity: 0.55; }\n\n.bb-drawer-inner {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.bb-details {\n  flex: none;\n  width: 0;\n  overflow: hidden;\n  background: var(--bb-panel-2);\n  border-left: 1px solid var(--bb-border);\n}\n.bb-overlay-host { position: absolute; inset: 0; pointer-events: none; z-index: 60; }\n.bb-overlay-host > * { pointer-events: auto; }\n";

  // src/client/board/board.css
  var board_default = '.bb-board-root {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  padding: 16px 16px 16px;\n}\n.bb-board-head {\n  display: flex;\n  align-items: baseline;\n  gap: 10px;\n  padding: 2px 4px 14px;\n}\n.bb-board-title { font-size: 16px; font-weight: 650; letter-spacing: 0.2px; }\n.bb-board-sub { font-size: 12.5px; color: var(--bb-text-3); }\n\n.bb-cols {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  gap: 14px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  padding-bottom: 4px;\n}\n.bb-col {\n  flex: 0 0 280px;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  background: var(--bb-panel);\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius-lg);\n  box-shadow: var(--bb-shadow-card);\n  overflow: hidden;\n}\n.bb-col-head {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 14px 10px;\n  border-bottom: 1px solid var(--bb-border);\n}\n.bb-col-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }\n.bb-col-main {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.bb-col-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }\n.bb-col-title { font-size: 13px; font-weight: 600; }\n.bb-col-sub {\n  font-size: 11px;\n  color: var(--bb-text-3);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.bb-col-count {\n  flex: none;\n  min-width: 20px;\n  text-align: center;\n  padding: 1px 7px;\n  border-radius: 10px;\n  background: var(--bb-panel-2);\n  border: 1px solid var(--bb-border);\n  font-size: 11.5px;\n  color: var(--bb-text-2);\n}\n.bb-col-cards {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.bb-col-empty {\n  padding: 24px 10px;\n  text-align: center;\n  font-size: 12px;\n  color: var(--bb-text-3);\n}\n\n/* \u2500\u2500 session card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.bb-card {\n  flex: none;\n  width: 100%;\n  min-width: 0;\n  max-width: 100%;\n  text-align: left;\n  padding: 10px 12px;\n  background: var(--bb-panel);\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  box-shadow: var(--bb-shadow-card);\n  cursor: pointer;\n  color: var(--bb-text);\n  font-family: inherit;\n  transition: transform 0.12s var(--bb-ease), box-shadow 0.12s var(--bb-ease),\n    border-color 0.12s var(--bb-ease);\n}\n.bb-card:hover {\n  transform: translateY(-1px);\n  border-color: var(--bb-border-strong);\n  box-shadow: var(--bb-shadow-card-hover);\n}\n/* the card is a div (it hosts action buttons) \u2014 suppress text selection\n   while dragging; the inline rename input opts back in */\n.bb-card { user-select: none; }\n.bb-card-editing { user-select: text; }\n.bb-card:focus-visible {\n  outline: 2px solid var(--bb-brand);\n  outline-offset: 2px;\n}\n.bb-card.is-current {\n  border-color: var(--bb-brand);\n  background: var(--bb-brand-soft);\n  box-shadow: 0 0 0 3px var(--bb-brand-soft);\n}\n.bb-card.is-focused { box-shadow: 0 0 0 2px var(--bb-brand) inset, var(--bb-shadow-card-hover); }\n/* per-status left accent \u2014 one color per lifecycle state (blue \u5F85\u6267\u884C/\u9A8C\u6536\u4E2D,\n   green \u8FDB\u884C\u4E2D, orange \u9700\u8981\u5904\u7406, gray \u5DF2\u6682\u505C, none \u5DF2\u5B8C\u6210) */\n.bb-card[data-status="pending"] { border-left: 3px solid var(--bb-brand); }\n.bb-card[data-status="running"] { border-left: 3px solid var(--bb-col-running); }\n.bb-card[data-status="action_required"] { border-left: 3px solid var(--bb-col-pending); }\n.bb-card[data-status="reviewing"] { border-left: 3px solid var(--bb-brand); }\n.bb-card[data-status="paused"] { border-left: 3px solid var(--bb-text-3); }\n/* shared card anatomy: head (project + time) / title / status badge /\n   hint lines / agent stats / progress / actions */\n.bb-card-head {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 6px;\n  min-width: 0;\n}\n.bb-card-time {\n  margin-left: auto;\n  flex: none;\n  font-size: 11px;\n  color: var(--bb-text-3);\n  white-space: nowrap;\n}\n/* the task title is the visually strongest element on the card \u2014 up to two\n   lines, ellipsized beyond (wrap+clamp survives long unbroken paths) */\n.bb-card-title {\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.45;\n  word-break: break-word;\n  overflow-wrap: anywhere;\n  min-width: 0;\n  max-width: 100%;\n  /* clamp without -webkit-box (that combo breaks wrapping on long paths) */\n  max-height: 2.9em;\n  overflow: hidden;\n}\n\n/* status badge \u2014 light background + dark text, no saturated fills */\n.bb-card-status {\n  display: flex;\n  margin-top: 8px;\n  min-width: 0;\n}\n.bb-status-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 9px;\n  border-radius: 10px;\n  font-size: 11.5px;\n  font-weight: 600;\n  line-height: 18px;\n  white-space: nowrap;\n}\n.bb-status-glyph { font-size: 10px; line-height: 1; }\n.bb-status-badge[data-kind="pending"] { color: var(--bb-brand-strong); background: var(--bb-brand-soft); }\n.bb-status-badge[data-kind="running"] { color: var(--bb-col-running); background: var(--bb-col-running-soft); }\n.bb-status-badge[data-kind="paused"] { color: var(--bb-text-2); background: var(--bb-panel-2); }\n.bb-status-badge[data-kind="action_required"] { color: var(--bb-col-pending); background: var(--bb-col-pending-soft); }\n.bb-status-badge[data-kind="reviewing"] { color: var(--bb-brand-strong); background: var(--bb-brand-soft); }\n.bb-status-badge[data-kind="completed"] { color: var(--bb-success); background: var(--bb-success-soft); }\n\n/* status hint lines \u2014 the reason a card sits where it sits */\n.bb-card-hint {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 8px;\n  font-size: 11.5px;\n  line-height: 1.4;\n  min-width: 0;\n}\n.bb-card-hint[data-kind="action"] { color: var(--bb-col-pending); }\n.bb-card-hint[data-kind="reviewing"] { color: var(--bb-brand-strong); }\n.bb-card-hint[data-kind="done"] { color: var(--bb-text-3); }\n.bb-card-hint[data-kind="failed"] { color: var(--bb-col-failed); }\n.bb-card-hint-actions { margin-left: auto; display: inline-flex; gap: 4px; flex: none; }\n.bb-card-hint-btn {\n  padding: 1px 8px;\n  border: 1px solid var(--bb-border);\n  border-radius: 8px;\n  background: var(--bb-panel);\n  color: var(--bb-text-2);\n  font-family: inherit;\n  font-size: 11px;\n  line-height: 16px;\n  cursor: pointer;\n}\n.bb-card-hint-btn:hover { border-color: var(--bb-col-failed); color: var(--bb-col-failed); }\n\n/* sub-agent execution summary: \u25CF N \u8FD0\u884C\u4E2D / \u2713 N \u5DF2\u5B8C\u6210 / \u2715 N \u5931\u8D25 \u2014\n   counts only, never avatars; the per-agent chain lives in the details */\n.bb-card-agents {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 8px;\n  min-width: 0;\n}\n.bb-card-agents-label {\n  font-size: 11.5px;\n  color: var(--bb-text-3);\n  margin-right: 2px;\n  white-space: nowrap;\n}\n.bb-agent-stat {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  white-space: nowrap;\n  color: var(--bb-text-2);\n}\n.bb-agent-mark { font-size: 10px; line-height: 1; }\n.bb-agent-num { font-weight: 650; }\n.bb-agent-word { color: inherit; }\n/* only the MARK carries color: green when running, gray hollow at 0,\n   neutral \u2713 done, gray \u25CB waiting, red \u2715 failed */\n.bb-agent-stat[data-kind="running"] .bb-agent-mark { color: var(--bb-col-running); }\n.bb-agent-stat[data-kind="running-zero"] .bb-agent-mark { color: var(--bb-text-3); }\n.bb-agent-stat[data-kind="done"] .bb-agent-mark { color: var(--bb-col-done); }\n.bb-agent-stat[data-kind="waiting"] .bb-agent-mark { color: var(--bb-text-3); }\n.bb-agent-stat[data-kind="failed"] .bb-agent-mark { color: var(--bb-col-failed); }\n\n/* aggregate progress \u2014 a quiet text line plus a lightweight bar while running */\n.bb-card-progress {\n  flex-basis: 100%;\n  min-width: 0;\n  margin-top: 2px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.bb-card-progress-text { font-size: 11px; color: var(--bb-text-3); }\n.bb-card-progress-bar {\n  display: block;\n  height: 4px;\n  border-radius: 2px;\n  background: var(--bb-panel-2);\n  border: 1px solid var(--bb-border);\n  overflow: hidden;\n}\n.bb-card-progress-bar > span {\n  display: block;\n  height: 100%;\n  border-radius: 1px;\n  background: var(--bb-brand);\n  transition: width 0.2s var(--bb-ease);\n}\n\n/* card action footer \u2014 one primary action + \u22EF menu per status */\n.bb-card-foot {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 10px;\n  padding-top: 8px;\n  border-top: 1px solid var(--bb-border);\n}\n.bb-card-primary {\n  padding: 2px 10px;\n  border: 1px solid var(--bb-brand);\n  border-radius: 8px;\n  background: var(--bb-brand);\n  color: #fff;\n  font-family: inherit;\n  font-size: 11.5px;\n  font-weight: 600;\n  line-height: 18px;\n  cursor: pointer;\n  transition: background 0.12s var(--bb-ease);\n}\n.bb-card-primary:hover { background: var(--bb-brand-strong); }\n.bb-card-more {\n  margin-left: auto;\n  width: 24px;\n  height: 22px;\n  padding: 0;\n  border: 1px solid var(--bb-border);\n  border-radius: 6px;\n  background: var(--bb-panel);\n  color: var(--bb-text-2);\n  font-size: 13px;\n  line-height: 1;\n  cursor: pointer;\n}\n.bb-card-more:hover { border-color: var(--bb-border-strong); color: var(--bb-text); }\n.bb-card-meta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 8px;\n  font-size: 11.5px;\n  color: var(--bb-text-3);\n}\n.bb-tag {\n  padding: 0 6px;\n  border-radius: 4px;\n  border: 1px solid var(--bb-border);\n  background: var(--bb-panel-2);\n  font-size: 11px;\n  line-height: 18px;\n  color: var(--bb-text-2);\n}\n.bb-tag-run { color: var(--bb-col-running); border-color: transparent; background: var(--bb-col-running-soft); }\n.bb-card-time { margin-left: auto; white-space: nowrap; }\n.bb-card.is-current .bb-card-title { color: var(--bb-brand-strong); }\n\n/* card entrance (staggered by --i) */\n@keyframes bb-card-in {\n  from { opacity: 0; transform: translateY(5px); }\n  to { opacity: 1; transform: none; }\n}\n.bb-card {\n  animation: bb-card-in 0.22s var(--bb-ease) backwards;\n  animation-delay: calc(var(--i, 0) * 22ms);\n}\n\n/* running pulse (agent stat marks) */\n@keyframes bb-pulse {\n  0%, 100% { box-shadow: 0 0 0 0 rgba(29, 165, 101, 0.35); }\n  50% { box-shadow: 0 0 0 4px rgba(29, 165, 101, 0); }\n}\n.bb-agent-stat[data-kind="running"] .bb-agent-mark { animation: bb-pulse 1.6s var(--bb-ease) infinite; }\n\n/* board empty state */\n.bb-board-empty {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  color: var(--bb-text-3);\n}\n.bb-board-empty-art {\n  width: 56px;\n  height: 56px;\n  border-radius: 16px;\n  background: var(--bb-brand-soft);\n  border: 1px dashed var(--bb-brand);\n  display: grid;\n  place-items: center;\n  font-size: 22px;\n}\n.bb-board-empty-title { font-size: 14px; font-weight: 600; color: var(--bb-text-2); }\n.bb-board-empty-sub { font-size: 12.5px; }\n\n/* thin scrollbars */\n.bb-col-cards::-webkit-scrollbar, .bb-cols::-webkit-scrollbar { width: 6px; height: 6px; }\n.bb-col-cards::-webkit-scrollbar-thumb, .bb-cols::-webkit-scrollbar-thumb {\n  background: var(--bb-border-strong);\n  border-radius: 3px;\n}\n';

  // src/client/board/board-phase2.css
  var board_phase2_default = "/* board seat \u2014 Phase 2 additions: filter select, context menu, inline\n   rename, drag-over highlight. Appended to the Phase 1 board stylesheet. */\n\n.bb-filter {\n  margin-left: auto;\n  height: 28px;\n  max-width: 180px;\n  padding: 0 8px;\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  background: var(--bb-panel);\n  color: var(--bb-text-2);\n  font-size: 12.5px;\n  font-family: inherit;\n  cursor: pointer;\n}\n.bb-filter:hover { border-color: var(--bb-border-strong); }\n\n/* context menu */\n.bb-menu {\n  position: fixed;\n  z-index: 120;\n  min-width: 148px;\n  padding: 4px;\n  background: var(--bb-panel);\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  box-shadow: var(--bb-shadow-pop);\n  display: flex;\n  flex-direction: column;\n}\n.bb-menu-item {\n  display: block;\n  width: 100%;\n  text-align: left;\n  padding: 7px 10px;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--bb-text);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n}\n.bb-menu-item:hover { background: var(--bb-brand-soft); color: var(--bb-brand-strong); }\n.bb-menu-item.is-danger { color: #d64545; }\n.bb-menu-item.is-danger:hover { background: rgba(214, 69, 69, 0.1); color: #d64545; }\n.bb-tag-done { color: var(--bb-col-done); border-color: transparent; background: var(--bb-col-done-soft); }\n\n/* inline rename */\n.bb-card-editing { padding: 6px 8px; cursor: default; }\n.bb-rename-input {\n  width: 100%;\n  padding: 5px 7px;\n  border: 1px solid var(--bb-brand);\n  border-radius: 6px;\n  outline: none;\n  background: var(--bb-panel);\n  color: var(--bb-text);\n  font-family: inherit;\n  font-size: 13px;\n  box-shadow: 0 0 0 3px var(--bb-brand-soft);\n}\n\n/* drag & drop */\n.bb-card:active { cursor: grabbing; }\n.bb-col.is-dragover {\n  border-color: var(--bb-brand);\n  background: var(--bb-brand-soft);\n  box-shadow: 0 0 0 3px var(--bb-brand-soft);\n}\n";

  // src/client/board/pool.css
  var pool_default = '/* \u5F85\u6267\u884C column (plans) + plan creation button + per-card project badge.\n   Plans never execute until the user starts them \u2014 the column is a real\n   lifecycle state, not a "pool": blue accent, first-class column styling. */\n.bb-col-pending .bb-col-head {\n  background: linear-gradient(180deg, var(--bb-brand-soft), transparent);\n  border-bottom: 1px solid var(--bb-border);\n}\n.bb-col-pending .bb-col-title { color: var(--bb-brand-strong); }\n.bb-col-pending .bb-col-count {\n  background: var(--bb-brand-soft);\n  border-color: var(--bb-brand);\n  color: var(--bb-brand-strong);\n}\n.bb-pool-add {\n  flex: none;\n  width: 24px;\n  height: 24px;\n  border: 1px solid var(--bb-border-strong);\n  border-radius: 50%;\n  background: var(--bb-panel);\n  color: var(--bb-text-2);\n  font-size: 15px;\n  line-height: 1;\n  cursor: pointer;\n  transition: all 0.12s var(--bb-ease);\n}\n.bb-pool-add:hover {\n  border-color: var(--bb-brand);\n  background: var(--bb-brand);\n  color: #fff;\n  transform: rotate(90deg);\n}\n\n/* per-card project badge (\u5F85\u6267\u884C cards + status-column cards) */\n.bb-ws-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  flex: none;\n  min-width: 0;\n  max-width: 45%;\n  font-size: 11.5px;\n  color: var(--bb-text-2);\n  overflow: hidden;\n  white-space: nowrap;\n}\n.bb-ws-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; }\n';

  // src/client/palette/palette.css
  var palette_default = ".bb-palette-backdrop {\n  position: fixed;\n  inset: 0;\n  background: var(--bb-overlay);\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  padding-top: 12vh;\n  z-index: 100;\n}\n.bb-palette {\n  width: min(560px, calc(100vw - 48px));\n  background: var(--bb-panel);\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius-lg);\n  box-shadow: var(--bb-shadow-pop);\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n.bb-palette-input {\n  height: 48px;\n  padding: 0 16px;\n  border: none;\n  border-bottom: 1px solid var(--bb-border);\n  outline: none;\n  background: transparent;\n  color: var(--bb-text);\n  font-size: 14px;\n  font-family: inherit;\n}\n.bb-palette-input::placeholder { color: var(--bb-text-3); }\n.bb-palette-list { max-height: 320px; overflow-y: auto; padding: 6px; }\n.bb-palette-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 9px 10px;\n  border: none;\n  border-radius: 7px;\n  background: transparent;\n  color: var(--bb-text);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n  text-align: left;\n}\n.bb-palette-item.is-selected { background: var(--bb-brand-soft); color: var(--bb-brand-strong); }\n.bb-palette-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.bb-palette-sub { font-size: 11.5px; color: var(--bb-text-3); flex: none; }\n.bb-palette-empty { padding: 26px 12px; text-align: center; font-size: 12.5px; color: var(--bb-text-3); }\n";

  // src/client/activity/activity.css
  var activity_default = '/* Drawer tabs + activity panel. */\n.bb-drawer-tabs {\n  flex: none;\n  display: flex;\n  gap: 2px;\n  padding: 6px 8px 0;\n  border-bottom: 1px solid var(--bb-border);\n  background: var(--bb-panel-2);\n}\n.bb-drawer-tab {\n  position: relative;\n  padding: 7px 12px;\n  border: none;\n  background: transparent;\n  color: var(--bb-text-2);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n  border-radius: 6px 6px 0 0;\n}\n.bb-drawer-tab:hover { color: var(--bb-text); background: var(--bb-panel); }\n.bb-drawer-tab.is-active {\n  color: var(--bb-brand-strong);\n  font-weight: 600;\n}\n.bb-drawer-tab.is-active::after {\n  content: "";\n  position: absolute;\n  left: 12px;\n  right: 12px;\n  bottom: 0;\n  height: 2px;\n  border-radius: 1px;\n  background: var(--bb-brand);\n}\n.bb-drawer-tab-badge {\n  margin-left: 6px;\n  padding: 0 6px;\n  border-radius: 8px;\n  background: var(--bb-col-pending-soft);\n  color: var(--bb-col-pending);\n  font-size: 11px;\n  font-weight: 600;\n}\n.bb-drawer-pane { flex: 1; min-height: 0; display: flex; flex-direction: column; }\n.bb-drawer-close {\n  margin-left: auto;\n  padding: 5px 9px;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--bb-text-3);\n  font-size: 13px;\n  cursor: pointer;\n  align-self: center;\n}\n.bb-drawer-close:hover { background: var(--bb-panel); color: var(--bb-text); }\n.bb-drawer-pane[data-hidden] { display: none; }\n\n/* activity panel */\n.bb-act {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 14px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n.bb-act-banner {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 12px;\n  border: 1px solid var(--bb-col-pending);\n  border-radius: var(--bb-radius);\n  background: var(--bb-col-pending-soft);\n  color: var(--bb-col-pending);\n  font-size: 13px;\n}\n.bb-act-banner-text { flex: 1; min-width: 0; }\n.bb-act-banner-btn {\n  flex: none;\n  padding: 4px 10px;\n  border: 1px solid var(--bb-col-pending);\n  border-radius: 6px;\n  background: transparent;\n  color: inherit;\n  font-family: inherit;\n  font-size: 12px;\n  cursor: pointer;\n}\n.bb-act-banner-btn:hover { background: rgba(224, 136, 0, 0.12); }\n.bb-act-section-title {\n  font-size: 12px;\n  font-weight: 600;\n  letter-spacing: 0.3px;\n  color: var(--bb-text-3);\n  margin-bottom: 6px;\n}\n.bb-act-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  border: 1px solid var(--bb-border);\n  border-radius: var(--bb-radius);\n  background: var(--bb-panel);\n  box-shadow: var(--bb-shadow-card);\n  font-size: 13px;\n}\n.bb-act-row + .bb-act-row { margin-top: 6px; }\n.bb-act-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }\n.bb-act-dot.run { background: var(--bb-col-running); animation: bb-pulse 1.6s var(--bb-ease) infinite; }\n.bb-act-dot.done { background: var(--bb-col-done); }\n.bb-act-dot.fail { background: var(--bb-col-failed); }\n.bb-act-kind { flex: none; font-family: var(--bb-font-mono); font-size: 11px; color: var(--bb-text-3); }\n.bb-act-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.bb-act-detail { flex: none; font-size: 11.5px; color: var(--bb-text-3); }\n.bb-act-empty { padding: 26px 10px; text-align: center; color: var(--bb-text-3); font-size: 12.5px; }\n';

  // src/client/frame/BoardFrame.tsx
  var import_react = __require("react");

  // src/client/board/columns.ts
  var COLUMNS = [
    { key: "pending", dot: "var(--bb-brand)" },
    { key: "running", dot: "var(--bb-col-running)" },
    { key: "action_required", dot: "var(--bb-col-pending)" },
    { key: "reviewing", dot: "var(--bb-brand)" },
    { key: "completed", dot: "var(--bb-col-done)" }
  ];
  function taskStatusOf(session, paused = false) {
    if (session.blank) return null;
    if (session.pendingInteraction) return "action_required";
    if (session.running) return "running";
    if (paused) return "paused";
    if (session.completed === true) return "reviewing";
    return "completed";
  }
  function columnOf(session, paused = false) {
    const status = taskStatusOf(session, paused);
    return status === null ? null : status === "paused" ? "running" : status;
  }
  function cardStatusOf(session, paused = false) {
    return taskStatusOf(session, paused) ?? "completed";
  }
  function childrenMapOf(ids, byId) {
    const childrenOf = /* @__PURE__ */ new Map();
    for (const id of ids) {
      const parentId = byId[id]?.parentId;
      if (parentId === void 0) continue;
      const list = childrenOf.get(parentId) ?? [];
      list.push(id);
      childrenOf.set(parentId, list);
    }
    return childrenOf;
  }
  function agentStatsOf(parentId, byId, childrenOf, subagentsByParent) {
    const childIds = childrenOf.get(parentId) ?? [];
    const catalog = subagentsByParent?.[parentId];
    const ready = catalog != null && catalog.state === "ready" && Array.isArray(catalog.entries);
    const failedIds = /* @__PURE__ */ new Set();
    const activityOf = /* @__PURE__ */ new Map();
    if (ready) {
      for (const entry of catalog.entries) {
        if (entry.kind === "diagnostic") failedIds.add(entry.id);
        else activityOf.set(entry.id, entry.activity === "running");
      }
    }
    const parentLive = byId[parentId]?.running === true;
    let running = 0;
    let done = 0;
    let waiting = 0;
    let failed = 0;
    for (const kid of childIds) {
      const child = byId[kid];
      if (child === void 0 || child.blank) continue;
      if (failedIds.has(kid)) {
        failed += 1;
        continue;
      }
      const live = activityOf.get(kid);
      if (live !== void 0 ? live : child.running) {
        running += 1;
        continue;
      }
      if (parentLive && child.completed !== true) waiting += 1;
      else done += 1;
    }
    if (ready) {
      for (const entry of catalog.entries) {
        if (childIds.includes(entry.id)) continue;
        if (entry.kind === "diagnostic") failed += 1;
        else if (entry.activity === "running") running += 1;
        else done += 1;
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
  function buildColumns(ids, byId, jobsBySession, planningIds, subagentsByParent, pausedIds) {
    const planning = new Set(planningIds ?? []);
    const paused = new Set(pausedIds ?? []);
    const buckets = { pending: [], running: [], action_required: [], reviewing: [], completed: [] };
    const childrenOf = childrenMapOf(ids, byId);
    for (const id of ids) {
      const session = byId[id];
      if (session === void 0) continue;
      if (session.parentId !== void 0) continue;
      if (planning.has(id)) continue;
      const stats = agentStatsOf(id, byId, childrenOf, subagentsByParent);
      let status = taskStatusOf(session, paused.has(id));
      if (status === null) continue;
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
  function workspaceViewsOf(list) {
    const views = [];
    for (const item of list?.items ?? []) {
      if (item !== null && typeof item === "object" && item.workspaceId !== void 0) {
        views.push(item);
      }
    }
    return views;
  }
  var WORKSPACE_COLORS = [
    "#4176e6",
    "#1da565",
    "#e08800",
    "#d64545",
    "#8b5cf6",
    "#0e9aa7",
    "#e35db0",
    "#6b7280"
  ];
  function workspaceColorOf(views, workspaceId) {
    const idx = views.findIndex((v) => v.workspaceId === workspaceId);
    if (idx === -1) return "var(--bb-text-3)";
    return WORKSPACE_COLORS[idx % WORKSPACE_COLORS.length];
  }
  function workspaceIdOfSession(views, sessionId) {
    for (const view of views) {
      if (Array.isArray(view.sessionIds) && view.sessionIds.includes(sessionId))
        return view.workspaceId;
    }
    return "";
  }
  function filterSessionsByWorkspace(ids, byId, views, filter) {
    if (filter == null) return ids;
    const allowed = new Set(views.find((v) => v.workspaceId === filter)?.sessionIds ?? []);
    return ids.filter((id) => allowed.has(id));
  }
  function relativeTime(updatedAt, t) {
    if (!updatedAt) return "";
    const diff = Date.now() - updatedAt;
    const min = Math.floor(diff / 6e4);
    if (min < 1) return t("card.now");
    if (min < 60) return min + " " + t("card.min");
    const hour = Math.floor(min / 60);
    if (hour < 24) return hour + " " + t("card.hour");
    const day = Math.floor(hour / 24);
    if (day < 30) return day + " " + t("card.day");
    const d = new Date(updatedAt);
    return d.getMonth() + 1 + "/" + d.getDate();
  }
  var START_RE = /^(开始执行|开始任务|执行计划|执行吧|开始吧|请开始|start|execute)/i;
  var READ_ONLY_TOOLS = /* @__PURE__ */ new Set(["read", "read_image", "grep", "glob", "web_search", "skill", "list_agents", "get_goal", "job_list", "job_output"]);
  function planStartedInConversation(nodes, readOnlyTools = READ_ONLY_TOOLS) {
    if (!Array.isArray(nodes)) return false;
    const userNodes = nodes.filter((n) => n.kind === "user");
    const last = userNodes[userNodes.length - 1];
    const text = Array.isArray(last?.content) ? last.content.filter((c) => c?.type === "text" && typeof c.text === "string").map((c) => c.text).join(" ").trim() : "";
    if (START_RE.test(text)) return true;
    for (const node of nodes) {
      if (node.kind !== "assistant" || !Array.isArray(node.blocks)) continue;
      if (node.blocks.some((b) => b?.kind === "tool-call" && typeof b.name === "string" && b.name !== "" && !readOnlyTools.has(b.name))) return true;
    }
    return false;
  }

  // src/client/frame/BoardFrame.tsx
  var import_jsx_runtime = __require("react/jsx-runtime");
  var NAV_DEFAULT = 280;
  var DRAWER_MIN = 420;
  var DRAWER_MAX = 1100;
  function WorkspaceSwitcher({ filter, onFilterChange, views, t }) {
    const [open, setOpen] = (0, import_react.useState)(false);
    (0, import_react.useEffect)(() => {
      const onDown = () => setOpen(false);
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, []);
    const current = filter === null ? null : views.find((v) => v.workspaceId === filter);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-switcher", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: "bb-switcher-btn",
          onClick: () => setOpen((o) => !o),
          "aria-haspopup": "menu",
          "aria-expanded": open,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              {
                className: "bb-ws-dot",
                style: { background: current ? workspaceColorOf(views, current.workspaceId) : "var(--bb-text-3)" }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-switcher-label", children: current ? current.title : t("filter.all") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-switcher-caret", "aria-hidden": true, children: "\u25BE" })
          ]
        }
      ),
      open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-switcher-menu", role: "menu", onMouseDown: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            role: "menuitem",
            className: "bb-switcher-item" + (filter === null ? " is-selected" : ""),
            onClick: () => {
              onFilterChange(null);
              setOpen(false);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-ws-dot", style: { background: "var(--bb-text-3)" } }),
              t("filter.all")
            ]
          }
        ),
        views.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            role: "menuitem",
            className: "bb-switcher-item" + (filter === v.workspaceId ? " is-selected" : ""),
            onClick: () => {
              onFilterChange(v.workspaceId);
              setOpen(false);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-ws-dot", style: { background: workspaceColorOf(views, v.workspaceId) } }),
              v.title
            ]
          },
          v.workspaceId
        ))
      ] })
    ] });
  }
  function DrawerHandle({ width, onResize }) {
    const [dragging, setDragging] = (0, import_react.useState)(false);
    const base = (0, import_react.useRef)(0);
    const startX = (0, import_react.useRef)(0);
    const onPointerDown = (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      base.current = width;
      startX.current = e.clientX;
      setDragging(true);
    };
    const onPointerMove = (e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      onResize(Math.min(Math.max(base.current + (startX.current - e.clientX), DRAWER_MIN), DRAWER_MAX));
    };
    const onPointerUp = (e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "bb-drawer-handle",
        "data-dragging": dragging || void 0,
        onPointerDown,
        onPointerMove,
        onPointerUp
      }
    );
  }
  function BoardFrame({ useStore, useSessions, useWorkspaces, actions, renderSlot, t, cycleTheme, injectBuildTag }) {
    const panels = useStore((s) => s);
    const current = useSessions((s) => s.current);
    const currentBlank = useSessions((s) => {
      const c = s.current;
      return c !== void 0 ? s.byId[c]?.blank !== false : false;
    });
    const [narrow, setNarrow] = (0, import_react.useState)(() => window.innerWidth < 1100);
    (0, import_react.useEffect)(() => {
      const onResize = () => setNarrow(window.innerWidth < 1100);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
    const navCollapsed = panels.sidebar === 0;
    const navW = narrow ? 56 : navCollapsed ? 0 : panels.sidebar || NAV_DEFAULT;
    const wsList = useWorkspaces((s) => s);
    const views = (0, import_react.useMemo)(() => workspaceViewsOf(wsList), [wsList]);
    const drawerOpen = current !== void 0 && panels.drawerOpen;
    const drawerW = panels.drawerWidth || 640;
    const detailsW = panels.details > 0 ? panels.details : 0;
    const drawerContentW = current !== void 0 ? drawerW + detailsW : 0;
    const initialCurrent = (0, import_react.useRef)(current);
    (0, import_react.useEffect)(() => {
      if (current !== initialCurrent.current) {
        initialCurrent.current = current;
        actions.setDrawerOpen(true);
      }
    }, [current, actions]);
    const drawerTab = panels.drawerTab ?? "chat";
    const liveJobs = useSessions((s) => {
      const c = s.current;
      if (c === void 0) return 0;
      return (s.jobsBySession?.[c] ?? []).filter((j) => j.status === "running" || j.status === "stopping").length;
    });
    const hasPending = useSessions((s) => {
      const c = s.current;
      return c !== void 0 ? s.byId[c]?.pendingInteraction !== void 0 : false;
    });
    const actBadge = liveJobs + (hasPending ? 1 : 0);
    const themeLabel = panels.themePref === "light" ? t("theme.light") : panels.themePref === "dark" ? t("theme.dark") : t("theme.system");
    const buildTag = injectBuildTag ?? "dev";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-frame", "data-drawer-open": drawerOpen || void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "bb-topbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-brand", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-brand-dot" }),
          "board_ui",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-build-tag", children: buildTag })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          WorkspaceSwitcher,
          {
            filter: panels.workspaceFilter,
            onFilterChange: (id) => actions.setWorkspaceFilter(id),
            views,
            t
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "bb-search",
            onClick: () => window.dispatchEvent(new CustomEvent("bb:palette-open")),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true, children: "\u2315" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("search.placeholder") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "Ctrl K" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-topbar-right", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "bb-theme-btn", onClick: cycleTheme, title: t("theme.cycle"), children: themeLabel }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "bb-main",
          style: { gridTemplateColumns: navW + "px minmax(0, 1fr)" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "bb-nav", children: renderSlot("sidebar", { collapsed: narrow || navCollapsed, width: navW || NAV_DEFAULT }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "bb-board", children: renderSlot("board", {
              filter: panels.workspaceFilter,
              onFilterChange: (id) => actions.setWorkspaceFilter(id)
            }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "bb-drawer", style: { width: drawerContentW }, children: [
              drawerContentW > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerHandle, { width: drawerW, onResize: (px) => actions.setDrawerWidth(px) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-drawer-inner", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-drawer-tabs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "bb-drawer-tab" + (drawerTab === "chat" ? " is-active" : ""),
                      onClick: () => actions.setDrawerTab("chat"),
                      children: t("drawer.chat")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: "bb-drawer-tab" + (drawerTab === "activity" ? " is-active" : ""),
                      onClick: () => actions.setDrawerTab("activity"),
                      children: [
                        t("drawer.activity"),
                        actBadge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-drawer-tab-badge", children: actBadge })
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "bb-drawer-close",
                      title: t("drawer.close"),
                      "aria-label": t("drawer.close"),
                      onClick: () => actions.setDrawerOpen(false),
                      children: "\u2715"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-drawer-pane", "data-hidden": drawerTab !== "chat" || void 0, children: renderSlot("conversation", {}) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-drawer-pane", "data-hidden": drawerTab !== "activity" || void 0, children: renderSlot("activity", {}) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", { className: "bb-details", style: { width: detailsW }, children: renderSlot("details", {}) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-overlay-host", children: renderSlot("shell.overlay", {}) })
          ]
        }
      )
    ] });
  }

  // src/client/board/Board.tsx
  var import_react2 = __require("react");
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  var MENU_NONE = { kind: null, id: null, x: 0, y: 0 };
  var TASK_DRAG = "text/board-task";
  var EMPTY_IDS = [];
  var STATUS_COLUMNS = COLUMNS.filter((c) => c.key !== "pending");
  var STATUS_LABEL_KEY = {
    pending: "card.statusPending",
    running: "card.statusRunning",
    paused: "card.statusPaused",
    action_required: "card.statusActionRequired",
    reviewing: "card.statusReviewing",
    completed: "card.statusDone"
  };
  var STATUS_GLYPH = { running: "\u25CF", paused: "\u23F8", action_required: "\u26A0", reviewing: "\u25D0", completed: "\u2713" };
  function StatusBadge({ status, t }) {
    const glyph = STATUS_GLYPH[status];
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-status-badge", "data-kind": status, children: [
      glyph !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-status-glyph", "aria-hidden": true, children: glyph }),
      t(STATUS_LABEL_KEY[status] ?? "card.statusPending")
    ] });
  }
  function AgentStatsRow({ running, done, waiting, failed, total, showBar, t }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-card-agents", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-card-agents-label", children: t("card.subagents") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-agent-stat", "data-kind": running > 0 ? "running" : "running-zero", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-mark", "aria-hidden": true, children: running > 0 ? "\u25CF" : "\u25CB" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-num", children: running }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-word", children: t("card.agentsRunning") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-agent-stat", "data-kind": "done", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-mark", "aria-hidden": true, children: "\u2713" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-num", children: done }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-word", children: t("card.agentsDone") })
      ] }),
      waiting > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-agent-stat", "data-kind": "waiting", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-mark", "aria-hidden": true, children: "\u25CB" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-num", children: waiting }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-word", children: t("card.agentsWaiting") })
      ] }),
      failed > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-agent-stat", "data-kind": "failed", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-mark", "aria-hidden": true, children: "\u2715" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-num", children: failed }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-agent-word", children: t("card.agentsFailed") })
      ] }),
      total > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-card-progress", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-card-progress-text", children: t("card.progress", { done, total }) }),
        showBar && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "span",
          {
            className: "bb-card-progress-bar",
            role: "progressbar",
            "aria-valuemin": 0,
            "aria-valuemax": total,
            "aria-valuenow": done,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { width: Math.round(done / total * 100) + "%" } })
          }
        )
      ] })
    ] });
  }
  function HintLine({ status, session, failed, t, onRetry, onViewError }) {
    const lines = [];
    if (status === "action_required") {
      const reason = session.pendingInteraction === "approval" ? t("card.reasonApproval") : session.pendingInteraction === "plan-review" ? t("card.reasonPlanReview") : t("card.reasonQuestion");
      lines.push(
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card-hint", "data-kind": "action", children: reason }, "reason")
      );
    } else if (status === "reviewing") {
      lines.push(
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card-hint", "data-kind": "reviewing", children: t("card.reviewingHint") }, "reviewing")
      );
    }
    if (failed > 0) {
      lines.push(
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-card-hint", "data-kind": "failed", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": true, children: "\u26A0" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("card.failedHint", { n: failed }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-card-hint-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "bb-card-hint-btn",
                onClick: (e) => {
                  e.stopPropagation();
                  onRetry();
                },
                children: t("task.retry")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "bb-card-hint-btn",
                onClick: (e) => {
                  e.stopPropagation();
                  onViewError();
                },
                children: t("task.viewError")
              }
            )
          ] })
        ] }, "failed")
      );
    }
    if (status === "completed" && failed === 0 && session.updatedAt) {
      lines.push(
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card-hint", "data-kind": "done", children: t("card.acceptedMeta", { time: relativeTime(session.updatedAt, t) }) }, "accepted")
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: lines });
  }
  function TaskCard({ item, wsColor, wsTitle, animIndex, current, focused, editing, draft, primaryLabel, t, onOpen, onPrimary, onMenu, onStartRename, onDraft, onCommitRename, onDragStart, onRetry, onViewError }) {
    const { session, status, agentRunning, agentDone, agentWaiting, agentFailed, agentTotal } = item;
    if (editing) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card bb-card-editing", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          autoFocus: true,
          className: "bb-rename-input",
          value: draft,
          onChange: (e) => onDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCommitRename();
            }
            if (e.key === "Escape") onCommitRename(true);
          },
          onBlur: () => onCommitRename(true)
        }
      ) });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: "bb-card" + (current ? " is-current" : "") + (focused ? " is-focused" : ""),
        style: { "--i": animIndex },
        "data-status": status,
        "data-session": session.id,
        tabIndex: 0,
        draggable: true,
        onDragStart: (e) => {
          onDragStart(e, session.id);
        },
        onClick: onOpen,
        onDoubleClick: () => onStartRename(),
        onKeyDown: (e) => {
          if (e.key === "Enter" && e.target === e.currentTarget) {
            e.preventDefault();
            onOpen();
          }
        },
        onContextMenu: (e) => {
          e.preventDefault();
          onMenu(e);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-card-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bb-ws-badge", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-ws-dot", style: { background: wsColor } }),
              wsTitle
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-card-time", children: relativeTime(session.updatedAt, t) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card-title", children: session.displayTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-card-status", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StatusBadge, { status, t }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            HintLine,
            {
              status,
              session,
              failed: agentFailed,
              t,
              onRetry,
              onViewError
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            AgentStatsRow,
            {
              running: agentRunning,
              done: agentDone,
              waiting: agentWaiting,
              failed: agentFailed,
              total: agentTotal,
              showBar: status === "running",
              t
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-card-foot", draggable: false, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "bb-card-primary", onClick: (e) => {
              e.stopPropagation();
              onPrimary();
            }, children: primaryLabel }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "bb-card-more",
                title: t("menu.more"),
                "aria-label": t("menu.more"),
                onClick: (e) => {
                  e.stopPropagation();
                  onMenu(e);
                },
                children: "\u22EF"
              }
            )
          ] })
        ]
      }
    );
  }
  function Board({ useStore, useSessions, useWorkspaces, actions, t, filter, onFilterChange, openSession, openActivity, collapseDrawer, renameSession, forkSession, archiveSession, reorderSession, startTaskPlanning, executePlan, pauseSession, resumeSession, reVerifySession, reRunSession, retrySession, shouldLeavePool }) {
    const focus = useStore((s) => s.focus);
    const planningIds = useStore((s) => s.planningIds) ?? EMPTY_IDS;
    const pausedIds = useStore((s) => s.pausedIds) ?? EMPTY_IDS;
    const snap = useSessions((s) => s);
    const wsList = useWorkspaces((s) => s);
    const views = (0, import_react2.useMemo)(() => workspaceViewsOf(wsList), [wsList]);
    const ids = (0, import_react2.useMemo)(
      () => filterSessionsByWorkspace(snap.ids, snap.byId, views, filter),
      [snap.ids, snap.byId, views, filter]
    );
    const buckets = (0, import_react2.useMemo)(
      () => buildColumns(ids, snap.byId, snap.jobsBySession, planningIds, snap.subagentsByParent, pausedIds),
      [ids, snap.byId, snap.jobsBySession, planningIds, snap.subagentsByParent, pausedIds]
    );
    const plans = (0, import_react2.useMemo)(() => {
      return planningIds.map((id) => snap.byId[id]).filter((s) => s !== void 0 && !s.blank).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }, [planningIds, snap.byId]);
    const shownPlans = (0, import_react2.useMemo)(() => {
      if (filter === null) return plans;
      return plans.filter((s) => workspaceIdOfSession(views, s.id) === filter);
    }, [plans, views, filter]);
    const wsTitleOf = (wsId) => {
      if (wsId === "") return t("pool.ungrouped");
      return views.find((v) => v.workspaceId === wsId)?.title ?? t("pool.ungrouped");
    };
    const planStats = (0, import_react2.useMemo)(() => {
      const childrenOf = childrenMapOf(snap.ids, snap.byId);
      const map = /* @__PURE__ */ new Map();
      for (const id of planningIds) {
        map.set(id, agentStatsOf(id, snap.byId, childrenOf, snap.subagentsByParent));
      }
      return map;
    }, [snap.ids, snap.byId, planningIds, snap.subagentsByParent]);
    const colSubText = (key, items) => {
      if (key === "pending") return t("col.pending.sub");
      if (key === "running") return t("col.running.sub", { n: items.reduce((sum, it) => sum + it.agentRunning, 0) });
      if (key === "action_required") return t("col.action_required.sub");
      if (key === "reviewing") return t("col.reviewing.sub");
      return t("col.completed.sub");
    };
    const pausedStopped = (0, import_react2.useRef)(/* @__PURE__ */ new Map());
    (0, import_react2.useEffect)(() => {
      for (const id of pausedIds) {
        const s = snap.byId[id];
        if (s === void 0) continue;
        if (s.pendingInteraction) {
          pausedStopped.current.delete(id);
          actions.unmarkPaused(id);
          continue;
        }
        if (s.running) {
          if (pausedStopped.current.get(id) === true) {
            pausedStopped.current.delete(id);
            actions.unmarkPaused(id);
          }
          continue;
        }
        pausedStopped.current.set(id, true);
      }
      for (const id of [...pausedStopped.current.keys()]) {
        if (!pausedIds.includes(id)) pausedStopped.current.delete(id);
      }
    }, [pausedIds, snap]);
    (0, import_react2.useEffect)(() => {
      if (planningIds.length === 0) return;
      const childrenOf = childrenMapOf(snap.ids, snap.byId);
      for (const id of planningIds) {
        if (shouldLeavePool(id) || (childrenOf.get(id)?.length ?? 0) > 0) actions.unmarkPlanning(id);
      }
    }, [planningIds, snap]);
    (0, import_react2.useEffect)(() => {
      const onDown = () => setMenu(MENU_NONE);
      const onKey = (e) => {
        if (e.key === "Escape") {
          setMenu(MENU_NONE);
          setEditing(null);
        }
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, []);
    const [menu, setMenu] = (0, import_react2.useState)(MENU_NONE);
    const [editing, setEditing] = (0, import_react2.useState)(null);
    const [draft, setDraft] = (0, import_react2.useState)("");
    const dragId = (0, import_react2.useRef)(null);
    const taskDragId = (0, import_react2.useRef)(null);
    const [dragOverCol, setDragOverCol] = (0, import_react2.useState)(null);
    const startRename = (item) => {
      setEditing(item.id);
      setDraft(item.session.title ?? item.session.displayTitle ?? "");
      setMenu(MENU_NONE);
    };
    const commitRename = (cancel) => {
      const id = editing;
      setEditing(null);
      if (cancel || id === null || draft.trim() === "") return;
      renameSession(id, draft.trim()).catch(() => {
      });
    };
    const onDragStart = (e, id) => {
      dragId.current = id;
      taskDragId.current = null;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/board-session", id);
    };
    const onPlanDragStart = (e, id) => {
      taskDragId.current = id;
      dragId.current = null;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(TASK_DRAG, id);
    };
    const onColumnDrop = (colKey, e) => {
      e.preventDefault();
      setDragOverCol(null);
      const planId = taskDragId.current;
      if (planId !== null) {
        taskDragId.current = null;
        if (colKey === "running") {
          executePlan(planId).catch(() => {
          });
        }
        return;
      }
      const id = dragId.current;
      if (id === null) return;
      const cards = e.currentTarget.querySelectorAll(".bb-card");
      let beforeId;
      const y = e.clientY;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) {
          beforeId = card.dataset.session;
          break;
        }
      }
      const item = buckets[colKey].find((it) => it.id === id);
      if (item !== void 0 && beforeId !== id) {
        reorderSession(workspaceIdOfSession(views, id), id, beforeId).catch(() => {
        });
      }
    };
    const flat = STATUS_COLUMNS.flatMap((c) => buckets[c.key]);
    const navList = [...shownPlans.map((s) => ({ id: s.id, kind: "plan" })), ...flat.map((it) => ({ id: it.id, kind: "session" }))];
    const onKeyDown = (e) => {
      if (e.key !== "j" && e.key !== "k" && e.key !== "Enter") return;
      if (navList.length === 0) return;
      const idx = navList.findIndex((item) => item.id === focus);
      let next = idx;
      if (e.key === "j") next = idx === -1 ? 0 : Math.min(idx + 1, navList.length - 1);
      if (e.key === "k") next = idx === -1 ? 0 : Math.max(idx - 1, 0);
      if (next !== idx) {
        e.preventDefault();
        actions.setFocus(navList[next].id);
      } else if (e.key === "Enter" && idx !== -1) {
        openSession(navList[idx].id);
      }
    };
    const menuItem = (label, onClick, danger) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        type: "button",
        className: "bb-menu-item" + (danger ? " is-danger" : ""),
        onMouseDown: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        },
        children: label
      },
      label
    );
    const onBlankClick = (e) => {
      const target = e.target;
      if (target instanceof Element && target.closest(".bb-card, .bb-menu, .bb-filter, button, input, select, textarea, a")) return;
      collapseDrawer();
    };
    const openFrom = (id) => {
      actions.setFocus(id);
      openSession(id);
    };
    const primaryOf = (item) => {
      const id = item.id;
      if (item.status === "running") return { label: t("task.pause"), run: () => pauseSession(id).catch((err) => console.warn("board-ui: pause failed:", err)) };
      if (item.status === "paused") return { label: t("task.resume"), run: () => resumeSession(id).catch((err) => console.warn("board-ui: resume failed:", err)) };
      if (item.status === "action_required") return { label: t("task.handle"), run: () => openFrom(id) };
      if (item.status === "reviewing") return { label: t("task.viewReview"), run: () => openFrom(id) };
      return { label: t("task.viewResult"), run: () => openFrom(id) };
    };
    const sessionMenu = (item) => {
      const id = item.id;
      const items = [];
      if (item.status === "running" || item.status === "paused") {
        items.push(
          { label: t("menu.open"), run: () => {
            setMenu(MENU_NONE);
            openSession(id);
          } },
          { label: t("task.viewDetails"), run: () => {
            setMenu(MENU_NONE);
            openActivity(id);
          } }
        );
      } else if (item.status === "action_required") {
        items.push({ label: t("task.viewReason"), run: () => {
          setMenu(MENU_NONE);
          openActivity(id);
        } });
      } else if (item.status === "reviewing") {
        items.push({ label: t("task.reviewAgain"), run: () => {
          setMenu(MENU_NONE);
          reVerifySession(id).catch((err) => console.warn("board-ui: re-review failed:", err));
        } });
      } else {
        items.push({ label: t("task.reRun"), run: () => {
          setMenu(MENU_NONE);
          reRunSession(id).catch((err) => console.warn("board-ui: re-run failed:", err));
        } });
      }
      items.push(
        { label: t("menu.rename"), run: () => {
          const it = flat.find((x) => x.id === id);
          setMenu(MENU_NONE);
          if (it) startRename(it);
        } },
        { label: t("menu.fork"), run: () => {
          setMenu(MENU_NONE);
          forkSession(id);
        } },
        { label: t("menu.archive"), run: () => {
          setMenu(MENU_NONE);
          archiveSession(id).catch(() => {
          });
        }, danger: true }
      );
      return items;
    };
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-board-root", onKeyDown, onClick: onBlankClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-board-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-board-title", children: t("board.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-board-sub", children: t("board.sub") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "select",
          {
            className: "bb-filter",
            value: filter ?? "",
            onChange: (e) => onFilterChange(e.target.value === "" ? null : e.target.value),
            "aria-label": t("filter.label"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: t("filter.all") }),
              views.map((v) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: v.workspaceId, children: v.title }, v.workspaceId))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-cols", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "bb-col bb-col-pending", "data-col": "pending", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-dot", style: { background: "var(--bb-brand)" } }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-main", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-title-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-title", children: t("col.pending") }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-count", children: shownPlans.length })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-sub", children: t("col.pending.sub") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "bb-pool-add", title: t("pool.add"), onClick: () => startTaskPlanning().catch((err) => console.warn("board-ui: start planning failed:", err)), children: "+" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-cards", children: [
            shownPlans.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-col-empty", children: t("pool.empty") }),
            shownPlans.map((session, i) => {
              const stats = planStats.get(session.id) ?? { agentRunning: 0, agentDone: 0, agentWaiting: 0, agentFailed: 0, agentTotal: 0 };
              const item = { id: session.id, session, status: "pending", ...stats };
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                TaskCard,
                {
                  item,
                  animIndex: Math.min(i, 12),
                  current: session.id === snap.current,
                  focused: session.id === focus,
                  editing: editing === session.id,
                  draft,
                  primaryLabel: t("task.execute"),
                  t,
                  wsColor: workspaceColorOf(views, workspaceIdOfSession(views, session.id)),
                  wsTitle: wsTitleOf(workspaceIdOfSession(views, session.id)),
                  onOpen: () => openFrom(session.id),
                  onPrimary: () => executePlan(session.id).catch((err) => console.warn("board-ui: execute plan failed:", err)),
                  onMenu: (e) => setMenu({ kind: "plan", id: session.id, x: e.clientX, y: e.clientY }),
                  onStartRename: () => startRename(item),
                  onDraft: setDraft,
                  onCommitRename: commitRename,
                  onDragStart: onPlanDragStart,
                  onRetry: () => retrySession(session.id).catch((err) => console.warn("board-ui: retry failed:", err)),
                  onViewError: () => openActivity(session.id)
                },
                session.id
              );
            })
          ] })
        ] }),
        STATUS_COLUMNS.map((col) => {
          const items = buckets[col.key];
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "section",
            {
              className: "bb-col" + (dragOverCol === col.key ? " is-dragover" : ""),
              "data-col": col.key,
              onDragOver: (e) => {
                e.preventDefault();
                setDragOverCol(col.key);
              },
              onDragLeave: () => setDragOverCol((c) => c === col.key ? null : c),
              onDrop: (e) => onColumnDrop(col.key, e),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-dot", style: { background: col.dot } }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-main", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-title-row", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-title", children: t("col." + col.key) }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-count", children: items.length })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "bb-col-sub", children: colSubText(col.key, items) })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bb-col-cards", children: [
                  items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-col-empty", children: "\u2014" }),
                  items.map((item, i) => {
                    const primary = primaryOf(item);
                    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      TaskCard,
                      {
                        item,
                        animIndex: Math.min(i, 12),
                        current: item.id === snap.current,
                        focused: item.id === focus,
                        editing: editing === item.id,
                        draft,
                        primaryLabel: primary.label,
                        t,
                        wsColor: workspaceColorOf(views, workspaceIdOfSession(views, item.id)),
                        wsTitle: wsTitleOf(workspaceIdOfSession(views, item.id)),
                        onOpen: () => openFrom(item.id),
                        onPrimary: primary.run,
                        onMenu: (e) => setMenu({ kind: "session", id: item.id, x: e.clientX, y: e.clientY }),
                        onStartRename: () => startRename(item),
                        onDraft: setDraft,
                        onCommitRename: commitRename,
                        onDragStart,
                        onRetry: () => retrySession(item.id).catch((err) => console.warn("board-ui: retry failed:", err)),
                        onViewError: () => openActivity(item.id)
                      },
                      item.id
                    );
                  })
                ] })
              ]
            },
            col.key
          );
        })
      ] }),
      menu.kind !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bb-menu", style: { left: menu.x, top: menu.y }, onMouseDown: (e) => e.stopPropagation(), children: menu.kind === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        menuItem(t("pool.open"), () => {
          setMenu(MENU_NONE);
          openSession(menu.id);
        }),
        menuItem(t("pool.unplan"), () => {
          setMenu(MENU_NONE);
          actions.unmarkPlanning(menu.id);
        }, true)
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: sessionMenu(flat.find((it) => it.id === menu.id) ?? { id: menu.id, status: "completed" }).map((m) => menuItem(m.label, m.run, m.danger)) }) })
    ] });
  }

  // src/client/palette/Palette.tsx
  var import_react3 = __require("react");
  var import_jsx_runtime3 = __require("react/jsx-runtime");
  function Palette({ useSessions, t, openSession }) {
    const [open, setOpen] = (0, import_react3.useState)(false);
    const [query, setQuery] = (0, import_react3.useState)("");
    const [sel, setSel] = (0, import_react3.useState)(0);
    (0, import_react3.useEffect)(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setOpen((o) => !o);
          setQuery("");
          setSel(0);
        } else if (e.key === "Escape") {
          setOpen(false);
        }
      };
      const onOpenEvent = () => {
        setOpen(true);
        setQuery("");
        setSel(0);
      };
      window.addEventListener("keydown", onKey);
      window.addEventListener("bb:palette-open", onOpenEvent);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("bb:palette-open", onOpenEvent);
      };
    }, []);
    const snap = useSessions((s) => s);
    const items = (0, import_react3.useMemo)(() => {
      const q = query.trim().toLowerCase();
      const list = snap.ids.map((id) => snap.byId[id]).filter((s) => s !== void 0 && !s.blank);
      const filtered = q ? list.filter((s) => s.displayTitle.toLowerCase().includes(q)) : list;
      return filtered.slice(0, 8).map((s) => ({
        id: s.id,
        label: s.displayTitle,
        sub: s.running ? t("pal.running") : s.completed ? t("pal.done") : t("pal.idle")
      }));
    }, [query, snap, t]);
    if (!open) return null;
    const pick = (id) => {
      setOpen(false);
      openSession(id);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "bb-palette-backdrop", onMouseDown: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "bb-palette", onMouseDown: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          autoFocus: true,
          className: "bb-palette-input",
          placeholder: t("pal.placeholder"),
          value: query,
          onChange: (e) => {
            setQuery(e.target.value);
            setSel(0);
          },
          onKeyDown: (e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            }
            if (e.key === "Enter") {
              const item = items[sel];
              if (item !== void 0) pick(item.id);
            }
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "bb-palette-list", children: [
        items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "bb-palette-empty", children: t("pal.empty") }),
        items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            className: "bb-palette-item" + (i === sel ? " is-selected" : ""),
            onMouseEnter: () => setSel(i),
            onClick: () => pick(item.id),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "bb-palette-label", children: item.label }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "bb-palette-sub", children: item.sub })
            ]
          },
          item.id
        ))
      ] })
    ] }) });
  }

  // src/client/activity/Activity.tsx
  var import_jsx_runtime4 = __require("react/jsx-runtime");
  function durationOf(job, t) {
    if (!job.startedAt) return "";
    const end = job.status === "running" || job.status === "stopping" ? Date.now() : job.finishedAt ?? job.startedAt;
    const sec = Math.max(0, Math.round((end - job.startedAt) / 1e3));
    if (sec < 60) return sec + "s";
    const min = Math.floor(sec / 60);
    if (min < 60) return min + "m " + sec % 60 + "s";
    return Math.floor(min / 60) + "h " + min % 60 + "m";
  }
  function ActivityPanel({ sessionId, useSessions, t, switchToChat }) {
    const snap = useSessions((s) => s);
    const jobs = snap.jobsBySession?.[sessionId] ?? [];
    const subagents = (snap.subagentsByParent?.[sessionId]?.entries ?? []).filter((entry) => entry.kind === "child" || entry.kind === "diagnostic");
    const pending = snap.byId[sessionId]?.pendingInteraction !== void 0;
    const live = jobs.filter((j) => j.status === "running" || j.status === "stopping").length;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "bb-act", children: [
      pending && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "bb-act-banner", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-banner-text", children: t("act.pending") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "bb-act-banner-btn", onClick: switchToChat, children: t("act.backToChat") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "bb-act-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-section-title", children: t("act.jobs") }),
        jobs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-empty", children: t("act.noJobs") }),
        jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "bb-act-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-dot " + (job.status === "running" || job.status === "stopping" ? "run" : "done") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-kind", children: job.kind }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-label", children: job.label }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-detail", children: job.detail ?? durationOf(job, t) })
        ] }, job.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "bb-act-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-section-title", children: t("act.subagents") }),
        subagents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-empty", children: t("act.noSubagents") }),
        subagents.map((child) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-row", children: child.kind === "diagnostic" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-dot fail" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-label", children: t("act.subagentFailed") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-detail", children: child.reason })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-dot " + (child.activity === "running" ? "run" : "done") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-label", children: child.label ?? child.id }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bb-act-detail", children: child.activity === "running" ? t("act.running") : "" })
        ] }) }, child.id))
      ] }),
      jobs.length === 0 && subagents.length === 0 && !pending && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "bb-act-empty", children: t("act.nothing") })
    ] });
  }

  // src/client/locale.ts
  var zh = {
    "board.title": "\u4EFB\u52A1\u770B\u677F",
    "board.sub": "\u70B9\u51FB\u5361\u7247\u6253\u5F00\u4EFB\u52A1\u8BE6\u60C5",
    // columns — the five lifecycle states (counts = task counts)
    "col.pending": "\u5F85\u6267\u884C",
    "col.pending.sub": "\u7B49\u5F85 Agent \u5F00\u59CB\u6267\u884C",
    "col.running": "\u8FDB\u884C\u4E2D",
    "col.running.sub": "{n} \u4E2A Agent \u6B63\u5728\u8FD0\u884C",
    "col.action_required": "\u9700\u8981\u5904\u7406",
    "col.action_required.sub": "\u7B49\u5F85\u4EBA\u5DE5\u5904\u7406",
    "col.reviewing": "\u9A8C\u6536\u4E2D",
    "col.reviewing.sub": "\u6B63\u5728\u8FDB\u884C\u6700\u7EC8\u9A8C\u6536",
    "col.completed": "\u5DF2\u5B8C\u6210",
    "col.completed.sub": "\u4EFB\u52A1\u5DF2\u5B8C\u6210",
    // card status badges
    "card.statusPending": "\u5F85\u6267\u884C",
    "card.statusRunning": "\u8FDB\u884C\u4E2D",
    "card.statusPaused": "\u5DF2\u6682\u505C",
    "card.statusActionRequired": "\u9700\u8981\u5904\u7406",
    "card.statusReviewing": "\u9A8C\u6536\u4E2D",
    "card.statusDone": "\u5DF2\u5B8C\u6210",
    // card hint lines
    "card.reasonApproval": "\u7B49\u5F85\u5BA1\u6279",
    "card.reasonPlanReview": "\u8BA1\u5212\u5F85\u5BA1",
    "card.reasonQuestion": "\u7B49\u5F85\u4F60\u7684\u56DE\u7B54",
    "card.reviewingHint": "\u6B63\u5728\u8FDB\u884C\u6700\u7EC8\u9A8C\u6536",
    "card.acceptedMeta": "\u9A8C\u6536\u901A\u8FC7 \xB7 {time}",
    "card.failedHint": "{n} \u4E2A Agent \u6267\u884C\u5931\u8D25",
    // sub-agent stats — marks only, never avatars
    "card.subagents": "\u5B50 Agent",
    "card.agentsRunning": "\u8FD0\u884C\u4E2D",
    "card.agentsDone": "\u5DF2\u5B8C\u6210",
    "card.agentsWaiting": "\u7B49\u5F85",
    "card.agentsFailed": "\u5931\u8D25",
    "card.progress": "{done} / {total} \u5DF2\u5B8C\u6210",
    "card.now": "\u521A\u521A",
    "card.min": "\u5206\u949F\u524D",
    "card.hour": "\u5C0F\u65F6\u524D",
    "card.day": "\u5929\u524D",
    // task-level actions (one primary per status; the rest live in the ⋯ menu)
    "task.execute": "\u5F00\u59CB\u6267\u884C",
    "task.pause": "\u6682\u505C",
    "task.resume": "\u7EE7\u7EED\u6267\u884C",
    "task.handle": "\u5904\u7406",
    "task.viewReason": "\u67E5\u770B\u539F\u56E0",
    "task.viewDetails": "\u67E5\u770B\u6267\u884C\u8BE6\u60C5",
    "task.viewReview": "\u67E5\u770B\u9A8C\u6536\u7ED3\u679C",
    "task.reviewAgain": "\u91CD\u65B0\u9A8C\u6536",
    "task.viewResult": "\u67E5\u770B\u7ED3\u679C",
    "task.reRun": "\u91CD\u65B0\u6267\u884C",
    "task.retry": "\u91CD\u8BD5",
    "task.viewError": "\u67E5\u770B\u9519\u8BEF",
    "menu.more": "\u66F4\u591A\u64CD\u4F5C",
    // 待执行 column — plan creation and plan card menu
    "pool.add": "\u5BF9\u8BDD\u89C4\u5212\u65B0\u4EFB\u52A1",
    "pool.empty": "\u6682\u65E0\u5F85\u6267\u884C\u4EFB\u52A1 \u2014 \u70B9 + \u4E0E\u4EE3\u7406\u5BF9\u8BDD\u89C4\u5212\uFF08\u4E0D\u4F1A\u7ACB\u5373\u6267\u884C\uFF09",
    "pool.newTitle": "\u4EFB\u52A1\u6807\u9898",
    "pool.newPlan": "\u8BA1\u5212\u5185\u5BB9\uFF08\u5F00\u59CB\u540E\u4F5C\u4E3A\u7B2C\u4E00\u6761\u6D88\u606F\u53D1\u9001\u7ED9\u4EE3\u7406\uFF09",
    "pool.create": "\u521B\u5EFA",
    "pool.save": "\u4FDD\u5B58",
    "pool.cancel": "\u53D6\u6D88",
    "pool.open": "\u6253\u5F00\u5BF9\u8BDD",
    "pool.unplan": "\u79FB\u51FA\u5F85\u6267\u884C",
    "pool.ungrouped": "\u672A\u5206\u7EC4",
    "search.placeholder": "\u641C\u7D22\u4F1A\u8BDD\u2026",
    "theme.cycle": "\u5207\u6362\u4E3B\u9898",
    "theme.light": "\u4EAE\u8272",
    "theme.dark": "\u6697\u8272",
    "theme.system": "\u8DDF\u968F\u7CFB\u7EDF",
    "pal.placeholder": "\u641C\u7D22\u4F1A\u8BDD\uFF0C\u56DE\u8F66\u6253\u5F00\u2026",
    "pal.empty": "\u6CA1\u6709\u5339\u914D\u7684\u4F1A\u8BDD",
    "pal.running": "\u8FDB\u884C\u4E2D",
    "pal.done": "\u5DF2\u5B8C\u6210",
    "pal.idle": "\u7A7A\u95F2",
    "filter.label": "\u7B5B\u9009\u5DE5\u4F5C\u533A",
    "filter.all": "\u5168\u90E8\u5DE5\u4F5C\u533A",
    "menu.open": "\u6253\u5F00",
    "menu.rename": "\u91CD\u547D\u540D",
    "menu.fork": "\u590D\u5236\u4F1A\u8BDD",
    "menu.archive": "\u5F52\u6863",
    "drawer.chat": "\u5BF9\u8BDD",
    "drawer.activity": "\u6D3B\u52A8",
    "drawer.close": "\u6536\u8D77\u9762\u677F",
    "act.pending": "\u8FD9\u4E2A\u4F1A\u8BDD\u5728\u7B49\u4F60\u5904\u7406\uFF08\u5BA1\u6279\u6216\u63D0\u95EE\uFF09",
    "act.backToChat": "\u56DE\u5230\u5BF9\u8BDD",
    "act.jobs": "\u540E\u53F0\u4EFB\u52A1",
    "act.noJobs": "\u6CA1\u6709\u540E\u53F0\u4EFB\u52A1",
    "act.subagents": "\u5B50\u4EE3\u7406",
    "act.noSubagents": "\u6CA1\u6709\u5B50\u4EE3\u7406",
    "act.running": "\u8FD0\u884C\u4E2D",
    "act.subagentFailed": "\u5B50\u4EE3\u7406\u5931\u8D25",
    "act.nothing": "\u6682\u65E0\u6D3B\u52A8"
  };
  var en = {
    "board.title": "Task Board",
    "board.sub": "Click a card to open task details",
    // columns — the five lifecycle states (counts = task counts)
    "col.pending": "Pending",
    "col.pending.sub": "Waiting for an agent to start",
    "col.running": "Running",
    "col.running.sub": "{n} agents running",
    "col.action_required": "Needs Action",
    "col.action_required.sub": "Awaiting human action",
    "col.reviewing": "In Review",
    "col.reviewing.sub": "Final acceptance in progress",
    "col.completed": "Done",
    "col.completed.sub": "Tasks completed",
    // card status badges
    "card.statusPending": "Pending",
    "card.statusRunning": "Running",
    "card.statusPaused": "Paused",
    "card.statusActionRequired": "Needs Action",
    "card.statusReviewing": "In Review",
    "card.statusDone": "Done",
    // card hint lines
    "card.reasonApproval": "Awaiting approval",
    "card.reasonPlanReview": "Plan awaiting review",
    "card.reasonQuestion": "Awaiting your answer",
    "card.reviewingHint": "Final acceptance in progress",
    "card.acceptedMeta": "Accepted \xB7 {time}",
    "card.failedHint": "{n} agents failed",
    // sub-agent stats — marks only, never avatars
    "card.subagents": "Subagents",
    "card.agentsRunning": "running",
    "card.agentsDone": "done",
    "card.agentsWaiting": "waiting",
    "card.agentsFailed": "failed",
    "card.progress": "{done} / {total} done",
    "card.now": "just now",
    "card.min": "m ago",
    "card.hour": "h ago",
    "card.day": "d ago",
    // task-level actions (one primary per status; the rest live in the ⋯ menu)
    "task.execute": "Execute",
    "task.pause": "Pause",
    "task.resume": "Resume",
    "task.handle": "Handle",
    "task.viewReason": "View reason",
    "task.viewDetails": "View details",
    "task.viewReview": "View review",
    "task.reviewAgain": "Re-review",
    "task.viewResult": "View result",
    "task.reRun": "Re-run",
    "task.retry": "Retry",
    "task.viewError": "View errors",
    "menu.more": "More actions",
    // Pending column — plan creation and plan card menu
    "pool.add": "Plan a new task in conversation",
    "pool.empty": "No pending tasks \u2014 click + to plan one with the agent (nothing runs)",
    "pool.newTitle": "Task title",
    "pool.newPlan": "Plan (sent to the agent as the first message when started)",
    "pool.create": "Create",
    "pool.save": "Save",
    "pool.cancel": "Cancel",
    "pool.open": "Open chat",
    "pool.unplan": "Remove from pending",
    "pool.ungrouped": "Ungrouped",
    "search.placeholder": "Search sessions\u2026",
    "theme.cycle": "Cycle theme",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "pal.placeholder": "Search sessions, Enter to open\u2026",
    "pal.empty": "No matching sessions",
    "pal.running": "running",
    "pal.done": "done",
    "pal.idle": "idle",
    "filter.label": "Filter workspace",
    "filter.all": "All workspaces",
    "menu.open": "Open",
    "menu.rename": "Rename",
    "menu.fork": "Duplicate session",
    "menu.archive": "Archive",
    "drawer.chat": "Chat",
    "drawer.activity": "Activity",
    "drawer.close": "Collapse panel",
    "act.pending": "This session needs you (approval or question)",
    "act.backToChat": "Back to chat",
    "act.jobs": "Background jobs",
    "act.noJobs": "No background jobs",
    "act.subagents": "Subagents",
    "act.noSubagents": "No subagents",
    "act.running": "running",
    "act.subagentFailed": "Subagent failed",
    "act.nothing": "Nothing here yet"
  };

  // src/client/index.tsx
  var BUILD_TAG = true ? "202608170732" : "dev";
  var inject = ["slots", "theme", "locale", "sessions", "workspaces"];
  var clampWidth = (px, min, max) => Math.min(max, Math.max(min, px));
  function createFrameStore() {
    return (0, import_client.defineStore)({
      init: () => ({
        sidebar: 280,
        details: 0,
        narrow: false,
        themePref: "system",
        drawerTab: "chat",
        drawerOpen: false,
        drawerWidth: 640,
        workspaceFilter: null
      }),
      actions: {
        setSidebar: (d, px) => {
          d.sidebar = clampWidth(px, 240, 420);
        },
        setDetails: (d, px) => {
          d.details = clampWidth(px, 300, 560);
        },
        toggleSidebar: (d) => {
          d.sidebar = d.sidebar === 0 ? 280 : 0;
        },
        openDetails: (d) => {
          if (d.details === 0) d.details = 360;
        },
        closeDetails: (d) => {
          d.details = 0;
        },
        syncTheme: (d, pref) => {
          d.themePref = pref;
        },
        setDrawerTab: (d, tab) => {
          d.drawerTab = tab;
        },
        setDrawerOpen: (d, open) => {
          d.drawerOpen = open;
        },
        setDrawerWidth: (d, px) => {
          d.drawerWidth = clampWidth(px, 420, 1100);
        },
        setWorkspaceFilter: (d, workspaceId) => {
          d.workspaceFilter = workspaceId;
        }
      }
    });
  }
  function createBoardStore() {
    return (0, import_client.defineStore)({
      init: () => ({ focus: null, filter: null, planningIds: [], pausedIds: [] }),
      // v2: the v1 shape ({tasks}) is incompatible — a fresh key drops it.
      persist: "dsh.board.board.v2",
      actions: {
        setFocus: (d, id) => {
          d.focus = id;
        },
        setFilter: (d, workspaceId) => {
          d.filter = workspaceId;
        },
        markPlanning: (d, id) => {
          if (!(d.planningIds ?? []).includes(id)) d.planningIds = [...d.planningIds ?? [], id];
        },
        unmarkPlanning: (d, id) => {
          d.planningIds = (d.planningIds ?? []).filter((x) => x !== id);
        },
        markPaused: (d, id) => {
          if (!(d.pausedIds ?? []).includes(id)) d.pausedIds = [...d.pausedIds ?? [], id];
        },
        unmarkPaused: (d, id) => {
          d.pausedIds = (d.pausedIds ?? []).filter((x) => x !== id);
        }
      }
    });
  }
  var LayoutController = class {
    #panels;
    attachPanels(actions) {
      this.#panels = actions;
    }
    toggleSidebar() {
      this.#require().toggleSidebar();
    }
    openDetails() {
      this.#require().openDetails();
    }
    closeDetails() {
      this.#require().closeDetails();
    }
    #require() {
      if (this.#panels === void 0) throw new Error("board-ui: layout panel actions not wired (root entry not mounted)");
      return this.#panels;
    }
  };
  var DARK_ATTRIBUTE = "data-ds-dark-theme";
  var ThemePresenter = class {
    appliedTokens = [];
    themeColorMeta;
    constructor() {
      this.themeColorMeta = document.createElement("meta");
      this.themeColorMeta.name = "theme-color";
    }
    apply(snapshot) {
      const scheme = snapshot.active.colorScheme;
      document.documentElement.style.colorScheme = scheme;
      const body = document.body;
      if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
      else body.removeAttribute(DARK_ATTRIBUTE);
      for (const name of this.appliedTokens) body.style.removeProperty(name);
      this.appliedTokens = [];
      for (const [name, value] of Object.entries(snapshot.active.tokens)) {
        body.style.setProperty(name, value);
        this.appliedTokens.push(name);
      }
      this.themeColorMeta.content = getComputedStyle(body).backgroundColor;
      if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta);
    }
    dispose() {
      document.documentElement.style.removeProperty("color-scheme");
      const body = document.body;
      body.removeAttribute(DARK_ATTRIBUTE);
      for (const name of this.appliedTokens) body.style.removeProperty(name);
      this.appliedTokens = [];
      this.themeColorMeta.remove();
    }
  };
  var ALL_CSS = [tokens_default, frame_default, board_default, board_phase2_default, pool_default, palette_default, activity_default].join("\n");
  function apply(ctx) {
    ctx.effect(() => {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-board-ui";
      tag.textContent = ALL_CSS;
      document.head.appendChild(tag);
      return () => tag.remove();
    }, "board-ui: css");
    ctx.effect(() => ctx.locale.register("board", { zh, en }), "board-ui: dictionaries");
    const presenter = new ThemePresenter();
    ctx.effect(() => {
      presenter.apply(ctx.theme.getTheme());
      const off = ctx.on("theme/change", (snapshot) => presenter.apply(snapshot));
      return () => {
        off();
        presenter.dispose();
      };
    }, "board-ui: theme presenter");
    const layout = new LayoutController();
    let frameActions;
    ctx.effect(() => {
      const disposeRegistration = ctx.slots.register({
        name: "root",
        priority: -1,
        locale: "board",
        children: {
          sidebar: { kind: "single", scope: "root" },
          board: { kind: "single", scope: "root" },
          conversation: { kind: "single", scope: "session-maybe" },
          activity: { kind: "single", scope: "session" },
          details: { kind: "single", scope: "session" },
          "shell.overlay": { kind: "list", scope: "root" }
        },
        store: createFrameStore,
        inject: (actions) => {
          layout.attachPanels(actions);
          frameActions = actions;
          actions.syncTheme(ctx.theme.getTheme().preference);
          return {
            injectBuildTag: BUILD_TAG,
            cycleTheme: () => {
              const pref = ctx.theme.getTheme().preference;
              const next = pref === "light" ? "dark" : pref === "dark" ? "system" : "light";
              ctx.theme.setTheme(next);
            }
          };
        }
      }, BoardFrame);
      const disposeService = ctx.reflect.provide("layout", layout);
      return () => {
        disposeService();
        disposeRegistration();
      };
    }, "board-ui: layout service + root frame");
    ctx.effect(() => ctx.on("theme/change", (snapshot) => {
      frameActions?.syncTheme(snapshot.preference);
    }), "board-ui: theme label sync");
    const EXECUTE_PROMPT = "\u8BA1\u5212\u5DF2\u786E\u8BA4\u3002\u8BF7\u5F00\u59CB\u6267\u884C\u6211\u4EEC\u521A\u624D\u5236\u5B9A\u7684\u8BA1\u5212\u3002";
    const RE_VERIFY_PROMPT = "\u8BF7\u5BF9\u521A\u624D\u5B8C\u6210\u7684\u6267\u884C\u7ED3\u679C\u8FDB\u884C\u6700\u7EC8\u9A8C\u6536\uFF1A\u9010\u9879\u68C0\u67E5\u5404\u5B50 Agent \u7684\u4EA7\u51FA\u662F\u5426\u6EE1\u8DB3\u4EFB\u52A1\u8981\u6C42\u3002\u5982\u53D1\u73B0\u95EE\u9898\u8BF7\u91CD\u65B0\u6267\u884C\u5E76\u4FEE\u590D\uFF1B\u9A8C\u6536\u901A\u8FC7\u540E\u8BF7\u603B\u7ED3\u7ED3\u8BBA\u3002";
    const RE_RUN_PROMPT = "\u8BF7\u91CD\u65B0\u6267\u884C\u8FD9\u4E2A\u4EFB\u52A1\uFF0C\u5B8C\u6210\u540E\u8FDB\u884C\u6700\u7EC8\u9A8C\u6536\u5E76\u603B\u7ED3\u7ED3\u679C\u3002";
    const RETRY_PROMPT = "\u6709\u5B50 Agent \u6267\u884C\u5931\u8D25\u3002\u8BF7\u91CD\u8BD5\u5931\u8D25\u7684\u90E8\u5206\uFF0C\u7EE7\u7EED\u5B8C\u6210\u4EFB\u52A1\uFF0C\u5E76\u5B8C\u6210\u6700\u7EC8\u9A8C\u6536\u3002";
    const resolveTaskWorkspace = (explicitWorkspaceId) => {
      const wsSnap = ctx.workspaces.list.getSnapshot();
      const sessSnap = ctx.sessions.list.getSnapshot();
      const currentWs = sessSnap.current === void 0 ? void 0 : wsSnap.items.find((item) => item.sessionIds.includes(sessSnap.current))?.workspaceId;
      return explicitWorkspaceId ?? currentWs ?? wsSnap.recentWorkspaceId;
    };
    const createFreshSession = async (explicitWorkspaceId) => {
      const target = resolveTaskWorkspace(explicitWorkspaceId);
      if (target === void 0) {
        ctx.sessions.clear();
        throw new Error("no workspace available to start the task");
      }
      return ctx.sessions.create({ workspaceId: target });
    };
    const promptNewSession = async (sessionId, content) => {
      const payload = [{ type: "text", text: content }];
      const sendPlan = async () => {
        const session = ctx.sessions.binding(sessionId)?.session;
        if (session === void 0) return false;
        const result = await session.prompt(payload, "queue");
        if (!result.ok) throw new Error("session.prompt failed: " + (result.error?.code ?? "unknown") + ": " + (result.error?.message ?? ""));
        return true;
      };
      if (!await sendPlan()) {
        for (let i = 0; i < 40; i += 1) {
          await new Promise((r) => setTimeout(r, 50));
          if (await sendPlan()) return;
        }
        throw new Error("session binding unavailable after start");
      }
    };
    const withBinding = async (sessionId, run) => {
      for (let i = 0; i < 40; i += 1) {
        const binding = ctx.sessions.binding(sessionId);
        if (binding !== void 0) return run(binding.session);
        await new Promise((r) => setTimeout(r, 50));
      }
      throw new Error("session binding unavailable");
    };
    const promptSession = async (sessionId, content) => {
      const result = await withBinding(sessionId, (session) => session.prompt([{ type: "text", text: content }], "queue"));
      if (!result.ok) throw new Error("session.prompt failed: " + (result.error?.code ?? "unknown") + ": " + (result.error?.message ?? ""));
    };
    ctx.slots.register({
      name: "board",
      locale: "board",
      store: createBoardStore,
      inject: (boardActions) => {
        const face = {
          openSession: (id) => {
            frameActions?.setDrawerOpen(true);
            ctx.sessions.open(id);
            const isPlan = (boardActions.getSnapshot().planningIds ?? []).includes(id);
            if (isPlan) {
              let tries = 0;
              const check = () => {
                if (tries++ >= 30) return;
                if (face.shouldLeavePool(id)) {
                  boardActions.unmarkPlanning(id);
                  return;
                }
                setTimeout(check, 100);
              };
              setTimeout(check, 200);
            }
          },
          collapseDrawer: () => {
            frameActions?.setDrawerOpen(false);
          },
          renameSession: async (id, title) => {
            const session = ctx.sessions.binding(id)?.session;
            if (session === void 0) throw new Error(`unknown session "${id}"`);
            const result = await session.rename(title);
            if (!result.ok) throw new Error(result.error?.message ?? "rename failed");
          },
          forkSession: (id) => {
            ctx.sessions.fork({ sessionId: id, increaseTitle: true }).then((childId) => {
              ctx.sessions.open(childId);
            }).catch(() => {
            });
          },
          archiveSession: async (id) => {
            await ctx.workspaces.archiveSession(id);
          },
          reorderSession: async (workspaceId, sessionId, beforeSessionId) => {
            await ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId);
          },
          startTaskPlanning: async () => {
            const sessionId = await createFreshSession(null);
            boardActions.markPlanning(sessionId);
            ctx.sessions.open(sessionId);
            frameActions?.setDrawerOpen(true);
          },
          executePlan: async (sessionId) => {
            boardActions.unmarkPlanning(sessionId);
            await promptNewSession(sessionId, EXECUTE_PROMPT);
          },
          // ⏸ 暂停 — a real session.cancel() (the running turn stops, queued work
          // stays parked in FIFO) plus a client-side mark that keeps the card in
          // 进行中 with the 已暂停 badge. Resume re-prompts the session.
          pauseSession: async (sessionId) => {
            boardActions.markPaused(sessionId);
            try {
              const result = await withBinding(sessionId, (session) => session.cancel());
              if (!result.ok) throw new Error(result.error?.message ?? "cancel failed");
            } catch (err) {
              boardActions.unmarkPaused(sessionId);
              throw err;
            }
          },
          resumeSession: async (sessionId) => {
            boardActions.unmarkPaused(sessionId);
            await promptSession(sessionId, "\u8BF7\u7EE7\u7EED\u6267\u884C\u3002");
          },
          reVerifySession: (sessionId) => promptSession(sessionId, RE_VERIFY_PROMPT),
          reRunSession: (sessionId) => promptSession(sessionId, RE_RUN_PROMPT),
          retrySession: (sessionId) => promptSession(sessionId, RETRY_PROMPT),
          openActivity: (sessionId) => {
            frameActions?.setDrawerOpen(true);
            frameActions?.setDrawerTab("activity");
            ctx.sessions.open(sessionId);
          },
          // Pure check (runs inside the Board effect over the STORE's planningIds,
          // which includes persisted plans — an apply-level Set missed those).
          shouldLeavePool: (id) => {
            const summary = ctx.sessions.list.getSnapshot().byId[id];
            if (summary?.pendingInteraction === "approval" || summary?.pendingInteraction === "plan-review") return true;
            const session = ctx.sessions.binding(id)?.session;
            if (session === void 0) return false;
            const nodes = session.conversation?.snapshot("chat")?.legacy?.nodes ?? [];
            return planStartedInConversation(nodes);
          }
        };
        return face;
      }
    }, Board);
    ctx.slots.register({
      name: "shell.overlay",
      id: "board-palette",
      order: 1e3,
      locale: "board",
      inject: () => ({
        openSession: (id) => {
          frameActions?.setDrawerOpen(true);
          ctx.sessions.open(id);
        }
      })
    }, Palette);
    ctx.slots.register({
      name: "activity",
      locale: "board",
      inject: () => ({
        switchToChat: () => {
          frameActions?.setDrawerTab("chat");
        }
      })
    }, ActivityPanel);
  }
  return __toCommonJS(index_exports);
})();
return __boardUiBundle;}});
