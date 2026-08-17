// Builds the browser bundle for @deepseek-ai/dsh-board-ui into
// lib/client.js in the exact wire format the web shell expects:
//   window.__ModuleLoader__.load({ id, factory: (require) => { ...bundle... } })
// and the factory returns the module exports (apply/inject). External deps
// resolve through the module loader at runtime (seed words + boot-graph rows
// declared in package.json dsh.client.inject).
import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");

const shared = {
  entryPoints: ["src/client/index.tsx"],
  outfile: "lib/client.js",
  bundle: true,
  format: "iife",
  globalName: "__boardUiBundle",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  define: {
    __BOARD_UI_BUILD__: JSON.stringify(new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12))
  },
  logLevel: "info",
  loader: { ".css": "text" },
  external: [
    // Platform seed words / shell-own modules (no graph row needed):
    "react",
    "react/jsx-runtime",
    "react-dom",
    "react-dom/client",
    "@deepseek-ai/cordis",
    "@deepseek-ai/dsh-client-ui-slots",
    "@deepseek-ai/dsh-client-web-react",
    "@deepseek-ai/dsh-client-ui-primitives",
    // Boot-graph rows (declared in package.json dsh.client.inject):
    "@deepseek-ai/dsh-client-runtime/client",
    "@deepseek-ai/dsh-client-ui-theme/client",
    "@deepseek-ai/dsh-client-locale/client"
  ],
  banner: {
    js: 'window.__ModuleLoader__.load({id:"@deepseek-ai/dsh-board-ui",factory:(require)=>{'
  },
  footer: { js: "return __boardUiBundle;}});" },
  minify: false,
  sourcemap: false
};

if (watch) {
  const ctx = await context(shared);
  await ctx.watch();
  console.log("[board-ui] watching src/client/** for changes");
} else {
  await build(shared);
  console.log("[board-ui] built lib/client.js");
}
