
## 决策记录

### 2026-06-17：工作区与代码仓库分离约定

- **背景**：项目从 `D:\桌面\gitlab\web_mall` 迁移至 Codex workspace `project-0002-web-mall` 后，
  发现原路径已有完整的 `.git` 仓库、项目配置和 `src/` 源码，且其他 IDE 也在操作该路径。
- **决策**：采用"工作区仅存放项目文档，代码操作全部在原路径执行"的方式。
  - `D:\codex_workspace\projects\project-0002-web-mall` — 只存放项目文档
    （00~08 系列文档、deliverables、assets、scripts、references），不做代码编辑。
  - `D:\桌面\gitlab\web_mall` — 真正的项目根目录，所有代码编写、路由配置、
    组件开发、依赖管理等操作均在此路径下进行。
- **原因**：避免两份代码拷贝带来的同步问题；多个 IDE 共享同一份源码；
  保持 workspace 整洁，仅承载 Codex 相关的项目元数据。
- **后续操作要点**：
  - dev server 始终从 `D:\桌面\gitlab\web_mall` 启动
  - 文件读写、git 操作、npm 命令均针对 `D:\桌面\gitlab\web_mall`
  - 工作区目录仅维护项目文档
