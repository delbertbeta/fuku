# Spec: Registration Control

## ADDED Requirements

### Requirement: Registration Status API

The system MUST provide a public API endpoint to check whether registration is currently allowed.

#### Scenario: Registration Status Returns True When Enabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `true` or is not set
**When** a client calls `GET /api/auth/registration-status`
**Then** the response should return `{ allowed: true }`
**And** the status code should be 200

#### Scenario: Registration Status Returns False When Disabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `false`
**When** a client calls `GET /api/auth/registration-status`
**Then** the response should return `{ allowed: false }`
**And** the status code should be 200
**And** no authentication should be required

### Requirement: Registration UI Visibility Control

The frontend MUST check registration status before displaying registration-related UI elements.

#### Scenario: Register Form Hidden When Disabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `false`
**When** a user visits the `/register` page
**Then** the registration form should not be displayed
**And** a message should be shown: "注册功能当前已禁用，请联系管理员"
**And** a link to the login page should be provided

#### Scenario: Register Form Visible When Enabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `true` or is not set
**When** a user visits the `/register` page
**Then** the registration form should be displayed normally
**And** all form fields and submit button should be functional

#### Scenario: Register Link Hidden When Disabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `false`
**When** a user visits the `/login` page
**Then** the "没有账号？注册" link should not be displayed

#### Scenario: Register Link Visible When Enabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `true` or is not set
**When** a user visits the `/login` page
**Then** the "没有账号？注册" link should be displayed
**And** clicking the link should navigate to `/register`

### Requirement: Registration Control

The system MUST support disabling user registration through an environment variable while allowing existing users to login.

#### Scenario: Registration Allowed When Enabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `true` or is not set
**When** a user attempts to register with valid credentials
**Then** registration should succeed
**And** a new user account should be created

#### Scenario: Registration Disabled When Disabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `false`
**When** a user attempts to register
**Then** registration should fail
**And** the API should return a 403 Forbidden status
**And** an error message should be displayed indicating registration is disabled

#### Scenario: Login Works When Registration Disabled

**Given** the environment variable `ALLOW_REGISTRATION` is set to `false`
**And** a user account exists with email "test@example.com"
**When** the user attempts to login with valid credentials
**Then** login should succeed
**And** the user should be authenticated normally
