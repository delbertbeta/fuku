# user-authentication Specification

## Purpose

TBD - created by archiving change establish-outfit-platform. Update Purpose after archive.

## Requirements

### Requirement: User Registration

The system MUST allow users to register a new account with email and password to access the platform.

#### Scenario: Successful Registration

**Given** the registration form is displayed
**When** a user provides a valid email address and password
**Then** a new user account should be created
**And** the user should be logged in automatically
**And** the user should be redirected to the clothing management page

#### Scenario: Duplicate Email Registration

**Given** a user account with email "test@example.com" already exists
**When** a user attempts to register with email "test@example.com"
**Then** registration should fail
**And** an error message should be displayed indicating the email is already in use

#### Scenario: Weak Password Rejection

**Given** the registration form is displayed
**When** a user provides a password with less than 8 characters
**Then** registration should fail
**And** an error message should be displayed indicating password requirements

### Requirement: User Login

The system MUST allow users to authenticate with their email and password to access their account.

#### Scenario: Successful Login

**Given** a user account exists with email "test@example.com" and password "securepassword123"
**When** the user submits valid credentials
**Then** the user should be authenticated
**And** a session should be created
**And** the user should be redirected to their dashboard

#### Scenario: Invalid Credentials

**Given** a user account exists with email "test@example.com"
**When** the user submits an incorrect password
**Then** authentication should fail
**And** an error message should be displayed
**And** no session should be created

#### Scenario: Non-existent User Login Attempt

**Given** no user account exists with email "nonexistent@example.com"
**When** the user attempts to login
**Then** authentication should fail
**And** an error message should be displayed

### Requirement: Session Management

The system MUST securely manage user sessions to maintain authentication state.

#### Scenario: Session Creation

**Given** a user successfully logs in
**When** the login request is processed
**Then** a secure, HTTP-only session cookie should be created
**And** the cookie should have an expiration time
**And** the cookie should not be accessible via JavaScript

#### Scenario: Session Validation

**Given** a user has an active session
**When** the user accesses a protected route
**Then** the session should be validated
**And** the user should be granted access

#### Scenario: Expired Session Handling

**Given** a user's session has expired
**When** the user attempts to access a protected route
**Then** access should be denied
**And** the user should be redirected to the login page

### Requirement: User Logout

The system MUST allow users to securely terminate their session.

#### Scenario: Successful Logout

**Given** a user is logged in
**When** the user clicks the logout button
**Then** the session should be destroyed
**And** the session cookie should be cleared
**And** the user should be redirected to the login page

### Requirement: Data Isolation

Each user's data MUST be isolated from other users' data.

#### Scenario: Clothing Data Isolation

**Given** User A has created clothing items
**When** User B accesses the clothing list
**Then** User B should only see their own clothing items
**And** User B should not have access to User A's items

#### Scenario: Outfit Data Isolation

**Given** User A has created outfit combinations
**When** User B accesses the outfit list
**Then** User B should only see their own outfits
**And** User B should not have access to User A's outfits

### Requirement: Rate Limiting

Authentication endpoints MUST be protected against brute force attacks.

#### Scenario: Login Rate Limit

**Given** a user has made 5 failed login attempts within 5 minutes
**When** the user attempts another login
**Then** the request should be rate limited
**And** an appropriate error message should be displayed

#### Scenario: Registration Rate Limit

**Given** an IP address has made 3 registration attempts within 1 hour
**When** another registration attempt is made from the same IP
**Then** the request should be rate limited
**And** an appropriate error message should be displayed

### Requirement: Password Security

Passwords MUST be securely stored and never transmitted in plaintext.

#### Scenario: Password Hashing

**Given** a user registers with password "userpassword123"
**When** the registration is processed
**Then** the password should be hashed using bcrypt or argon2
**And** the plaintext password should not be stored in the database

#### Scenario: Secure Transmission

**Given** a user submits their password in a login form
**When** the request is transmitted
**Then** the password should be sent over HTTPS
**And** the password should not be logged or exposed in error messages

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
