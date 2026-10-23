# 打包与发布

本仓库追踪预编译的 `lib/`。缺少上游 TypeScript 工程时，只维护分发、文档和安装兼容声明，不能在这里重建原始客户端。不要把个人存储、凭据、日志或宿主依赖提交到仓库。

## 准备与打包

在仓库根目录执行（需要 npm 和网络）：

```sh
npm install --omit=dev --ignore-scripts --package-lock=false
mkdir -p artifacts
npm pack --ignore-scripts --pack-destination artifacts
cp artifacts/dsh-personal-goals-0.2.3-dsh.0.2.1.tgz artifacts/dsh-goals.tgz
(cd artifacts && shasum -a 256 dsh-goals.tgz dsh-personal-goals-0.2.3-dsh.0.2.1.tgz > SHA256SUMS.txt)
```

Zod 是打包依赖，`npm pack` 会将它放入 tgz。宿主 peer 依赖使用 alpha.1 / alpha.2 / rc.2 的明确版本范围，交由 DSH 提供。后续发版应同步修改 `package.json` 版本、版本记录和本页命令中的文件名。

## 验证与发布

分别在官方 DSH 三个版本的独立测试环境中安装最终 tgz，检查启动、Goals 读写、Ideas 完成回写及重复同步。测试使用单独的 DSH_HOME 和 Ideas dataDir，防止接触个人数据。兼容检查必须通过，不能依赖版本豁免。

确认变更已提交并推送 main 后，用官方 GitHub CLI 发布：

```sh
gh release create v0.2.3-dsh.0.2.1 artifacts/dsh-goals.tgz artifacts/dsh-personal-goals-0.2.3-dsh.0.2.1.tgz artifacts/SHA256SUMS.txt --repo dawn0713/dsh-goals --target main --title "Goals 0.2.3 · DSH rc.2" --notes-file RELEASE_NOTES.md --latest
```

固定下载链接依赖 latest Release 中名为 `dsh-goals.tgz` 的资产。发布后下载资产，核对 SHA256SUMS.txt。
