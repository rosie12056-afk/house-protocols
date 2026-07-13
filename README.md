# House Protocols

House Protocols 是一组面向持续型 Agent 系统的实验性数据协议。它规定事件、上下文引用、证据、主动任务、记忆重签、Keel 和记忆策略应当如何表达，让不同模型或不同 Runtime 可以交换同一种结构化记录。

它不声称模型有意识，也不判断模型输出的内容天然为真。

> 模型曾经输出过一句话，只能证明“模型说过这句话”，不能独自证明外部事实。检索得准，不等于内容为真。

## 这一版包含什么

- **Event Envelope**：统一事件身份、来源、目标、时间、幂等键与追踪信息。
- **Context Manifest**：记录一次运行引用了哪些上下文，只保存引用和摘要哈希，不复制私人正文。
- **Evidence Bundle**：把主张、来源和证据分开，并区分“检索置信度”和“事实置信度”。
- **Initiative Record**：记录目标、实际动作、产物、结果和证据。仅凭模型说“完成了”不能进入 `completed`。
- **Memory Resignature**：把后来对旧记录的重新理解链接回原始来源和上一层理解，而不覆盖旧记录。
- **Keel Document**：保存 Agent 的身份材料和来源说明。Runtime 只把内容视为数据，不解释其哲学含义。
- **Memory Policy Decision**：表达允许、拒绝、隔离、脱敏或需要确认等决策。

所有协议都在 `schemas/`，跨字段的硬规则在 `src/semantic-rules.mjs`。

## 每个协议解决什么问题

| 协议 | 解决的问题 |
| --- | --- |
| Event Envelope | 事件重试、重复投递和跨组件追踪时仍能识别同一件事 |
| Context Manifest | 能审计“本次用了什么上下文”，又不把聊天正文复制到运行记录 |
| Evidence Bundle | 防止把模型输出、检索命中或摘要误当成已经证实的外部事实 |
| Initiative Record | 防止 Agent 用一句“做完了”跳过真实动作、产物和结果 |
| Memory Resignature | 保留“当时怎么想”和“后来怎么看”的层次与时间线 |
| Keel Document | 让身份材料有稳定格式，同时把真实实例内容留在实例侧 |
| Memory Policy Decision | 让记忆读写、晋升、隔离与确认由可审计决策表达 |

## 五分钟运行示例

```bash
npm install
npm run demo
```

示例使用完全虚构的用户和两个虚构 Agent，依次展示：

1. 用户请求被写成 Event；
2. Context Manifest 只登记引用；
3. Initiative 从目标进入执行；
4. 虚构 Agent 产生一个真实文件产物；
5. Evidence Bundle 记录动作与产物；
6. Initiative 满足目标、实际动作、产物或结果、Evidence 后才进入 `completed`；
7. 示例重新读取落盘状态，验证“重启后仍在”。

运行结果写入 `.demo-output/`，可以直接打开查看。

## 必须遵守

- 同一事件的重复投递必须使用稳定的 `idempotency_key`。
- API Key、Token、Cookie 和真实私人数据不得写入协议文件、示例或提交历史。
- 外部写操作默认关闭；本仓库不提供任何外部写连接器。
- `completed` 必须关联目标、实际动作、产物或结果和 Evidence。
- 模型输出只能直接证明该输出发生过，不能单独证明其提到的外部事实。

## 设计边界

- Context Manifest 保存引用，不保存被引用的私人正文。
- Evidence 是可审计材料，不等于真相；调用方仍需制定事实判断策略。
- Keel 示例仅使用虚构 Agent。示例底色是“缘起性空，性空缘起，一切皆是因果。”，它不是任何真实 House 实例的 Keel。
- v0.1 是 **experimental**，后续版本允许不兼容变化。
- 当前只提供协议、语义校验和演示，不提供生产级调度、队列、数据库或模型调用。

## 本仓库不包含

- House Runtime Engine。它以后另行发布，不属于本次仓库。
- 任何真实 Agent、用户、聊天、记忆、Keel、prompt 或关系配置。
- House 的兴趣词、每日选择、具体选题算法和作息。
- 论坛、邮件、游戏、搜索、模型供应商或其他连接器。
- House 内部社区、部署地址、IP、端口、密钥和数据库。

## 文件结构

```text
house-protocols/
├── schemas/              # JSON Schema 协议
├── src/                  # Schema 校验与跨字段语义规则
├── examples/             # 完全虚构的协议样例
├── demo/                 # 五分钟闭环演示
├── test/                 # 硬规则回归测试
├── scripts/              # 发布前私人内容扫描
├── CONTRIBUTING.md
├── LICENSE               # Apache-2.0
└── README.md
```

贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.md)。
