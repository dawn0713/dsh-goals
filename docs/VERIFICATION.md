# 验证记录

验证日期：2026-10-22。测试包为本次公开发布的 Goals tgz，以及 dsh-ideas 已发布的 0.4.9-dsh.0.2.1 tgz。

| 检查 | DSH 0.2.1-alpha.1 | DSH 0.2.1-alpha.2 |
| --- | --- | --- |
| 官方 CLI 安装实际 tgz（离线） | 通过 | 通过 |
| 官方兼容检查，不使用版本豁免 | 通过 | 通过 |
| Web profile 配置合成及服务启动 | 通过 | 通过 |
| 创建目标、步骤并读取状态 | 通过 | 通过 |
| Ideas 完成后回写 Goals 关联步骤 | 通过 | 通过 |
| 其他步骤、整个目标状态保持不变 | 通过 | 通过 |
| 重复读取不重复写入完成状态 | 通过 | 通过 |
| Ideas 安装包包含卡片高度和同步状态界面 | 通过 | 通过 |

两个官方宿主版本均使用独立的 DSH_HOME、Ideas dataDir 和示例数据。测试关闭自动推荐及开发热更新扫描，没有调用付费模型或读取个人目标。结果见 [alpha.1](compatibility/alpha1.json)、[alpha.2](compatibility/alpha2.json)。

另外逐字节比对了 `lib/` 下 13 个运行时及类型文件，与用户提供的 Goals 0.2.0 功能包完全一致。校验清单见 [runtime-integrity.json](compatibility/runtime-integrity.json)。本次不修改目标功能与存储格式。

测试主机为 macOS x86_64、Node.js 26.1.0。检查范围为安装、配置、服务及 Ideas 完成联动；没有额外验证 Desktop profile、其他系统或真实模型驱动的长期排程。
