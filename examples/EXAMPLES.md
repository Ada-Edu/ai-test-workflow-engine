# Usage Examples

This document shows real-world examples of using the AI Test Workflow Engine across different project types.

## Table of Contents

- [TypeScript React Frontend](#typescript-react-frontend)
- [Python FastAPI Backend](#python-fastapi-backend)
- [Go REST API](#go-rest-api)
- [Node.js Express Server](#nodejs-express-server)
- [Rust CLI Tool](#rust-cli-tool)
- [Full-Stack Monorepo](#full-stack-monorepo)

---

## TypeScript React Frontend

### Project Structure
```
my-react-app/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── UserProfile.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── utils/
│       └── api.ts
├── package.json
└── vite.config.ts
```

### Running the Workflow

```bash
cd my-react-app
ai-test-workflow
```

### Expected Output

```
Discovery:
  - Project: React + TypeScript + Vite
  - Framework: Vitest + React Testing Library + Playwright
  - Source: src/components, src/hooks, src/utils
  - Test location: src/__tests__

Generated Tests:
  Unit Tests (28):
    - src/__tests__/components/Button.test.tsx (8 tests)
    - src/__tests__/components/UserProfile.test.tsx (12 tests)
    - src/__tests__/hooks/useAuth.test.ts (5 tests)
    - src/__tests__/utils/api.test.ts (3 tests)

  Integration Tests (12):
    - src/__tests__/integration/auth-flow.test.tsx (6 tests)
    - src/__tests__/integration/api-client.test.tsx (6 tests)

  E2E Tests (8):
    - e2e/login-flow.spec.ts (4 tests)
    - e2e/user-profile.spec.ts (4 tests)

Adversarial Review:
  Findings: 11
    - 3 vanity tests (testing useState returns what was set)
    - 5 weak assertions (checking element exists, not behavior)
    - 2 coverage gaps (error boundaries, loading states)
    - 1 redundant test (duplicate of another test)

Applied Fixes:
  - Deleted 4 tests (3 vanity + 1 redundant)
  - Strengthened 5 assertions
  - Added 2 new tests for gaps
```

### Sample Generated Test

**Before Review:**
```typescript
// Vanity test - deleted
it('should update state when setValue is called', () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](5));
  expect(result.current[0]).toBe(5); // Just testing React itself
});
```

**After Review:**
```typescript
// Strengthened - actual behavior test
it('should fetch and display user data on mount', async () => {
  render(<UserProfile userId="123" />);
  
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('avatar'));
});
```

---

## Python FastAPI Backend

### Project Structure
```
my-api/
├── app/
│   ├── main.py
│   ├── routes/
│   │   └── users.py
│   ├── services/
│   │   └── auth.py
│   └── models/
│       └── user.py
├── pyproject.toml
└── pytest.ini
```

### Running the Workflow

```bash
cd my-api
ai-test-workflow
```

### Expected Output

```
Discovery:
  - Project: Python 3.11 + FastAPI
  - Framework: pytest + pytest-asyncio + httpx
  - Source: app/
  - Test location: tests/

Generated Tests:
  Unit Tests (22):
    - tests/unit/test_auth_service.py (8 tests)
    - tests/unit/test_user_model.py (6 tests)
    - tests/unit/test_validators.py (8 tests)

  Integration Tests (18):
    - tests/integration/test_user_routes.py (10 tests)
    - tests/integration/test_database.py (8 tests)

  E2E Tests (6):
    - tests/e2e/test_user_registration_flow.py (3 tests)
    - tests/e2e/test_authentication_flow.py (3 tests)

Adversarial Review:
  Findings: 8
    - 4 coverage gaps (concurrent access, rate limiting)
    - 3 weak assertions (status code only, not response body)
    - 1 false positive (mocked DB, no real verification)

Applied Fixes:
  - Added 4 new tests for concurrency scenarios
  - Strengthened 3 assertions to check full response
  - Replaced 1 test to use real test database
```

### Sample Generated Test

**Before Review:**
```python
# Weak assertion - strengthened
async def test_create_user(client):
    response = await client.post("/users", json={"name": "John"})
    assert response.status_code == 201  # Only checks status
```

**After Review:**
```python
# Strengthened - verifies full contract
async def test_create_user(client, db_session):
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "secure123"
    }
    
    response = await client.post("/users", json=user_data)
    
    assert response.status_code == 201
    
    body = response.json()
    assert body["id"] is not None
    assert body["name"] == user_data["name"]
    assert body["email"] == user_data["email"]
    assert "password" not in body  # Never expose password
    
    # Verify database persistence
    db_user = await db_session.get(User, body["id"])
    assert db_user is not None
    assert db_user.email == user_data["email"]
```

---

## Go REST API

### Project Structure
```
my-go-api/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   └── user.go
│   └── services/
│       └── auth.go
└── go.mod
```

### Running the Workflow

```bash
cd my-go-api
ai-test-workflow
```

### Expected Output

```
Discovery:
  - Project: Go 1.21 REST API
  - Framework: testing + testify + httptest
  - Source: internal/, cmd/
  - Test location: *_test.go files

Generated Tests:
  Unit Tests (18):
    - internal/handlers/user_test.go (8 tests)
    - internal/services/auth_test.go (10 tests)

  Integration Tests (12):
    - internal/handlers/integration_test.go (7 tests)
    - internal/db/repository_test.go (5 tests)

  E2E Tests (4):
    - cmd/server/e2e_test.go (4 tests)

Adversarial Review:
  Findings: 6
    - 2 coverage gaps (context cancellation, timeout handling)
    - 3 weak assertions (error != nil, but not checking error type)
    - 1 vanity test (testing struct field assignment)

Applied Fixes:
  - Added 2 tests for context scenarios
  - Strengthened 3 error assertions
  - Deleted 1 vanity test
```

---

## Full-Stack Monorepo

### Project Structure
```
my-monorepo/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── app/
│   └── pyproject.toml
└── shared/
    └── types/
```

### Running the Workflow

Target specific packages:

```bash
# Test frontend
cd my-monorepo
ai-test-workflow frontend

# Test backend
ai-test-workflow backend

# Test both (run twice)
ai-test-workflow frontend && ai-test-workflow backend
```

### Expected Output (Frontend)

```
Discovery:
  - Project: React + TypeScript (monorepo package)
  - Detects shared types from ../shared/
  - Framework: Vitest

Generated: 45 total tests
Reviewed: 12 findings
Fixed: 12 improvements applied
```

### Expected Output (Backend)

```
Discovery:
  - Project: Python FastAPI (monorepo package)
  - Detects shared types (Python stubs generated from TypeScript)
  - Framework: pytest

Generated: 38 total tests
Reviewed: 9 findings
Fixed: 9 improvements applied
```

---

## Command-Line Options

### Skip Adversarial Review

```bash
ai-test-workflow --no-review
```

Use when you want to generate tests quickly and review manually later.

### Skip Automatic Fixes

```bash
ai-test-workflow --no-fix
```

Generate tests and get review findings, but don't apply changes automatically. Useful for:
- First-time users who want to see what would change
- Projects with strict code review requirements
- When you want to apply fixes selectively

### Dry Run

```bash
ai-test-workflow --dry-run
```

Preview what would be generated without writing any files. Shows:
- What test files would be created
- What existing files would be modified
- Summary of findings and planned fixes

### Custom Workflow Path

```bash
ai-test-workflow --workflow-path ./my-custom-workflow.js
```

Use a customized version of the workflow script.

---

## Integration with CI/CD

### GitHub Actions

```yaml
name: Generate Tests

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Claude Code
        run: |
          # Install Claude Code CLI
          npm install -g claude-code
      
      - name: Install AI Test Workflow
        run: |
          npm install -g ai-test-workflow-engine
      
      - name: Generate Tests
        run: |
          ai-test-workflow src/
      
      - name: Commit Generated Tests
        run: |
          git config user.name "AI Test Bot"
          git config user.email "bot@example.com"
          git add tests/
          git commit -m "Generate tests with AI workflow"
          git push
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run test generation on changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=AM | grep -E '\.(ts|py|go)$')

if [ -n "$CHANGED_FILES" ]; then
  echo "Generating tests for changed files..."
  ai-test-workflow --no-fix  # Review only, don't auto-apply
  
  # Add generated tests to commit
  git add tests/
fi
```

---

## Tips and Best Practices

### When to Use Full Workflow

- New feature development
- Greenfield projects
- Major refactors needing test updates
- Projects with low test coverage

### When to Skip Review

- Rapid prototyping
- You're an experienced test writer
- Time-constrained scenarios
- When you plan to review manually

### When to Skip Auto-Fix

- First time using the tool
- Strict code review processes
- Want to understand findings first
- Applying fixes selectively

### Customizing for Your Team

1. Fork the repository
2. Modify `workflows/test-suite-generator.js`
3. Adjust agent prompts for your conventions
4. Set custom schemas for team-specific metadata
5. Install your customized version

---

## Troubleshooting

See main [README.md](../README.md#troubleshooting) for common issues.

For project-specific problems:

- **Tests don't match conventions**: Modify discovery agent prompt
- **Wrong test framework detected**: Specify framework in project config
- **Tests too verbose**: Adjust generation agent prompts
- **Not enough coverage**: Increase test count targets in prompts
