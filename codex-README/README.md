# Digital Editorial Journal

一个基于 React + TypeScript + Vite 的数字化杂志/编辑部项目，支持文章展示、分类筛选、点赞、评论、后台 CMS 管理，以及通过 Supabase 实现实时数据同步。

## 1. 项目概览

- 前台：文章列表、分类/情绪过滤、文章详情、点赞动效、评论区
- 后台：管理员登录、文章增删改、评论审核与删除、审核日志
- 数据层：Supabase（实时订阅）+ 本地存储降级方案
- 路由：`wouter` + Hash 路由（`/#/`）

## 2. 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- shadcn/ui（Radix UI 组件）
- Supabase JS（数据库 + Realtime）
- Framer Motion（动效）
- wouter（路由）

## 3. 功能说明

### 3.1 前台功能

- 首页文章瀑布流展示
- 按 `Category` / `Mood` 过滤文章
- 文章详情页渲染（支持 HTML 或纯文本内容自动分段）
- 点赞（本地乐观更新 + 1 秒防抖后同步数据库）
- 评论发布与删除

### 3.2 后台功能

- 登录页：`/#/admin/login`
- 仪表盘：`/#/admin`
  - 文章搜索、分类筛选
  - 新建/编辑/删除文章
  - 数据库空表时可一键初始化种子数据
- 评论审核：`/#/admin/comments`
  - 删除评论
  - 自动记录 `moderation_logs`

### 3.3 国际化与主题

- 中英文切换（`LanguageContext`）
- 主题上下文存在，但当前默认固定 `light`（`switchable=false`）

## 4. 本地开发

### 4.1 环境要求

- Node.js >= 18
- 推荐包管理器：pnpm

### 4.2 安装依赖

```bash
pnpm install
```

### 4.3 启动开发环境

```bash
pnpm dev
```

默认由 Vite 输出本地开发地址。

### 4.4 构建与预览

```bash
pnpm build
pnpm preview
```

## 5. 数据库（Supabase）初始化

项目根目录提供 SQL 脚本：

- `supabase_schema.sql`：创建 `articles`、`comments` 并启用 Realtime
- `update_schema_moderation.sql`：创建 `moderation_logs`

初始化步骤：

1. 在 Supabase 控制台创建项目
2. 进入 SQL Editor，依次执行上述两个 SQL 文件
3. 启动项目后，进入后台页面；若文章为空可点击 `Initialize DB`

## 6. 路由清单

- `/#/`：首页
- `/#/article/:id`：文章详情
- `/#/admin/login`：后台登录
- `/#/admin`：后台仪表盘
- `/#/admin/editor`：新建文章
- `/#/admin/editor/:id`：编辑文章
- `/#/admin/comments`：评论审核

## 7. 目录结构（核心）

```text
src/
  components/
    article/         # 文章卡片、点赞、评论区
    admin/           # 管理端组件（如图片选择、审核日志）
    layout/          # 顶部导航
    ui/              # 通用 UI 组件
  contexts/
    StoreContext.tsx # 业务状态与 Supabase 同步
    AuthContext.tsx  # 管理员认证状态
    LanguageContext.tsx
    ThemeContext.tsx
  pages/
    Home.tsx
    ArticleDetail.tsx
    admin/
      Login.tsx
      Dashboard.tsx
      Editor.tsx
      Comments.tsx
  lib/
    supabase.ts
    seed.ts
    types.ts
```

## 8. 当前实现中的注意事项（重要）

1. `src/lib/supabase.ts` 当前写死了 Supabase URL 和匿名 key，未使用 `.env`。
2. `AuthContext` 中管理员密码为前端明文校验（`admin0801`），仅适用于演示环境。
3. SQL 策略对 `articles/comments/moderation_logs` 基本为公开读写（Demo 模式），不适合生产环境。
4. 部分中文文案存在编码异常（显示乱码），建议统一为 UTF-8 后修复文本资源。

## 9. 生产化建议

- 将 Supabase 配置改为 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- 后台登录改为 Supabase Auth 或服务端鉴权
- 重新设计 RLS，仅允许管理员写入和删除
- 为关键流程补充测试（文章 CRUD、点赞同步、评论审核）

---

本 README 基于当前仓库代码结构与实现行为编写，可直接作为项目技术说明与交接文档使用。
