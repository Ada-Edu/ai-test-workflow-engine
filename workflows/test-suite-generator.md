# Test Suite Generator - Markdown Workflow

Multi-agent test generation with adversarial quality review. Follow these instructions to generate comprehensive test coverage.

## Overview

This workflow orchestrates four specialized agents:
1. **Discovery Agent** - Analyze codebase structure and identify testable components
2. **Unit Test Agent** - Generate isolated function/module tests
3. **Integration Test Agent** - Generate component interaction tests
4. **E2E Test Agent** - Generate complete user flow tests
5. **Adversarial Review Agent** - Find coverage gaps, vanity tests, weak assertions
6. **Fix Application** - Apply improvements automatically

---

## Phase 1: Discovery

**Objective**: Understand the codebase structure and identify what needs testing.

**Instructions**: Spawn a discovery agent to analyze the project.

**Agent Prompt**:
```
Analyze this codebase and identify:

1. **Project Type**: Language, framework, runtime (e.g., "React + TypeScript", "Python FastAPI")
2. **Test Framework**: What's currently used, or what you recommend
3. **Source Structure**: Where production code lives (paths)
4. **Test Structure**: Where tests are located, naming conventions
5. **Testable Components**:
   - Unit test targets (individual functions, classes, modules)
   - Integration test targets (API endpoints, database operations, service boundaries)
   - E2E flows (complete user journeys, critical paths)
6. **Existing Tests**: Count and patterns
7. **Recommended Setup**: Test runners, mocking libraries, assertion libraries

Return structured data:
- project_type: string
- language: string
- test_framework: string
- source_paths: string[]
- test_paths: string[]
- components: {
    unit_targets: string[],
    integration_targets: string[],
    e2e_flows: string[]
  }
- existing_test_count: number
- recommended_setup: string
```

**Expected Output**: JSON object with project metadata

**Store in variable**: `discovery`

---

## Phase 2: Generate Tests (Parallel)

Launch three agents in parallel to generate different test layers.

### Agent 2A: Unit Test Generator

**Agent Prompt**:
```
Generate comprehensive unit tests for this ${discovery.project_type} project.

**Context**:
- Language: ${discovery.language}
- Test framework: ${discovery.test_framework}
- Test path convention: ${discovery.test_paths[0]}

**Targets**: ${discovery.components.unit_targets.join(', ')}

**Requirements**:
1. Test individual functions/methods in isolation
2. Mock external dependencies (databases, APIs, file system)
3. Cover scenarios:
   - Happy path (expected inputs → expected outputs)
   - Error cases (invalid inputs, exceptions)
   - Edge cases (empty arrays, null/undefined, boundary values)
   - Boundary conditions (min/max values, limits)
4. Use meaningful test names that describe behavior (not implementation)
5. Assert on outcomes, not implementation details
6. Include setup/teardown for test fixtures

**Output Format**:
Return an array of test files:
[
  {
    file_path: "absolute/path/to/test/file",
    content: "complete test file content",
    targets: ["source files being tested"],
    test_count: number
  }
]

Follow existing code style and conventions.
```

**Store in variable**: `unitTests`

### Agent 2B: Integration Test Generator

**Agent Prompt**:
```
Generate integration tests for this ${discovery.project_type} project.

**Context**:
- Language: ${discovery.language}
- Test framework: ${discovery.test_framework}

**Targets**: ${discovery.components.integration_targets.join(', ')}

**Requirements**:
1. Test how components work together (NO mocking of internal components)
2. Test scenarios:
   - API contracts (request/response formats)
   - Database interactions (CRUD operations, transactions)
   - Service boundaries (module A calling module B)
   - Error handling across component boundaries
   - Authentication/authorization flows
   - Middleware chains
3. Use real dependencies where possible:
   - Test databases (in-memory or containerized)
   - Real HTTP clients (not mocked)
   - Actual file system operations (in test directory)
4. Verify data transformations between layers
5. Test request/response flows end-to-end within the backend

**Output Format**:
Return an array of test files (same format as unit tests).
```

**Store in variable**: `integrationTests`

### Agent 2C: E2E Test Generator

**Agent Prompt**:
```
Generate end-to-end tests for this ${discovery.project_type} project.

**Context**:
- Project type: ${discovery.project_type}

**Flows to test**: ${discovery.components.e2e_flows.join(', ')}

**Requirements**:
1. Test complete user journeys from start to finish
2. Use appropriate E2E framework:
   - Web apps: Playwright, Cypress, or Selenium
   - APIs: HTTP client with full request chains
   - CLIs: Execute commands and verify output
   - Desktop apps: Use UI automation tools
3. Test scenarios:
   - Critical user paths (happy path)
   - Error scenarios and recovery
   - Multi-step workflows
   - Realistic data and timing
4. Verify outcomes:
   - UI state changes (if web/desktop)
   - Data persistence
   - API responses
   - Side effects (emails sent, files created)
5. Keep tests maintainable:
   - Use page objects or helper functions
   - Avoid brittle selectors
   - Make tests independent

**Output Format**:
Return an array of test files (same format as unit tests).
```

**Store in variable**: `e2eTests`

---

## Phase 3: Write Test Files

**Instructions**: Write all generated test files to disk.

```
For each test in [unitTests, integrationTests, e2eTests]:
  - Use Write tool to create the test file
  - Path: test.file_path
  - Content: test.content
```

**Track**: Total files written

---

## Phase 4: Adversarial Review

**Objective**: Skeptically audit all tests for weaknesses.

**Agent Prompt**:
```
You are a skeptical test quality reviewer. Your job is to find problems with these tests.

**Tests written**:
${allTests.map(t => `- ${t.file_path} (${t.test_count} tests, targets: ${t.targets.join(', ')})`).join('\n')}

**Read each test file and identify**:

1. **Coverage Gaps**: What scenarios, edge cases, or code paths are NOT tested?
   - Missing error handling
   - Unhandled edge cases (null, empty, boundary values)
   - Race conditions, concurrency issues
   - Security scenarios (injection, XSS, authentication bypass)
   - Performance edge cases (large datasets, slow networks)

2. **Vanity Tests**: Tests that look good but verify nothing meaningful
   - Example: Testing that a getter returns a value you just set
   - Example: Testing React's useState works
   - Example: Asserting a mock was called (when that's the only thing happening)

3. **Weak Assertions**: Tests that check trivial things instead of actual behavior
   - Checking element exists but not its content
   - Checking status code but not response body
   - Checking error !== null but not error type/message
   - Asserting on implementation details instead of outcomes

4. **False Positives**: Tests that pass even when code is broken
   - Mocking everything so there's no real verification
   - Assertions that can never fail
   - Tests that don't actually call the code being tested

5. **Redundant Tests**: Multiple tests checking the exact same thing

6. **Missing Edge Cases**:
   - Null/undefined handling
   - Empty arrays/objects
   - Boundary values (0, -1, MAX_INT)
   - Concurrent access
   - Long-running operations
   - Network failures, timeouts

**For each finding, provide**:
- test_file: string (path)
- test_name: string | null (specific test case if applicable)
- issue_type: 'coverage_gap' | 'vanity_test' | 'weak_assertion' | 'false_positive' | 'missing_edge_case' | 'redundant_test'
- severity: 'critical' | 'high' | 'medium' | 'low'
- description: string (what's wrong and why)
- recommendation: 'strengthen' | 'delete' | 'replace' | 'add_new'
- reasoning: string (why this recommendation)
- suggested_code: string | null (proposed fix if applicable)

**Also provide a coverage summary**:
- total_tests: number
- strong_tests: number (well-written, valuable tests)
- weak_tests: number (need improvement)
- vanity_tests: number (should be deleted)
- critical_gaps: string[] (list of major missing coverage)

Be thorough and adversarial. Assume the tests are trying to fool you into thinking they're better than they are.
```

**Store in variable**: `review`

---

## Phase 5: Apply Fixes

**Instructions**: Apply all recommendations from the adversarial review.

**For each test file with findings**:

1. Group findings by file
2. Read the current test file
3. Apply ALL recommendations for that file:
   - **strengthen**: Improve assertions, add missing test cases, fix weak verification
   - **delete**: Remove vanity or redundant tests entirely
   - **replace**: Rewrite the test to properly verify behavior
   - **add_new**: Create new test cases for coverage gaps

4. Use Edit tool to modify the file
5. Track what was changed:
   - action: 'strengthened' | 'deleted' | 'replaced' | 'added'
   - file: string
   - test_name: string
   - rationale: string

**Process all files**

---

## Phase 6: Generate Summary Report

**Create a summary with**:

```markdown
# Test Suite Generation Report

## Discovery
- **Project Type**: ${discovery.project_type}
- **Language**: ${discovery.language}
- **Test Framework**: ${discovery.test_framework}

## Tests Generated
- **Unit Tests**: ${unitTests.length} files, ${totalUnitTests} test cases
- **Integration Tests**: ${integrationTests.length} files, ${totalIntegrationTests} test cases  
- **E2E Tests**: ${e2eTests.length} files, ${totalE2ETests} test cases
- **Total**: ${totalFiles} files, ${totalTests} test cases

## Adversarial Review Findings
- **Total Issues**: ${review.findings.length}
- **By Severity**:
  - Critical: ${criticalCount}
  - High: ${highCount}
  - Medium: ${mediumCount}
  - Low: ${lowCount}
- **By Type**:
  - Coverage gaps: ${coverageGapCount}
  - Vanity tests: ${vanityCount}
  - Weak assertions: ${weakCount}
  - False positives: ${falsePositiveCount}

## Quality Metrics
- **Strong Tests**: ${review.coverage_summary.strong_tests}
- **Weak Tests**: ${review.coverage_summary.weak_tests}
- **Vanity Tests**: ${review.coverage_summary.vanity_tests}

## Critical Gaps Addressed
${review.coverage_summary.critical_gaps.map(gap => `- ${gap}`).join('\n')}

## Improvements Applied
- **Files Modified**: ${filesModified}
- **Total Actions**: ${totalActions}
- **Strengthened**: ${strengthenedCount} tests
- **Deleted**: ${deletedCount} tests
- **Replaced**: ${replacedCount} tests
- **Added**: ${addedCount} tests

## Next Steps
1. Run the test suite: \`npm test\` or \`pytest\` or appropriate command
2. Review git diff to see changes: \`git diff\`
3. Commit improvements: \`git commit -m "Improve test quality with adversarial review"\`
```

**Present this report to the user**

---

## Configuration Options

### Skip Adversarial Review
If user requests `--no-review`, skip Phase 4 and Phase 5.

### Skip Auto-Fix
If user requests `--no-fix`, complete Phase 4 (review) but skip Phase 5 (applying fixes).
Present the findings to the user for manual action.

### Dry Run
If user requests `--dry-run`, complete Phase 1-2 (discovery and generation) but don't write files.
Show what would be created.

---

## Customization

### Adjusting Coverage
Edit the agent prompts in Phase 2 to:
- Request more/fewer test cases per component
- Focus on specific testing patterns
- Match team conventions

### Changing Review Strictness
Edit the adversarial review prompt in Phase 4 to:
- Be more/less strict
- Focus on specific issue types
- Ignore certain patterns

### Custom Test Frameworks
Update discovery prompt in Phase 1 to recognize your framework.
Update generation prompts in Phase 2 with framework-specific examples.

---

## Tips for Best Results

1. **Run from project root** - Ensures all source files are discoverable
2. **Clear conventions** - Tests generate better if your codebase follows consistent patterns
3. **Review first time** - Use `--no-fix` on first run to see what changes before auto-applying
4. **Customize prompts** - Fork and adjust prompts to match your team's style
5. **Iterate** - Run multiple times as you refactor/improve

---

## Troubleshooting

### Discovery fails
- Ensure you're in a project directory with source code
- Check file permissions
- Try specifying a target directory

### Tests don't run
- Verify test framework is installed
- Check test file paths match conventions
- Review imports and dependencies

### Too many/few tests
- Adjust agent prompts to request different coverage breadth
- Modify discovery to focus on specific areas

### Review finds no issues
- Tests might actually be strong!
- Or review agent needs more examples of what to look for
- Try increasing review strictness in prompt

---

## Using This Workflow

### Via Claude Code:
```
Follow the test-suite-generator.md workflow for this project
```

### As a Project Skill:
Copy this file to `.claude/skills/` in your project, then:
```
/test-suite
```

### Manual Orchestration:
Copy/paste each phase's agent prompt into Claude Code as needed.
