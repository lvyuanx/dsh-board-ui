# How the DSH Web app loads & serves browser (client) plugins - investigation report

All paths are under the npx checkout root C = /Users/lvyx/.npm/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai
(binaries resolve via C/../.bin/dsh). Live server: node /Users/lvyx/.npm/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/../.bin/dsh web (PID 6190, port 3080).

## 1. Node half: which config rows are client plugins, __DSH_BOOT__, /plugins serving

Package: /Users/lvyx/.npm/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-modules/lib/index.js - the ClientModuleRegistry service (inject: ["webServer","loader"], L122).

**Detection - the dsh.client marker.** The scan is per loader ENTRY, not per YAML row syntax:
- Every entry whose fiber is constructed/disposed emits internal/plugin; the entry name is marked dirty and a microtask flush reconciles it (L140-152). The activation pass seeds the dirty set from ctx.loader.entries() and flushes synchronously (L153-157), so first scan and steady state share one path.
- processOne(entryName) (L281-297): a name qualifies ONLY if some live loader entry has entry.options.name === entryName AND entry.fiber !== undefined AND !entry.disabled (L283). So the package must be an ACTIVE loader row (a running fiber) and the row name must be the package name.
- resolveMeta(pkgName) (L238-264) resolves the package.json with createRequire(ctx.baseUrl) (L137-139) - require.resolve("<spec>/package.json") anchored at the profile directory (ctx.baseUrl, see sec 3) - parses pkg.dsh.client (parseDshClient, L61-73) and requires:
  - dsh.client.platform must be a **string** (L65); anything other than "web" -> verdict null (not a client package) (L251-253);
  - optional dsh.client.inject (string array, L66) and dsh.client.immediately (boolean, L67);
  - exports["./client"] must exist (string or object with default string, L75-85) - else a loud throw (L256), which at activation aggregates into ClientPackageCompositionError (L46-59, L157) and fails boot.
  - clientPath = join(dirname(pkgPath), clientRel) (L258). Metadata (including the negative verdict) is cached per name in pkgMeta and **never expires** - "plugin-set changes take effect on restart" (L22-26, L238-240).

**Row shape** a client-plugin row needs, therefore: a loader entry { id?: string, name: "<package-name>", config?: ..., inject?: [...], disabled?: false } (only name is required), where <package-name> is the npm package name, and the package.json carries "dsh": { "client": { "platform": "web", "inject"?: ["<pkg>", ...], "immediately"?: true } } plus "exports": { "./client": "./lib/client.js", "./package.json": "./package.json", ... }. The node half of the package (exports["."]) must start cleanly as a fiber (a no-op apply() {} suffices - see dsh-client-ui-layout/lib/index.js).

**Composing window.__DSH_BOOT__.** graphRow(id, rev, injectEdges, immediately) (L91-99) makes { id, url: "/plugins/<id>/client.js?rev=<rev>", rev, inject?, immediately? } - **id == package name** (manifest type WebBootEntry, dsh-client-modules/lib/types/client/manifest.d.ts L46-57: "Entry name == package name"). compose() (L224-230) wraps the rows as { rev: shortHash(JSON.stringify(entries)), entries } (sha1, 12 hex, L86-89). The graph is injected into the served index.html by injectBootManifest(html, graph) (L108-113): a script assigning window.__DSH_BOOT__ = <json with "<" escaped> inserted as the first child of <head>.

**Serving.** The constructor registers a webServer.register({ kind: "prefix", path: "/plugins", handler: serveBundle }) effect (L158-162) and an index tap (L163). serveBundle (L313-344): GET/HEAD only (405 otherwise); id = pathname.slice(9, -suffix.length); serves /plugins/<id>/client.js (and /plugins/<id>/client.js.map when present) from clientPath with content-type "text/javascript; charset=utf-8", cache-control "no-cache"; unknown id -> 404. rebuilt(id) (L186-200) re-hashes a bundle after a content change and recomposes the graph - the only in-process path for content updates (the HMR hook).

## 2. Boot payload: injected server-side per request (not baked in)

- dsh-web-frontend/dist/index.html is a static SPA shell with NO __DSH_BOOT__ and no roster: head is just meta/link/title + module scripts (a module script src=/assets/index-Dqw48FrP.js). The boot script is NOT in the file.
- dsh-host-frontend-static/lib/index.js: the dist server claims the webServer "fallback seat" (registerFallback, L73-82). Every index response runs renderIndex = async () => ctx.webServer.applyIndexTaps(await readFile(distIndex, "utf8")) (L72) - index.html is re-read and the registered taps (including client-modules boot-manifest injection) are applied **per request**. serveStatic (L40-63) falls back to index for any miss (SPA routing; 403 traversal; 405 non-GET).
- dsh-web-app/lib/index.js: resolveDistIndex() = require.resolve("@deepseek-ai/dsh-web-frontend/dist/index.html") from the web-app package (L65-73); apply mounts ctx.plugin(FrontendStatic, { distIndex }) (L85).
- Browser kernel: the boot graph is parsed by the client-modules browser half (parseBootManifest, dsh-client-modules/lib/client.js L209-239); bundles register via window.__ModuleLoader__.load({ id, factory }) and the factory exports apply/inject. Seed words a factory may require without a graph row (from the built shell, dist/assets/index-Dqw48FrP.js Um()): react, react/jsx-runtime, react-dom, react-dom/client, @deepseek-ai/cordis, @deepseek-ai/dsh-client-ui-slots, -web-react, -ui-primitives, -ui-attachment, -schema-form; any other specifier must be a graph row id (subpath /client is stripped, client.js L28).

## 3. Loader resolution, baseUrl anchors, and how dsh plugin installs

- @deepseek-ai/cordis-plugin-loader/lib/index.js EntryTree.import(name) (L260-274): cordis: -> builtins; else if this.ctx.loader.internal -> internal.import(name, this.ctx.baseUrl, {}) - the **Node internal ESM cascaded loader with parentURL = ctx.baseUrl**; relative names -> new URL(name, ctx.baseUrl); bare names otherwise -> plain import(name) (resolves from the loader package itself - the npx checkout). Loader.internal = ModuleLoader.fromInternal() (L662) requires --expose-internals or the optional node-addon-require-builtin (L9-30); that addon IS installed in the checkout and, on Node v24.15.0, fromInternal() returns a live cascaded loader with import (verified empirically).
- ctx.baseUrl is anchored at the PROFILE DIRECTORY: dsh-app-boot/lib/index.js boot() sets ctx.baseUrl = pathToFileURL(dirname(absoluteConfigPath)).href + "/" (L1170); the root Include (the config-file tree, L116-147) sets this.ctx.baseUrl = new URL(".", pathToFileURL(this.filename)).href (L138). For the web profile the config is /Users/lvyx/.dsh/profiles/web/cordis.yml (dsh/lib/profile-boot-DG5t9aNs.js L240, L247), so bare names resolve from /Users/lvyx/.dsh/profiles/web/.
- Node parent-walk then sees: (1) /Users/lvyx/.dsh/profiles/web/node_modules (pnpm-managed, for out-of-tree plugins), (2) the maintained flat fallback $DSH_HOME/profiles/node_modules - healProfilesModuleFallback (dsh-app-boot L409-438) symlinks every package in the dsh app dependency closure there; verified live: /Users/lvyx/.dsh/profiles/node_modules/@deepseek-ai/dsh-client-ui-layout -> C/@deepseek-ai/dsh-client-ui-layout (252 links total). In-box packages therefore resolve from ANY profile. Verified: createRequire("/Users/lvyx/.dsh/profiles/web/package.json").resolve("@deepseek-ai/dsh-client-ui-layout/package.json") -> the checkout path.
- dsh plugin (dsh/lib/bin.js L96-105 -> dsh/lib/plugin-9h8shc4d.js): runPlugin initializes the profile if needed (initProfile, app-boot L353-368: package.json with dependencies: {} + dsh.profile.bundles, empty cordis.patch.yml, pnpm-workspace.yaml), then **forwards argv to pnpm with cwd = the profile directory** (spawnSync("pnpm", args, { cwd: dir }), L108); relative path specs are anchored to the invoking cwd (L90-94). After a successful pnpm run, reconcilePlugins (L46-78) appends a dependency to dsh.profile.bundles **only if it declares dsh.bundle.patch** (exportsPatch, L25-33); a bundle-less dependency (a plain dsh.client package) is installed but warns "installed as a plain dependency, not a profile layer" (L57). NO config row is auto-written for plain packages - you add the loader row yourself (see sec 4).
- Where rows come from: the tree is composed purely from patch layers over the empty root cordis.yml: bundle patches in dsh.profile.bundles order (dsh-base, then dsh-web-app), then the profile cordis.patch.yml, then $DSH_HOME/cordis.patch.yml (absent here), then --patch overlays (profile-boot L147-198). dsh-web-app/cordis.patch.yml is the live "browser roster": a big insert list of { id, name: "@deepseek-ai/dsh-client-..." } rows - the header comment reads: "dsh.client rows are the browser roster the modules node half scans into window.__DSH_BOOT__; the modules row is simultaneously a host row." (row "- id: modules / name: @deepseek-ai/dsh-client-modules"; the hmr row is disabled there with a TODO).

## 4. Exact mount procedure for @deepseek-ai/dsh-board-ui (at /Users/lvyx/workspaces/projects/dsh/board_ui)

**Step 1 - package.** Create board_ui/package.json:
```json
{
  "name": "@deepseek-ai/dsh-board-ui",
  "version": "0.1.0-rc.6",
  "type": "module",
  "main": "lib/index.js",
  "exports": {
    ".": { "default": "./lib/index.js" },
    "./client": { "default": "./lib/client.js" },
    "./package.json": "./package.json"
  },
  "dsh": { "client": { "platform": "web" } }
}
```
- board_ui/lib/index.js - required node half (the loader imports it and starts a fiber; processOne needs entry.fiber):
```js
// Host loader entry for the browser-only board UI plugin; provides no host-side behavior.
export function apply() {}
```
- board_ui/lib/client.js - the browser bundle, factory-registered exactly like the shipped bundles (see dsh-client-modules/lib/client.js or dsh-client-ui-layout/lib/client.js). Minimal form:
```js
window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-board-ui",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const inject = [];   // client-side service edges; require() only seed words
    function apply(ctx) { /* your UI code; ctx.modules / ctx.reflect.provide available */ }
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
```
(If you build with tsdown, keep the client bundle externals to seed words / graph-row ids only - cross-plugin value imports are a build error; the factory require can only resolve seed words, shell-own modules, and registered graph rows, client.js L121-131.)

**Step 2 - install so the loader can resolve it** (resolution anchor = profile dir; see sec 3). Either:
- dsh plugin --profile web add /Users/lvyx/workspaces/projects/dsh/board_ui  (pnpm add, cwd = profile dir; absolute paths pass through anchorPathSpec untouched), or
- pnpm --dir /Users/lvyx/.dsh/profiles/web add file:/Users/lvyx/workspaces/projects/dsh/board_ui  (pnpm 11 is on PATH).
Either creates /Users/lvyx/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-board-ui (symlink/copy). Expected warning: "declares no dsh.bundle - installed as a plain dependency, not a profile layer" - that is fine and intended.

**Step 3 - add the loader row.** Edit /Users/lvyx/.dsh/profiles/web/cordis.patch.yml (currently []) to:
```yaml
# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; !!js expressions allowed).
- insert:
    - id: board-ui
      name: '@deepseek-ai/dsh-board-ui'
```
(insert without id appends rows to the root list - applyEntryPatches, dsh-app-boot L70-83; a bare "- name: ..." top-level row would be parsed as a patch, need an id, and be skipped with a warning, L87-89.)

**Step 4 - restart the server.** The reliable path: kill PID 6190 (node .../node_modules/.bin/dsh web, respawned by npm exec @deepseek-ai/dsh web, PID 5923) and re-run the same command; cordis.yml is rewritten to the empty root on each boot (profile-boot L143), so the row must live in the patch layer you just edited (it does). On boot: the row fiber starts (node half), internal/plugin fires, client-modules resolves the package (fresh name - no pkgMeta cache), the graph gains the row, and the index tap serves it. Restart is required because package metadata is cached per name for the process lifetime (dsh-client-modules L22-26) and client-hmr only watches rows already in the graph.
**Live-reload caveats:** (a) *bundle content* hot-reload exists - dsh-client-hmr polls each graph row client.js every 500 ms (lib/index.js) and calls clientModules.rebuilt(id); the browser half consumes the /plugins/events SSE channel. It only helps once the row is mounted and only if something rebuilds board_ui/lib/client.js (the harness repo pnpm run dev:web tsdown watcher). (b) *New rows*: the launcher force-mounts cordis-plugin-hmr and hot-reapplies cordis.patch.yml (profile-boot L256-273 -> dsh-app-boot watchUserPatches L760-780), which would create the entry and could drive the dirty-set scan - but dsh-web-app disables the base hmr row with a "TODO: Re-enable shared HMR for Web" comment, so treat restart as the required step.

**Pitfalls checklist:** use the FULL package name in the URL/row (@deepseek-ai/dsh-board-ui - /plugins/dsh-board-ui/client.js 404s); dsh.client.platform must be exactly "web"; declaring dsh.client without exports["./client"] fails boot loudly; include "./package.json" in exports or require.resolve("<pkg>/package.json") fails under the exports map; the node half must start (no-op apply); do NOT also declare dsh.bundle unless you want it auto-added to dsh.profile.bundles and its patch layer applied as a bundle.

## 5. Live server verification (no files modified, server untouched)

- curl -s http://127.0.0.1:3080/ -> 200, and the boot script is injected server-side as the first element of <head>:
```html
<head><script>window.__DSH_BOOT__ = {"rev":"dcccb8324e44","entries":[{"id":"@deepseek-ai/dsh-typert-registry","url":"/plugins/@deepseek-ai/dsh-typert-registry/client.js?rev=f41d56e0b747","rev":"f41d56e0b747","inject":[],"immediately":true}, ... {"id":"@deepseek-ai/dsh-client-ui-layout","url":"/plugins/@deepseek-ai/dsh-client-ui-layout/client.js?rev=5ab8c01f4dbb","rev":"5ab8c01f4dbb","inject":["@deepseek-ai/dsh-client-runtime","@deepseek-ai/dsh-client-ui-theme"]}, ...]}</script>
```
39 entries; ids are full package names; each row carries url+rev (bundle sha1), optional inject/immediately; graph rev is a sha1 of the entries JSON. The static dist file itself contains no boot script - it is added per request by the index tap.
- curl -sI http://127.0.0.1:3080/plugins/@deepseek-ai/dsh-client-ui-layout/client.js -> HTTP/1.1 200 OK, content-type: text/javascript; charset=utf-8, cache-control: no-cache; body starts window.__ModuleLoader__.load({ id: "@deepseek-ai/dsh-client-ui-layout", factory: (require) => { ... } }).
- curl -s http://127.0.0.1:3080/plugins/ui-layout/client.js -> **404** (bare id); curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/plugins/does-not-exist/client.js -> 404; .../plugins/@deepseek-ai/dsh-client-ui-layout/client.js.map -> 404 (no map file shipped in this install). The task sample URL used the wrong (non-scoped) id; the scoped form is the correct one.
- Process: node /Users/lvyx/.npm/_npx/1e7f6d9597241db0/node_modules/.bin/dsh web (PID 6190) listening on 127.0.0.1:3080; profile dir has NO own node_modules (empty deps) - resolution rides the flat fallback symlinks, confirmed by realpath.