# 背景轻音乐播放器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在博客右下角加一个默认关闭、点击开启、带动画、跨页续播的轻音乐播放器，用温柔提示邀请用户主动开启。

**Architecture:** 一个自包含组件 `MusicPlayer.astro`（悬浮按钮 + 提示气泡 + `<audio>` + 作用域 CSS 动画 + 客户端脚本），通过 `transition:persist` 在 Astro 视图过渡下跨页保活、音乐不断。`BaseLayout` 引入 `<ClientRouter />` 启用视图过渡并挂载该组件。音频文件先占位、缺失时优雅降级。

**Tech Stack:** Astro 5（`astro:transitions` 的 `ClientRouter` + `transition:persist`）、HTML5 `<audio>`、原生 CSS 动画、`localStorage`、零额外依赖。

## Global Constraints

- 设计文档：`docs/superpowers/specs/2026-06-18-background-music-design.md`，每个任务的要求都隐含本节。
- 默认**不播放**、不自动出声；用户点击后才出声（浏览器规则）。
- 音频：`<audio loop preload="none" src="/music/ambient.mp3">`，脚本里设 `audio.volume = 0.35`。
- 配色用品牌暖色**硬编码 hex**（`#b5542f` 锈橙、`#faf5ec` 奶油、`#fffdf8` 卡片、`#e6dcc8` 边、`#4a4036` 文字、`#2b2521` 深底、`#b09a78` 浅辅助），**不随深色模式翻转**。
- `localStorage` 键：`mp-on`（"1"/"0"）、`mp-hint-dismissed`（"1"）。
- 尊重 `prefers-reduced-motion: reduce`：关闭动画。
- 文件缺失 / `play()` 失败时不报错，提示「轻音乐即将上线」。
- 纯交互 UI、无可隔离的纯逻辑，**不强加单测**；验证方式为 `astro check` + `npm run build` + 产物 grep + 手动确认（与站点既有组件一致）。
- 所有命令在项目根 `/Users/jerrypop/Documents/JR/MyBlog` 运行。改动直接落在 `main`。

---

### Task 1: MusicPlayer 组件

**Files:**
- Create: `src/components/MusicPlayer.astro`
- Create: `public/music/.gitkeep`

**Interfaces:**
- Consumes: 无（自包含；用到全局 CSS 变量 `--font-serif`，已存在于 `src/styles/global.css`）。
- Produces: 默认导出的 Astro 组件 `MusicPlayer`，渲染根节点 `<div id="music-player" transition:persist="music-player">`；供 Task 2 在 `BaseLayout` 中以 `<MusicPlayer />` 挂载。

- [ ] **Step 1: 创建占位音频目录**

创建空文件 `public/music/.gitkeep`（内容留空），让目录进入仓库，作者之后把 `ambient.mp3` 放进 `public/music/` 即可。

- [ ] **Step 2: 创建 `src/components/MusicPlayer.astro`**

```astro
---
// 背景轻音乐播放器：默认关闭，点击开启，跨视图过渡保活。
---

<div class="music-player" id="music-player" transition:persist="music-player">
  <div class="mp-hint" id="mp-hint" hidden>
    要不要来点轻音乐，放松一下
    <button class="mp-x" id="mp-x" type="button" aria-label="关闭提示">
      <span aria-hidden="true">×</span>
    </button>
  </div>
  <button class="mp-btn idle" id="mp-btn" type="button" aria-label="播放轻音乐">
    <svg class="mp-note" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor">
      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
    </svg>
    <span class="mp-bars" aria-hidden="true"><i></i><i></i><i></i></span>
  </button>
  <div class="mp-toast" id="mp-toast" hidden>轻音乐即将上线</div>
  <audio id="mp-audio" loop preload="none" src="/music/ambient.mp3"></audio>
</div>

<style>
  .music-player {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 50;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    font-family: var(--font-serif);
  }
  .mp-hint {
    position: relative;
    background: #fffdf8;
    border: 1px solid #e6dcc8;
    border-radius: 12px;
    padding: 9px 30px 9px 12px;
    max-width: 190px;
    font-size: 13px;
    line-height: 1.45;
    color: #4a4036;
    box-shadow: 0 6px 18px rgba(58, 50, 42, 0.1);
    animation: mp-bubble 0.5s ease-out both;
  }
  .mp-hint[hidden] { display: none; }
  .mp-hint::after {
    content: '';
    position: absolute;
    right: -5px;
    bottom: 16px;
    width: 10px;
    height: 10px;
    background: #fffdf8;
    border-right: 1px solid #e6dcc8;
    border-bottom: 1px solid #e6dcc8;
    transform: rotate(-45deg);
  }
  .mp-x {
    position: absolute;
    top: 4px;
    right: 6px;
    background: none;
    border: none;
    color: #b09a78;
    cursor: pointer;
    font-size: 15px;
    line-height: 1;
    padding: 2px;
  }
  .mp-btn {
    position: relative;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: none;
    background: #b5542f;
    color: #faf5ec;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(181, 84, 47, 0.35);
    overflow: hidden;
  }
  .mp-btn.idle { animation: mp-breathe 3s ease-in-out infinite; }
  .mp-bars { display: none; gap: 3px; align-items: center; height: 24px; }
  .mp-btn.playing .mp-bars { display: flex; }
  .mp-btn.playing .mp-note { display: none; }
  .mp-bars i {
    width: 3px;
    height: 6px;
    background: #faf5ec;
    border-radius: 2px;
    animation: mp-wave 1s ease-in-out infinite;
  }
  .mp-bars i:nth-child(2) { animation-delay: 0.18s; }
  .mp-bars i:nth-child(3) { animation-delay: 0.36s; }
  .mp-rip {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 58px;
    height: 58px;
    margin: -29px 0 0 -29px;
    border-radius: 50%;
    background: #faf5ec;
    opacity: 0.4;
    animation: mp-ripple 0.6s ease-out forwards;
    pointer-events: none;
  }
  .mp-toast {
    position: absolute;
    right: 0;
    bottom: 70px;
    background: #2b2521;
    color: #e8e0d4;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 8px;
    white-space: nowrap;
    animation: mp-bubble 0.3s ease-out both;
  }
  .mp-toast[hidden] { display: none; }
  @keyframes mp-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
  @keyframes mp-wave { 0%, 100% { height: 6px; } 50% { height: 18px; } }
  @keyframes mp-bubble { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes mp-ripple { 0% { transform: scale(0); opacity: 0.45; } 100% { transform: scale(2.6); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .mp-btn.idle, .mp-bars i, .mp-hint, .mp-toast { animation: none; }
    .mp-rip { display: none; }
  }
  @media (max-width: 640px) {
    .music-player { right: 14px; bottom: 14px; }
    .mp-hint { max-width: 150px; font-size: 12px; }
  }
</style>

<script>
  function initMusicPlayer() {
    const root = document.getElementById('music-player');
    if (!root || root.dataset.mpInit === '1') return;
    root.dataset.mpInit = '1';

    const btn = document.getElementById('mp-btn');
    const audio = document.getElementById('mp-audio') as HTMLAudioElement | null;
    const hint = document.getElementById('mp-hint');
    const closeBtn = document.getElementById('mp-x');
    const toast = document.getElementById('mp-toast');
    if (!btn || !audio) return;

    audio.volume = 0.35;
    const ON = 'mp-on';
    const HINT = 'mp-hint-dismissed';

    const setUI = (playing: boolean) => {
      btn.classList.toggle('playing', playing);
      btn.classList.toggle('idle', !playing);
      btn.setAttribute('aria-label', playing ? '暂停轻音乐' : '播放轻音乐');
    };
    const dismissHint = () => {
      if (hint) hint.hidden = true;
      try { localStorage.setItem(HINT, '1'); } catch {}
    };
    const showToast = (msg: string) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.hidden = false;
      setTimeout(() => { toast.hidden = true; }, 2500);
    };
    const ripple = () => {
      const r = document.createElement('span');
      r.className = 'mp-rip';
      btn.appendChild(r);
      setTimeout(() => r.remove(), 620);
    };

    btn.addEventListener('click', () => {
      ripple();
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            setUI(true);
            try { localStorage.setItem(ON, '1'); } catch {}
          })
          .catch(() => {
            setUI(false);
            showToast('轻音乐即将上线');
          });
        dismissHint();
      } else {
        audio.pause();
        setUI(false);
        try { localStorage.setItem(ON, '0'); } catch {}
      }
    });

    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissHint();
    });

    let dismissed = false;
    try { dismissed = localStorage.getItem(HINT) === '1'; } catch {}
    if (hint && !dismissed) hint.hidden = false;

    let wantOn = false;
    try { wantOn = localStorage.getItem(ON) === '1'; } catch {}
    if (wantOn) {
      audio.play().then(() => setUI(true)).catch(() => setUI(false));
    }
  }

  initMusicPlayer();
  document.addEventListener('astro:page-load', initMusicPlayer);
</script>
```

- [ ] **Step 3: 类型检查（组件单独可编译，含脚本的 TS 类型）**

Run: `npx astro check`
Expected: `0 errors`（`hidden`/`warnings` 可接受）。若报 `Property 'play'/'volume'/'paused' does not exist`，说明 `audio` 少了 `as HTMLAudioElement | null` 断言——按上面代码补上。

- [ ] **Step 4: Commit**

```bash
git add src/components/MusicPlayer.astro public/music/.gitkeep
git commit -m "feat: add background light-music player component"
```

---

### Task 2: 接入 BaseLayout + 视图过渡

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `MusicPlayer`（Task 1）、`ClientRouter`（来自 `astro:transitions`）。
- Produces: 全站每页都挂载播放器，并启用 Astro 视图过渡（站内导航变为软导航，使 `transition:persist` 生效）。

- [ ] **Step 1: 用以下完整内容覆盖 `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import MusicPlayer from '../components/MusicPlayer.astro';
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <BaseHead title={title} description={description} />
    <ClientRouter />
  </head>
  <body>
    <Header />
    <main class="container">
      <slot />
    </main>
    <Footer />
    <MusicPlayer />
  </body>
</html>
```

- [ ] **Step 2: 类型检查 + 生产构建**

Run: `npx astro check`
Expected: `0 errors`。

Run: `npm run build`
Expected: 构建成功，仍生成全部页面。

- [ ] **Step 3: 验证播放器进入产物且全站存在**

Run: `grep -o 'id="music-player"' dist/index.html | head -1`
Expected: 输出 `id="music-player"`。

Run: `test -f dist/index.html && test -f dist/about/index.html && grep -lq 'id="music-player"' dist/index.html dist/about/index.html && echo "player on all pages"`
Expected: `player on all pages`（首页与关于页都挂载了播放器）。

Run: `grep -oq 'transition:persist\|data-astro-transition-persist' dist/index.html && echo "persist attr present" || echo "check persist rendering"`
Expected: 倾向输出 `persist attr present`（Astro 会把 `transition:persist` 渲染为 `data-astro-transition-persist` 属性；若显示后者也正确）。

- [ ] **Step 4: 手动确认（关键，行为/动画无法靠 grep 验证）**

Run: `npm run dev`，打开 `http://localhost:4321/`，逐项确认：
- 右下角出现锈橙圆按钮，待机有轻微「呼吸」动画；旁边出现提示气泡「要不要来点轻音乐，放松一下」。
- 点气泡 `×`：气泡消失；刷新页面后不再出现。
- 点按钮：出现水波纹；因为还没放音频文件，弹出小提示「轻音乐即将上线」，按钮回到待机（这是预期的占位降级行为）。
- 点导航（技术/随笔/关于）在页面间切换：右下角播放器**始终在、不闪烁重建**（视图过渡 + persist 生效）。
- 系统开启「减少动态」后刷新：呼吸/声波/水波纹动画消失，按钮仍可点。
完成后 Ctrl-C 停掉 dev。

> 放入真实 `public/music/ambient.mp3` 后，点击即出声、翻页音乐不断——此前的「即将上线」提示自动消失，无需改代码。

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: mount music player and enable view transitions in BaseLayout"
```

---

### Task 3: 在 DEPLOY.md 记录如何放音乐文件

**Files:**
- Modify: `docs/DEPLOY.md`

**Interfaces:**
- Consumes: 无。
- Produces: 一段面向作者的「背景轻音乐」操作说明。

- [ ] **Step 1: 在 `docs/DEPLOY.md` 末尾追加以下小节**

```markdown
## 背景轻音乐
右下角有个轻音乐播放器，**默认关闭**，用户点击才播放，可随时暂停；翻页不中断。

- 放曲子：把一首**免版税 / CC0** 的轻音乐命名为 `ambient.mp3`，放进 `public/music/`，`commit` + `push` 即自动生效（无需改代码）。来源参考：Pixabay Music、Free Music Archive、Incompetech、YouTube Audio Library。
- 没放文件时：点击按钮会提示「轻音乐即将上线」，不报错。
- 想改提示文案、按钮位置（右下/右上）、音量或动画：编辑 `src/components/MusicPlayer.astro`（音量在脚本里 `audio.volume = 0.35`）。
```

- [ ] **Step 2: Commit**

```bash
git add docs/DEPLOY.md
git commit -m "docs: document how to add the background music track"
```

---

## Spec 覆盖自检

- **§1 目标 / 非目标**：默认不出声、邀请式开启、可暂停、跨页不断、暖色动画 → Task 1+2；未做歌单/进度/音量条（YAGNI）。✅
- **§2 约束**：默认关点击开（脚本逻辑）、视图过渡 persist（Task 2）、版权由作者提供 + 缺失降级（Task 1 catch + Task 3 文档）。✅
- **§3 行为**：默认关、`preload="none"`、音量 0.35、右下角按钮、首次提示气泡 + × + 持久化（`mp-on`/`mp-hint-dismissed`）、点击切换、跨页续播、首屏 `mp-on=1` 尝试续播并静默降级 → Task 1 脚本。✅
- **§4 视觉/动画**：呼吸、气泡淡入上滑带尾巴、点击水波纹、音符↔声波、reduced-motion 降级、品牌色硬编码 → Task 1 `<style>`。✅
- **§5 架构**：`MusicPlayer.astro`（`transition:persist`）+ `BaseLayout` 加 `<ClientRouter />` 与 `<MusicPlayer />` + 资源路径 → Task 1+2。✅
- **§6 占位音频**：缺失/`play()` 失败 → catch、提示「即将上线」、放文件后自动生效 → Task 1 + Task 3。✅
- **§7 无障碍**：按钮 `aria-label` 随状态变、键盘可触发（原生 `<button>`）、气泡 × 有 label、reduced-motion → Task 1。✅
- **§8 验收标准**：逐条对应 Task 2 Step 3-4 的 grep + 手动确认；`build`/`check` 通过。✅

类型一致性：`mp-on` / `mp-hint-dismissed` 两个键、`id="music-player"`/`mp-btn`/`mp-audio`/`mp-hint`/`mp-x`/`mp-toast` 在脚本与标记中一致；`audio` 已断言 `HTMLAudioElement`。无占位符。
