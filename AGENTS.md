# Codex Agent 规则

## 禁止操作
- 禁止未经用户确认的 git checkout --、git restore、git reset 等回滚操作
- 禁止未经用户确认的删除文件或数据操作
- 所有破坏性操作必须先告知用户并等待确认

## 提交流程
- 需要合并或提交时，必须按以下步骤：
  1. git add -A
  2. git commit -m "描述改动内容"
  3. git push origin <branch-name>
