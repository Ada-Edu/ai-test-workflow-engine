# AI Test Workflow Engine

A multi-agent test generation system powered by Claude that creates comprehensive test suites with adversarial quality review.

## Overview

This markdown-based workflow guides Claude through orchestrating specialized AI agents to:
1. **Discovery Agent** - Analyze codebase and identify testable components
2. **Unit Test Agent** - Generate isolated tests for functions/modules with mocking
3. **Integration Test Agent** - Test component interactions with real dependencies
4. **End-to-End Test Agent** - Test complete user flows from start to finish
5. **Adversarial Review Agent** - Find coverage gaps, vanity tests, weak assertions, and false positives
6. **Fix Application** - Automatically strengthen, delete, or replace tests

## Features

- **Pure Markdown** - No JavaScript dependencies, easy to customize and understand
- **Language Agnostic** - Works with any language/framework (auto-detects your setup)
- **Quality Focused** - Adversarial review catches weak tests before they reach your codebase
- **Automatic Fixes** - Applies improvements directly to test files
- **Comprehensive Coverage** - Unit, integration, and E2E tests in one workflow
- **Fully Customizable** - Edit the markdown workflow to match your team's conventions

## Installation

### Prerequisites

- Claude Code CLI (desktop app, VS Code extension, or JetBrains plugin)
- Git

### Setup

1. Clone this repository:
```bash
git clone https://github.com/Ada-Edu/ai-test-workflow-engine.git
cd ai-test-workflow-engine
```

2. Copy the workflow guide to your project or Claude directory:
```bash
# Copy to your project
cp workflows/test-suite-generator.md .claude/

# Or install as a reusable skill
cp workflows/test-suite-generator.md ~/.claude/skills/
```

## Usage

### Via Claude Code

From any project directory, simply ask Claude:

```
Follow the test-suite-generator.md workflow to create comprehensive tests for this project
```

Or if installed as a skill:

```
/test-suite-generator
```

Or use natural language:

```
create comprehensive tests for my project with adversarial review
generate a complete test suite for this codebase
```

## How It Works

The workflow is a structured markdown document that guides Claude through 6 phases:

### Phase 1: Discovery
Claude spawns an agent to analyze your codebase:
- Detect project type, language, and frameworks
- Identify test framework (existing or recommended)
- Map source code structure
- Find testable components (unit targets, integration points, E2E flows)
- Count existing tests and assess patterns

### Phase 2: Generate Unit Tests
Claude spawns an agent with a detailed prompt to:
- Generate isolated function/method tests
- Mock external dependencies (databases, APIs, file system)
- Cover happy path, error cases, edge cases, boundary conditions
- Use meaningful test names describing behavior
- Assert on outcomes, not implementation details

### Phase 3: Generate Integration Tests
Claude spawns another agent to:
- Test components working together (no internal mocking)
- Use real dependencies (test databases, real HTTP clients)
- Test API contracts, database interactions, service boundaries
- Verify error handling across component boundaries
- Test request/response flows

### Phase 4: Generate E2E Tests
Claude spawns a third agent to:
- Test complete user journeys from start to finish
- Use appropriate framework (Playwright, Cypress, CLI testing)
- Test critical paths with realistic data
- Verify outcomes, data persistence, side effects
- Keep tests maintainable with page objects/helpers

### Phase 5: Adversarial Review
Claude spawns a skeptical reviewer agent to hunt for:
- **Coverage gaps** - Missing scenarios, edge cases, error paths
- **Vanity tests** - Look good but verify nothing meaningful
- **Weak assertions** - Check trivial things instead of actual behavior
- **False positives** - Tests that pass even when code is broken
- **Redundancy** - Multiple tests checking the same thing
- **Missing edge cases** - Null handling, boundaries, concurrency

Each finding includes severity, issue type, reasoning, and recommended action.

### Phase 6: Apply Fixes
Claude applies all recommendations automatically:
- **Strengthen** - Improve assertions, add missing test cases
- **Delete** - Remove vanity or redundant tests
- **Replace** - Rewrite tests to properly verify behavior
- **Add New** - Create tests for coverage gaps

All changes are made directly to test files using the Edit tool.

## Output

Claude presents a comprehensive summary report:

```
# Test Suite Generation Report

## Discovery
- Project: Full-stack TypeScript + Python
- Language: TypeScript, Python
- Framework: Vitest, pytest

## Tests Generated
- Unit Tests: 7 files, 65 test cases
- Integration Tests: 10 files, 82 test cases
- E2E Tests: 8 files, 56 test cases
- Total: 25 files, 203 test cases

## Adversarial Review Findings
- Total Issues: 21
- By Severity:
  - Critical: 7
  - High: 5
  - Medium: 7
  - Low: 2
- By Type:
  - Coverage gaps: 6
  - Vanity tests: 3
  - Weak assertions: 5
  - False positives: 3

## Quality Metrics
- Strong Tests: 45 → 64 (+42%)
- Weak Tests: 78 → 0 (strengthened)
- Vanity Tests: 35 → 29 (6 deleted, 29 improved)

## Critical Gaps Addressed
- No authentication/authorization tests → Added 8 tests
- No concurrent workflow tests → Added 4 tests
- No database rollback tests → Added 3 tests
- No rate limiting tests → Added 2 tests

## Improvements Applied
- Files Modified: 14
- Total Actions: 78
- Strengthened: 19 tests
- Deleted: 6 tests
- Replaced: 17 tests
- Added: 36 tests

## Next Steps
1. Run test suite: npm test / pytest
2. Review changes: git diff
3. Commit: git commit -m "Improve test quality with adversarial review"
```

## Customization

### Editing the Workflow

The workflow is pure markdown - edit `workflows/test-suite-generator.md` to customize:

**Discovery Phase** - Change what Claude looks for:
- Add/remove project types to detect
- Modify test framework recommendations
- Adjust what counts as "testable"

**Generation Phases** - Control test creation:
- Modify agent prompts for more/fewer tests
- Change test naming conventions
- Add framework-specific patterns
- Adjust coverage breadth

**Review Phase** - Tune quality standards:
- Make review more/less strict
- Focus on specific issue types
- Add custom finding categories
- Change severity thresholds

**Fix Phase** - Control auto-application:
- Skip automatic fixes (manual review only)
- Change which fixes auto-apply
- Add safety checks before deletion

### Team Customization

Fork this repo and adjust the workflow to match your team's:
- Coding conventions
- Test patterns
- Quality standards
- Tool preferences

Then share your customized version across projects.

## Examples

### TypeScript React Project

```
Discovery: React + TypeScript + Vite + Vitest
Generated:
  - 32 unit tests (components + hooks)
  - 15 integration tests (API + React Query)
  - 18 E2E tests (Playwright)

Review found:
  - 3 vanity tests (checking useState returns what was set)
  - 5 weak assertions (checking element exists, not content)
  - 2 coverage gaps (error boundaries, loading states)

Fixed:
  - Deleted 3 vanity tests
  - Strengthened 5 assertions to check actual behavior
  - Added 2 new tests for missing scenarios
```

### Python FastAPI Backend

```
Discovery: Python 3.11 + FastAPI + pytest + PostgreSQL
Generated:
  - 28 unit tests (services + utilities)
  - 22 integration tests (API endpoints + database)
  - 8 E2E tests (complete request flows)

Review found:
  - 4 coverage gaps (auth edge cases, race conditions)
  - 6 weak assertions (status code only, not response body)
  - 1 false positive (mocked everything, no real verification)

Fixed:
  - Added 4 new tests for edge cases
  - Strengthened 6 assertions to verify full contracts
  - Replaced 1 test to use real dependencies
```

## Architecture

### Workflow Structure

```
test-suite-generator.md (Pure Markdown Guide)
├── Phase 1: Discovery
│   └── Agent: Analyze codebase → Project metadata
├── Phase 2: Unit Test Generation
│   └── Agent: Generate isolated tests → Test files
├── Phase 3: Integration Test Generation
│   └── Agent: Generate interaction tests → Test files
├── Phase 4: E2E Test Generation
│   └── Agent: Generate user flow tests → Test files
├── Phase 5: Adversarial Review
│   └── Agent: Find quality issues → Findings list
└── Phase 6: Apply Fixes
    └── For each file: Read → Apply fixes → Edit

Claude follows the markdown guide and orchestrates agents sequentially.
```

### Agent Orchestration

| Phase | Agent | Input | Output | Key Behavior |
|-------|-------|-------|--------|--------------|
| 1 | Discovery | Codebase files | Project metadata, testable components | Scans structure, detects frameworks |
| 2 | Unit Test | Component list | Test files with isolated tests | Mocks externals, covers edge cases |
| 3 | Integration Test | Integration points | Test files with real dependencies | Tests boundaries, no internal mocks |
| 4 | E2E Test | User flows | Complete journey tests | Tests from user perspective |
| 5 | Adversarial Review | All generated tests | Findings with severity/recommendations | Skeptical, assumes tests are fooling it |
| 6 | Fix Applicator | Findings + test files | Applied changes summary | Reads file, applies all fixes, edits |

### Quality Patterns

- **Structured agent prompts** - Detailed instructions produce consistent output
- **Sequential phases** - Each phase builds on previous results
- **Adversarial mindset** - Review agent assumes tests are deceptive
- **Comprehensive fixes** - All findings applied in one pass per file
- **Clear reporting** - Summary shows exactly what improved

## Troubleshooting

### "Discovery failed"
- Ensure you're running from a project directory with code
- Check that source files are readable
- Try specifying a target directory explicitly

### "All test generation failed"
- Verify your project structure is standard
- Check if test framework is installed
- Review agent transcripts for specific errors

### "Review completed: false"
- Review agent encountered an error
- Tests were still written, just not reviewed
- You can run adversarial review separately

### Tests don't run
- Ensure test framework dependencies are installed
- Check test file paths match your project conventions
- Verify imports and setup code are correct

### Too many/too few tests
- Adjust agent prompts to change coverage breadth
- Modify discovery to focus on specific areas
- Set test count targets in generation prompts

## Contributing

Contributions welcome! Areas for improvement:

- Additional language/framework templates
- Enhanced adversarial review patterns
- Performance optimizations
- GitHub Actions integration
- Test coverage metrics integration

## License

MIT License - see LICENSE file for details

## Credits

Built with Claude Code's multi-agent workflow system.

## Related Projects

- [Claude Code](https://claude.ai/code) - AI-powered development assistant
- [Claude Agent SDK](https://docs.anthropic.com/claude/docs/claude-agent-sdk) - Build custom AI agents
