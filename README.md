# dsh-goals：让长期目标和持续追踪都在一个地方

**中文** | [English](README.en.md)

[![Release](https://img.shields.io/github/v/release/dawn0713/dsh-goals?label=release)](https://github.com/dawn0713/dsh-goals/releases)
[![DSH](https://img.shields.io/badge/DSH-0.2.1--rc.2-4b6bfb)](https://github.com/deepseek-ai/deepseek-harness)

Goals 是 DeepSeek Harness（DSH）的个人目标插件。它把两类长期事情放在同一个地方：

- **目标**：需要你一步步推进的事，例如 8 周健身、学习一门语言、完成一个项目。
- **追踪**：需要持续观察外部变化的事，例如演唱会开票、机票价格、股价阈值。

它不要求你先选功能、填参数。你只要用自然语言说想推进或盯着什么，智能体会先问一个开放问题，再顺着你的回答继续。

![Goals 页面：红框是第一步的点击位置](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-1.png)

## 场景一：目标——8 周健身计划

下面按真实界面走一遍。每张图里的红框就是这一步要点的位置。

**第 1 步：点「健康与体能」**

![第 1 步：点击健康与体能](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-1.png)

**第 2 步：回答智能体的问题**

智能体不会一次抛出“现状、时间、约束、期限”整套问卷，而是先问一个问题。如果它发现你已经有一份类似计划，会先问这次和原计划是什么关系，避免重复创建。

![第 2 步：回答一个问题](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-2.png)

选择「就在原计划上继续，本周重新开始 W1」并提交。没有旧目标时，这一步会变成“你想推进什么”的开放问题；后续问题根据你的回答生成。

**第 3 步：回到 Goals 查看目标和步骤**

![第 3 步：选中目标查看步骤](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-3.png)

在左侧选中目标（红框 3），右侧会显示完成标准、每一步的状态，以及暂停、恢复、完成、归档和删除操作（红框 4）。上面这个例子是 8 周减脂起步计划：每周 2–3 小时、居家训练，步骤从基线测量、快走适应，到力量训练和最后复盘。

- 步骤可以逐条完成，也可以继续追加。
- 创建计划时会在原会话安排每周回顾。
- 完成、归档和删除都需要你在页面上明确确认。
- 计划中途想改，直接在对话里说“把第 2 步改成……”，智能体做局部修改。

## 场景二：追踪——演出、开票和价格

追踪不是定时提醒的别名。它会保存监控条件、检查频率、优先来源和每次观察的结果。创建过程同样是“先问一个开放问题，再根据回答补问”。

### 邓紫棋下一轮巡演

**第 1 步：点「条件追踪」**

![第 1 步：点击条件追踪](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-1.png)

**第 2 步：告诉智能体你想盯什么**

智能体只问一个开放问题：“你想盯着的是什么？什么变化发生时希望你通知你？” 不会先问频率和截止时间。

![第 2 步：回答想盯什么](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-2.png)

输入“邓紫棋下一轮巡演官宣和开票信息；每周一次；截止 2027-12-31；优先来源大麦、纷玩岛、猫眼、微博”，然后提交。

**第 3 步：回到 Goals 查看追踪结果**

![第 3 步：选中追踪查看条件和历史](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-3.png)

在「进行中的追踪」里选中它（红框 3），右侧显示监控条件、检查频率、优先来源、最近观察和观察历史（红框 4）。这条追踪：

- 关注下一轮巡演官宣、城市/场次和开票信息；
- 每周检查一次，截止到 2027-12-31；
- 创建后立即完成首次检查，不必等一周；
- 首次检查发现上一轮巡演已收官、下一轮尚未官宣，记录为“未命中”，并把大麦搜索页等来源抓取失败的情况写进观察历史。

### 中国移动 A 股股价

![中国移动股价追踪的点击步骤](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-stock-steps.png)

同样从「条件追踪」进入，这次回答数值条件：

- 监控对象：中国移动 A 股（600941）；
- 条件：收盘价低于 100 元；
- 频率：每天检查一次；
- 观察值：99.14 CNY，已低于阈值，因此进入“已触发”。

命中后默认暂停定期检查，避免重复打扰。你可以在详情里选择「继续观望」（带冷却后恢复检查）、「已处理」或「结束监控」。每次检查的摘要、观察值、来源和失败原因都保存在观察历史中，方便回看走势。

## 它是怎么问的

创建流程是自适应的：

1. 先问一个开放问题：你想推进或盯着什么。
2. 根据你的回答决定下一个问题，不固定问“现状、时间、约束、期限”。
3. 追踪类先确认对象和“什么变化才算数”，再问频率、截止时间和来源。
4. 目标类只补问仍然缺少的信息，然后才拆步骤。
5. 不在第一句就要求你选择“目标还是追踪”；等信息足够后再判断并确认。

所以你可以直接说“帮我盯一下北京到东京的机票，低于 3000 元告诉我”，也可以只说“我想做点事”，让智能体从第一个问题开始。

## 安装

支持 **DSH 0.2.1-rc.2 Web 版**，安装包同时保留 0.2.1-alpha.1 / alpha.2 的兼容声明。需要 Node.js `^22.19.0` 或 `>=24.0.0`，对话规划需要配置可用模型。

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

源码版宿主可以用 `pnpm dsh` 替代 `dsh`。包名保留为 `dsh-personal-goals`，升级后重启，原有目标数据继续使用。Release 包内置 Zod，DSH 运行时依赖由宿主提供。

## 与 Ideas 联动

配套插件：[dsh-ideas](https://github.com/dawn0713/dsh-ideas)。

![Ideas 根据目标生成建议](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/ideas-link.png)

```text
Goals 未完成步骤 → Ideas 建议卡片 → 聊天执行与完成核验
       ↑                                  │
       └──────── 对应步骤标记为已完成 ──────┘
```

Ideas 可以读取 Goals 的进展，把未完成步骤变成具体行动建议。用户确认完成后，Ideas 只回写关联的单个步骤；不会替用户完成整个目标，也不会批量回写历史完成记录。同步失败会保留完成记录、显示原因并支持重试。

安装 Ideas：

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz"
```

两个插件分别安装。Goals 可以独立使用；Ideas 只有关联 Goals 步骤的任务才会回写。

## 数据与模型

- 目标、步骤、建议和观察保存在宿主的 `personal_goals` 存储域：`$DSH_HOME/storages/personal_goals.json`，默认位于 `~/.dsh/storages/`。
- 停用或卸载插件不会主动删除存储域文件；备份和迁移时请保留这个文件。
- 页面约每 5 秒刷新。周检与条件检查投递回原会话，依赖 DSH 排程服务持续运行。
- 规划、修订及条件观察使用你配置的模型；相关目标、步骤和观察资料会作为上下文提供给该服务。
- 整体完成、归档与删除在用户页面确认。

## 插件接口

宿主插件注入 `personalGoals` 后，使用正式服务访问数据：

| 方法 | 用途 |
| --- | --- |
| `overview()` | 目标摘要、未完成步骤 `openTasks`、已完成步骤 `completedTasks` |
| `list()` | 目标列表 |
| `get({ goalId })` | 读取单个目标和步骤 |
| `updateTask({ taskId, status: "done" })` | 将对应步骤标记完成 |

模型工具包含 `personal_goals_read`、`personal_goal_propose`、`personal_goal_create`、`personal_goal_update`、`personal_monitor_create`、`personal_monitor_record`、`personal_idea_propose`、`personal_task_add`、`personal_task_update`。

## 限制

- 追踪只在计划中的会话轮次里观察，不提供两轮之间的后台轮询；DSH 未运行时不会检查。
- 不提供外部推送，提醒只回到原会话。
- 不代替用户购买、预订、付款或执行任何不可逆操作。
- 部分票务和行情页面是 JS 渲染或需要登录，插件会记录抓取失败并尽量用搜索侧证；命中时仍建议到官方渠道核对。

## 仓库与维护

本仓库提供 Goals **编译分发产物**及安装封装；运行时代码来自上游 DSH Goals 实现。本次发布不包含原上游 TypeScript 工程。

| 路径 | 作用 |
| --- | --- |
| `lib/index.js` | 插件入口 |
| `lib/service/` | 目标、步骤、存储与排程服务，以及类型声明 |
| `lib/tool/` | 模型工具及类型声明 |
| `lib/client.js` | 预编译 Web 界面 |
| `cordis.patch.yml` | DSH bundle 配置 |
| `docs/images/` | README 使用示例截图 |

[兼容性验证](docs/VERIFICATION.md) · [打包与发布](docs/RELEASING.md) · [版本记录](CHANGELOG.md)

## License

[MIT](LICENSE)。随包分发的 Zod 保留自身许可文件。