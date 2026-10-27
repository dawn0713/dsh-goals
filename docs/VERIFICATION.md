# Goals 0.2.6 验证

2026-10-27。修复后的运行时代码与本机已经安装并验证的 0.2.4 修复包一致；版本递增至 0.2.6，以保留远端 0.2.5 文档更新。

alpha.1、alpha.2、rc.2 均验证：九个目标工具成功注册并提供给模型；模拟模型通过真实 Agent 流程调用 personal_goal_create；目标与三个步骤实际写入 JSON 存储；关闭并重建服务后目标仍可读取。

结果：[alpha.1](compatibility/model-tools-alpha1.json)、[alpha.2](compatibility/model-tools-alpha2.json)、[rc.2](compatibility/model-tools-rc2.json)。回归用例见 tests/model-goal-registration.test.mjs，安装开发依赖后执行 npm test。

使用隔离 Context、临时存储与模拟模型，不访问个人目标，不产生模型费用。排程边界使用测试替身，未验证真实模型追问效果或长期监控。

中英文 README 的 Git blob 摘要与发布前远端完全一致；示例图片通过沿用远端基线文件树保留。

最终 tgz 另通过三个版本的官方 CLI 安装、Web 启动、Goals 读写与 Ideas 0.4.11 完成回写验证，未使用版本豁免。记录：[alpha.1](compatibility/install-alpha1.json)、[alpha.2](compatibility/install-alpha2.json)、[rc.2](compatibility/install-rc2.json)。
