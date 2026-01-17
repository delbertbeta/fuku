# Tasks

## Implementation Tasks

### 1. Update Configuration

- [x] Add `ALLOW_REGISTRATION=true` to `.env.example`
- [ ] Document the environment variable in project README (if applicable)

### 2. Backend Implementation

- [x] Create `src/app/api/auth/registration-status/route.ts`
  - Implement GET endpoint that returns `{ allowed: boolean }`
  - Check `ALLOW_REGISTRATION` environment variable
  - Ensure endpoint is public (no authentication required)

- [x] Add registration control check in `src/app/api/auth/register/route.ts`
  - Check `ALLOW_REGISTRATION` environment variable at the start of POST handler
  - Return 403 Forbidden with "Registration is disabled" error when disabled
  - Ensure existing validation and logic runs when enabled

### 3. Frontend Implementation

- [x] Update `src/app/(auth)/register/page.tsx` to handle registration disabled state
  - Add state for `registrationAllowed` with `boolean | null` type
  - Call `GET /api/auth/registration-status` on component mount
  - Display "注册功能当前已禁用，请联系管理员" message when disabled
  - Show "返回登录" link to redirect users
  - Hide registration form when disabled
  - Show loading state while checking status

- [x] Update `src/app/(auth)/login/page.tsx` to hide register link when disabled
  - Add state for `registrationAllowed` with `boolean` type
  - Call `GET /api/auth/registration-status` on component mount
  - Conditionally render the "没有账号？注册" link based on status
  - Default to `true` if API call fails

### 4. Testing

- [ ] Add unit tests for `GET /api/auth/registration-status` with `ALLOW_REGISTRATION=true`
- [ ] Add unit tests for `GET /api/auth/registration-status` with `ALLOW_REGISTRATION=false`
- [ ] Add unit tests for `POST /api/auth/register` with `ALLOW_REGISTRATION=true`
- [ ] Add unit tests for `POST /api/auth/register` with `ALLOW_REGISTRATION=false`
- [ ] Test `/register` page displays form when registration is enabled
- [x] Test `/register` page shows disabled message when registration is disabled
- [ ] Test `/login` page shows register link when registration is enabled
- [x] Test `/login` page hides register link when registration is disabled
- [x] Verify login functionality works correctly when registration is disabled
- [x] Manual testing: Set `ALLOW_REGISTRATION=false`, restart server, verify registration status API returns false
- [ ] Manual testing: Set `ALLOW_REGISTRATION=true`, verify registration works normally

### 5. Documentation

- [ ] Update `user-authentication` spec with new requirements (done via spec delta)
- [ ] Add comments in code explaining the registration control logic

## Dependencies

- Backend must be implemented before frontend testing
- Environment variable must be documented before testing

## Validation Criteria

- Setting `ALLOW_REGISTRATION=false` blocks all new registrations
- Setting `ALLOW_REGISTRATION=true` or omitting the variable allows registration
- Login functionality remains functional regardless of registration setting
- Frontend displays appropriate messages based on registration state
- No regressions in existing registration flow when enabled
