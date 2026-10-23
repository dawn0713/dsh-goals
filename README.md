# dsh-goals：让长期目标持续推进

**中文** | [English](README.en.md)

**在 DeepSeek Harness（DSH）里制定计划、管理步骤、定期回顾，并与 Ideas 联动推进。**

Goals 把跨会话目标保存在一个地方。你可以从健康、关系、财务、事业、兴趣、效率等方向开始，通过对话明确需求与完成标准，再拆成有序步骤；以后换一个会话，也能继续查看和更新。

- **引导式规划**：先了解现状、时间和约束，再生成目标与 3–7 个步骤，支持局部修改。
- **进度与回顾**：区分待办、进行中、受阻和完成，支持暂停、恢复、归档及每周检查。
- **条件追踪**：记录价格阈值、公告等条件，按每 6/12 小时、每天或每周安排会话检查，保留观察历史。
- **建议收件箱**：目标建议先由用户采纳或忽略。
- **Ideas 联动**：未完成步骤成为行动建议，实际完成后回写对应步骤，更新目标进度。

## 安装

支持 **DSH 0.2.1-alpha.1 / 0.2.1-alpha.2 / 0.2.1-rc.2 Web 版**，三个版本使用同一个 tgz。需要 Node.js `^22.19.0` 或 `>=24.0.0`，对话规划还需要配置可用模型。

1. 打开 DSH 左侧 **插件 → 添加插件**。
2. 粘贴并安装：

```text
https://github.com/dawn0713/dsh-goals/releases/latest/download/dsh-goals.tgz
```

3. 启用插件，重启 `dsh web` 并刷新页面，左侧会出现 **个人目标**。

也可以通过命令行安装：

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-goals/releases/latest/download/dsh-goals.tgz"
```

下载后本地安装，无需解压、编译或另装依赖：

```sh
dsh plugin --profile web add "/path/to/dsh-goals.tgz"
```

源码版宿主可以用 `pnpm dsh` 替代 `dsh`。包名保留为 `dsh-personal-goals`，用于识别已安装插件；升级后重启，原有目标数据继续使用。Release 包内置 Zod，DSH 运行时依赖由宿主提供。

## 怎么使用

1. 打开“个人目标”，在“制定新计划”中选择方向。
2. 回答规划问题，确认目标、完成标准与步骤；需要调整时，直接在对话中指定修改。
3. 在目标详情中管理步骤、查看进度，并通过原规划会话继续推进或每周回顾。
4. 整体完成、归档和删除由你在页面明确确认。

要追踪外部条件，在方向列表选择“条件追踪”，描述条件、频率与截止时间。创建后进行首次检查，之后通过 DSH 排程投递到原会话；命中后默认暂停，可选择“继续观望”。检查依赖 DSH 运行、模型与可用的信息来源，只在排程会话轮次里观察，不提供两轮之间的独立轮询。

## 与 Ideas 的双向联动

配套插件：[dsh-ideas](https://github.com/dawn0713/dsh-ideas)。

```text
Goals 未完成步骤 → Ideas 建议卡片 → 聊天执行与完成核验
       ↑                                  │
       └──────── 对应步骤标记为已完成 ──────┘
```

Ideas 完成关联任务后，通过 Goals 的 `personalGoals` 服务读取目标并更新对应步骤。步骤身份使用保存的目标、任务编号；同步失败时，Ideas 保留完成记录、显示原因并支持重试。完成一个步骤会更新进度，整体目标仍由用户在 Goals 页面确认完成。

安装 Ideas：

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz"
```

两个插件分别安装。Goals 可以独立使用；Ideas 只有关联 Goals 步骤的任务才会回写。旧版历史完成记录不会自动批量同步。

## 数据与模型

- 目标、步骤、建议和观察保存在宿主的 `personal_goals` 存储域：`$DSH_HOME/storages/personal_goals.json`，默认位于 `~/.dsh/storages/`。
- 停用或卸载插件不会主动删除存储域文件；备份和迁移时请保留这个文件。
- 页面约每 5 秒刷新。周检与条件检查投递回原会话，依赖 DSH 排程服务持续运行。
- 规划、修订及条件观察使用你配置的模型；相关目标、步骤和观察资料会作为上下文提供给该服务。
- 模型工具可创建、修订计划和更新步骤，整体完成、归档与删除在用户页面确认。

## 插件接口

宿主插件注入 `personalGoals` 后，使用正式服务访问数据：

| 方法 | 用途 |
| --- | --- |
| `overview()` | 目标摘要、未完成步骤 `openTasks`、已完成步骤 `completedTasks` |
| `list()` | 目标列表 |
| `get({ goalId })` | 读取单个目标和步骤 |
| `updateTask({ taskId, status: "done" })` | 将对应步骤标记完成 |

模型工具包含 `personal_goals_read`、`personal_goal_propose`、`personal_goal_create`、`personal_goal_update`、`personal_monitor_create`、`personal_monitor_record`、`personal_idea_propose`、`personal_task_add`、`personal_task_update`。

## 仓库与维护

本仓库提供用户提交的 Goals 0.2.0 **编译分发产物**及 alpha / rc.2 安装封装；运行时代码保持一致。本次发布不包含原上游 TypeScript 工程，不提供在此仓库重建上游客户端的命令。

| 路径 | 作用 |
| --- | --- |
| `lib/index.js` | 插件入口 |
| `lib/service/` | 目标、步骤、存储与排程服务，以及类型声明 |
| `lib/tool/` | 模型工具及类型声明 |
| `lib/client.js` | 预编译 Web 界面 |
| `cordis.patch.yml` | DSH bundle 配置 |

[兼容性验证](docs/VERIFICATION.md) · [打包与发布](docs/RELEASING.md) · [版本记录](CHANGELOG.md)

## License

[MIT](LICENSE)。随包分发的 Zod 保留自身许可文件。
