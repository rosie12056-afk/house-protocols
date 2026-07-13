# 贡献指南

House Protocols v0.1 仍处于实验阶段。提交变更前请先说明要解决的互操作问题，并为新增或修改的硬规则补充测试。

```bash
npm install
npm run check
```

贡献不得包含真实用户、真实 Agent、聊天、记忆、Keel、prompt、邮箱、密钥、域名、IP、端口或本机绝对路径。示例必须使用虚构身份和虚构事件。

协议字段变更必须同步更新：

- 对应 JSON Schema；
- `src/semantic-rules.mjs` 中的跨字段规则；
- 至少一个有效或无效测试；
- README 中受影响的简短说明。

v0.1 允许不兼容变化，但必须在提交说明中明确标注。
