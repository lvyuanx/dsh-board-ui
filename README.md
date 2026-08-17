# dsh-board-ui

> DeepSeek Harness Web 界面（http://127.0.0.1:3080）的看板形态 UI 外壳插件

自定义 UI 外壳插件 — 以 `dsh.client` 客户端插件（`@deepseek-ai/dsh-board-ui`）的形式
整体接管 DeepSeek Harness Web 界面的 root 槽位，把界面重构为**看板形态**（参考
Tower）：顶部栏 + 左侧导航 + 中央状态列卡片 + 右侧悬浮会话抽屉。

## 快速开始

前置要求：Node.js ≥ 18、pnpm。

```bash
pnpm install            # 安装依赖（仅 esbuild；如被询问请允许 esbuild 的 build script）
node build.mjs          # 构建 lib/client.js
node scripts/verify.mjs # 冒烟测试（root 注册/槽位声明/layout 服务/主题/字典/CSS/列派生）
```

> 说明：`lib/`（构建产物）刻意提交进仓库 — 插件运行时直接从 `lib/` 消费，clone 后
> 开箱即用，无需先执行构建。

### 安装为 dsh web 客户端插件

```bash
# 1) 将本目录 link 进 dsh web profile（示例路径，按实际环境调整）
ln -s "$PWD" ~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-board-ui

# 2) 在 ~/.dsh/profiles/web/cordis.patch.yml 中写入插件行
#    - 禁用官方 ui-layout（避免槽位冲突）
#    - insert 启用本插件的 @deepseek-ai/dsh-board-ui
```

**首次安装需要重启 dsh web**（新的插件行进入 roster）；之后每次 rebuild + 浏览器
刷新即可看到新 bundle（bundle 按请求重新读取）。

**回退**：删除 `cordis.patch.yml` 中两处 board-ui 行（禁用 ui-layout + insert）即
恢复官方 UI。

## 看板：五状态生命周期

产品是 Multi-Agent 任务编排与执行系统，看板按任务生命周期建模（不再是
Jira 式的「任务池」概念）：

```
待执行 ──开始执行──▶ 进行中 ──全部 Agent 完成──▶ 验收中 ──验收通过──▶ 已完成
                      │  ▲                        │
              需要人工 │  │ 处理完成               │ 验收失败
                      ▼  │                        ▼
                  需要处理 ──────────────────▶ 进行中（重新执行）
```

| 列 | 含义 | 数据来源（运行时投影） |
|---|---|---|
| 待执行 | 已创建、未开始执行（规划会话） | board store `planningIds`；以下任一信号自动移出：等审批/计划审阅（`pendingInteraction`）、对话中出现开始指令或非只读工具调用（`planStartedInConversation`，读取运行时 conversation 节点）、已 spawn 子代理（列表投影，刷新后依然可靠） |
| 进行中 | turn 打开，Agent 正在执行 | `session.running` |
| 需要处理 | Agent 被用户交互阻塞（审批/计划审阅/提问） | `session.pendingInteraction`（`approval`/`plan-review`/`question`，优先于 running，与官方 workspace 呈现一致） |
| 验收中 | 执行完成、等待最终验收 | `session.completed === true`（宿主真实标志：未选中状态下结束）+ 有子 Agent |
| 已完成 | 验收通过 | 其余非空会话 |

- **任务状态与 Agent 状态分离**：卡片上的「子 Agent」统计用标记表达
  `● N 运行中 / ✓ N 已完成 / ○ N 等待 / ✕ N 失败`（绿色只给运行中圆点，已完成为
  中性灰勾，绝不用头像）。
- **失败、暂停不设列**：失败显示为卡片红色提示 `⚠ N 个 Agent 执行失败` +
  重试/查看错误；暂停是卡片操作/徽标（`⏸ 已暂停`，卡仍留在进行中列，真实执行
  `session.cancel()`，队列保留）。
- **颜色语义**：蓝 = 待执行/验收中/主要操作/进度；绿 = 仅运行中/成功/验收通过；
  橙 = 需要处理；灰 = 等待/已完成统计/辅助；红 = 仅失败/异常。
- **列头**：状态名 + 任务数量（徽标计数）+ 状态描述（如「进行中 3 / 2 个 Agent
  正在运行」——数字是任务数，Agent 数走描述）。
- **卡片操作**：每状态只显示一个主操作（开始执行 / 暂停 / 继续执行 / 处理 /
  查看验收结果 / 查看结果），其余进 `⋯` 菜单（重新验收、重新执行、查看执行详情、
  重命名、复制会话、归档…）。
- 验收中 → 已完成：前端映射（见 columns.ts 的 `TODO(acceptance)`）——打开任务
  即完成验收（宿主同时清除 `completed` 提醒位）；「重新验收」给真实会话发一条
  验收指令（`TODO(acceptance)`：等宿主提供真实验收 RPC 后替换）。

## 功能总览（已完成）

- **看板**：待执行 / 进行中 / 需要处理 / 验收中 / 已完成 五状态列
  - 待执行：点 + 新建规划会话（plan）；说「开始执行」或调用非只读工具（非plan）→ 自动流转进状态列
  - 主任务卡片聚合子代理计数（● 运行中 / ✓ 已完成 / ○ 等待 / ✕ 失败）
  - 全部卡片显示所属项目徽标（8 色板按工作区稳定分配）+ 状态色条 + 统计胶囊 +
    状态提示行（等待原因 / 验收提示 / 失败告警 / 验收时间）
  - 拖拽排序 / 拖到「进行中」启动计划；右键菜单（打开/重命名/复制/归档/移出待执行）
  - j/k 键盘导航（含待执行卡片）、Enter 打开、空白处点击收起抽屉
- **抽屉**：悬浮不挤压看板、左缘拖拽调宽（420–1100px）、默认折叠、滑入动画
  - 双 tab：对话 / 活动（待处理横幅 + 后台任务 + 子代理）
- **顶栏**：工作区切换下拉（tower.im 式）、全局搜索（Ctrl+K 命令面板）、主题切换、构建版本标记
- **主题**：亮色优先 + 完整暗色（body[data-ds-dark-theme] 联动官方主题服务）
- **细节**：卡片入场错落动画、reduced-motion 支持、焦点环、对比度修正（AA）、窄窗导航自动收起为 56px rail
- **回退**：删除 cordis.patch.yml 中两处 board-ui 行（禁用 ui-layout + insert）即恢复官方 UI

## 未做 / 有意跳过（含 TODO）

- **真实验收状态**（`TODO(acceptance)`）：宿主暂无 review/acceptance 状态，验收中
  用运行时真实 `completed` 标志做前端映射；「重新验收/重新执行/重试」目前发送
  真实提示词（`TODO(acceptance)` 注释处），等宿主提供验收 RPC 后替换
- **子 Agent 等待/失败粒度**（`TODO(agent-state)`）：官方 subagent catalog 只暴露
  running/inactive（其文档自述「no durable outcome」），等待（○）仅在父会话运行
  中且运行时未标记完成时统计；失败（✕）来自 catalog 诊断行
- 设置页 tower 化：官方设置组件使用哈希类名，纯 CSS 重塑在升级后易碎；建议以后通过重新注册设置槽位的方式做
- 看板密度切换、列折叠（候选，未排期）

## 目录

- `src/client/` — 浏览器端插件源码（React + JSX）
  - `index.tsx` — 入口（apply/inject、layout 服务、主题呈现器、注册、卡片动作面）
  - `frame/BoardFrame.tsx` — 看板外壳（顶栏/导航/看板/抽屉/详情栏/浮层）
  - `board/Board.tsx` + `columns.ts` — 五列看板与状态派生（纯函数，可单测）
  - `palette/Palette.tsx` — Ctrl+K 命令面板
  - `theme/tokens.css` — 设计 tokens（亮/暗）
  - `locale.ts` — zh/en 字典（命名空间 "board"）
- `lib/client.js` — 构建产物（__ModuleLoader__.load 工厂格式，已提交）
- `lib/index.js` — 节点端空壳（loader 需要一个活 fiber）
- `build.mjs` — esbuild 构建（iife + globalName + 手工 footer 返回 exports）
- `scripts/verify.mjs` — 冒烟测试（root 注册/槽位声明/layout 服务/主题/字典/CSS/列派生）
- `docs/评估与重构方案.md` — 评估与方案
- `REPORT_client-plugin-mount.md` — 挂载链路技术报告

## 两个契约

1. **package.json 的 dsh.client** = 模块边（bundle 里 require() 的包，经启动图解析）。
2. **bundle 的 export const inject** = cordis 服务边（apply(ctx) 注入的服务）。

## License

[MIT](./LICENSE) © 2026 lvyuanx
