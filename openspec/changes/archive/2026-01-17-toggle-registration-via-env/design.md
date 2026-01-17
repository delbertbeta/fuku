# Design: Toggle Registration via Environment Variable

## Overview

通过环境变量 `ALLOW_REGISTRATION` 控制注册功能的开关。当注册被禁用时，阻止新用户创建账户。

## Architecture

### Components

1. **Environment Variable**
   - 名称：`ALLOW_REGISTRATION`
   - 类型：`true` | `false`
   - 默认值：`true`
   - 位置：`.env` 文件

2. **Backend API (`GET /api/auth/registration-status`)**
   - 公开端点，无需认证
   - 返回当前注册是否可用
   - 响应格式：`{ allowed: boolean }`

3. **Backend API (`POST /api/auth/register`)**
   - 在请求处理开始时检查 `ALLOW_REGISTRATION`
   - 如果为 `false`，立即返回 403 Forbidden
   - 错误信息："Registration is disabled"

4. **Frontend (`/register` page)**
   - 在页面加载时调用 `GET /api/auth/registration-status`
   - 根据响应决定是否显示注册表单
   - 显示信息："注册功能当前已禁用，请联系管理员"
   - 提供"返回登录"链接

5. **Frontend (`/login` page)**
   - 在页面加载时调用 `GET /api/auth/registration-status`
   - 根据 `allowed` 值决定是否显示"注册"链接

### Data Flow

```
User visits /register or /login page
    ↓
Frontend calls GET /api/auth/registration-status
    ↓
API returns { allowed: true | false }
    ├─ true → Show register form/link
    └─ false → Hide register form/link, show disabled message

User submits registration form
    ↓
Frontend submits POST /api/auth/register
    ↓
API checks ALLOW_REGISTRATION
    ├─ true → Process registration normally
    └─ false → Return 403 Forbidden (defensive check)
```

### Implementation Details

#### Backend Changes

**File: `src/app/api/auth/registration-status/route.ts`** (新建)

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const allowRegistration = process.env.ALLOW_REGISTRATION !== "false";

  return NextResponse.json({ allowed: allowRegistration });
}
```

**File: `src/app/api/auth/register/route.ts`**

```typescript
// 在函数开始处添加
const allowRegistration = process.env.ALLOW_REGISTRATION !== "false";

if (!allowRegistration) {
  return NextResponse.json(
    { error: "Registration is disabled" },
    { status: 403 }
  );
}
```

**File: `.env.example`**

```bash
# Registration Control
ALLOW_REGISTRATION=true
```

#### Frontend Changes

**File: `src/app/(auth)/register/page.tsx`**

```typescript
// 添加状态管理
const [registrationAllowed, setRegistrationAllowed] = useState<boolean | null>(null);

// 在组件加载时检查注册状态
useEffect(() => {
  fetch("/api/auth/registration-status")
    .then((res) => res.json())
    .then((data) => setRegistrationAllowed(data.allowed))
    .catch(() => setRegistrationAllowed(true)); // 默认允许
}, []);

// 在渲染中根据状态显示内容
if (registrationAllowed === false) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <p className="text-red-500 mb-4">注册功能当前已禁用，请联系管理员</p>
        <a href="/login" className="text-blue-500">
          返回登录
        </a>
      </div>
    </div>
  );
}

if (registrationAllowed === null) {
  return <div className="text-center p-4">加载中...</div>;
}

// 显示注册表单...
```

**File: `src/app/(auth)/login/page.tsx`**

```typescript
// 添加状态管理
const [registrationAllowed, setRegistrationAllowed] = useState<boolean>(true);

// 在组件加载时检查注册状态
useEffect(() => {
  fetch("/api/auth/registration-status")
    .then((res) => res.json())
    .then((data) => setRegistrationAllowed(data.allowed))
    .catch(() => setRegistrationAllowed(true)); // 默认允许
}, []);

// 根据状态决定是否显示注册链接
{registrationAllowed && (
  <p className="mt-4 text-center">
    没有账号？{" "}
    <a href="/register" className="text-blue-500">
      注册
    </a>
  </p>
)}
```

### Security Considerations

- 环境变量不暴露到客户端（`NEXT_PUBLIC_` 前缀不用于此变量）
- 前端只能通过 API 响应推断状态，无法直接读取环境变量
- 现有的认证和会话管理不受影响

### Edge Cases

1. **生产环境忘记设置变量**：默认 `true`，注册保持启用
2. **管理员需要临时禁用注册**：修改 `.env` 并重启服务
3. **多个环境不同设置**：通过不同的 `.env` 文件管理（`.env.local`, `.env.production`）

### Testing Strategy

1. **Unit Tests**
   - `GET /api/auth/registration-status` 在 `ALLOW_REGISTRATION=true` 时返回 `{ allowed: true }`
   - `GET /api/auth/registration-status` 在 `ALLOW_REGISTRATION=false` 时返回 `{ allowed: false }`
   - `POST /api/auth/register` 在 `ALLOW_REGISTRATION=true` 时正常工作
   - `POST /api/auth/register` 在 `ALLOW_REGISTRATION=false` 时返回 403

2. **Integration Tests**
   - 注册页面正确显示表单（当允许）
   - 注册页面显示禁用消息（当禁用）
   - 登录页面显示注册链接（当允许）
   - 登录页面隐藏注册链接（当禁用）
   - 登录功能不受影响

3. **Manual Testing**
   - 使用不同的环境变量值测试完整流程
   - 验证注册链接在登录页的显示/隐藏

## Migration

无迁移步骤。默认行为保持不变（`ALLOW_REGISTRATION=true`）。

## Rollback

如需回滚，删除环境变量检查代码或移除 `.env` 中的设置。

## Open Questions

无。
