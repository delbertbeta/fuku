# Proposal: Toggle Registration via Environment Variable

## Summary

添加一个环境变量 `ALLOW_REGISTRATION` 来控制是否允许用户注册新账户。

## Why

目前系统始终允许用户注册，这在某些场景下可能不适合：

- 私有部署时，管理员希望手动添加用户
- 维护模式下，需要临时关闭注册
- 付费计划中，需要限制用户增长
- 安全审计期间，需要限制新访问

通过环境变量控制注册功能，可以提供灵活的配置方式，无需修改代码即可根据不同环境或需求调整注册策略。

## Motivation

在某些场景下（如私有部署、维护模式、付费计划），可能需要禁用新用户注册，同时允许现有用户登录。通过环境变量控制此功能可以提供灵活的配置，无需修改代码。

## Current Behavior

系统始终允许用户通过注册页面创建新账户，除非邮箱已被注册。

## Proposed Behavior

添加 `ALLOW_REGISTRATION` 环境变量：

- 默认值：`true`（允许注册）
- 添加新的 `GET /api/auth/registration-status` 端点返回 `{ allowed: boolean }`
- 当设置为 `false` 时：
  - 注册 API 返回 403 错误（作为防御性检查）
  - 前端在页面加载时调用注册状态 API
  - 注册页面不显示表单，只显示"注册功能已禁用"提示和返回登录链接
  - 登录页面隐藏"注册"链接
  - 登录功能不受影响

## Scope

- 后端：在注册 API 中检查环境变量
- 前端：根据环境变量状态显示适当的 UI
- 配置：更新 `.env.example` 添加新变量
- 文档：更新相关规范

## Alternatives Considered

1. **数据库配置表**：通过数据库存储设置，允许运行时动态修改
   - 优点：无需重启服务即可生效
   - 缺点：增加数据库依赖和复杂性

2. **功能开关服务**：使用专门的功能开关管理工具
   - 优点：提供丰富的功能（A/B 测试、分阶段发布等）
   - 缺点：引入外部依赖，对于简单场景过于复杂

环境变量方案是最简单直接的实现，符合"favors straightforward, minimal implementations"的原则。

## Risks and Mitigations

- **风险**：忘记设置环境变量导致注册被意外禁用
  - **缓解**：默认值为 `true`，保持向后兼容
- **风险**：前端无法直接访问环境变量
  - **缓解**：通过 API 检查注册状态，或添加公共端点返回配置

## Dependencies

无外部依赖。基于现有架构实现。

## Related Changes

- 修改 `user-authentication` 规范添加注册控制需求
- 更新 `ui` 规范（如需要）
