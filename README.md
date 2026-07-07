# AI Test Workflow Engine

A multi-agent test generation system powered by Claude that creates comprehensive test suites with adversarial quality review.

## Overview

This workflow orchestrates four specialized AI agents to:
1. **Unit Test Agent** - Generate isolated tests for functions/modules with mocking
2. **Integration Test Agent** - Test component interactions with real dependencies
3. **End-to-End Test Agent** - Test complete user flows from start to finish
4. **Adversarial Agent** - Review tests for coverage gaps, vanity tests, weak assertions, and false positives

The adversarial agent then automatically strengthens, deletes, or replaces tests based on its findings.

## Features

- **Language Agnostic** - Works with any language/framework (auto-detects your setup)
- **Parallel Generation** - All test layers generate concurrently
- **Quality Focused** - Adversarial review catches weak tests before they reach your codebase
- **Automatic Fixes** - Applies improvements directly to test files
- **Comprehensive Coverage** - Unit, integration, and E2E tests in one workflow

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

2. Copy the workflow to your Claude Code workflows directory:
```bash
# On Windows
cp workflows/test-suite-generator.js %USERPROFILE%\.claude\workflows\

# On Mac/Linux
cp workflows/test-suite-generator.js ~/.claude/workflows/
```

3. (Optional) Install the CLI tool for easy invocation from any project:
```bash
npm install -g .
```

## Usage

### Via Claude Code

From any project directory:

```bash
claude-code
```

Then in Claude Code:
```
/workflow test-suite-generator
```

Or use the skill (if installed):
```
/test-suite
```

Or just ask naturally:
```
create comprehensive tests for my project
generate tests with adversarial review
```

### Via CLI Tool

From any project directory:

```bash
ai-test-workflow
```

Or target a specific directory:

```bash
ai-test-workflow src/api
```

## How It Works

### Phase 1: Discovery
The workflow analyzes your codebase to identify:
- Project type and language
- Test framework (existing or recommended)
- Source code structure
- Testable components (unit targets, integration points, E2E flows)

### Phase 2-4: Parallel Test Generation
Three agents work concurrently:

**Unit Test Agent** generates:
- Isolated function/method tests
- Mock external dependencies
- Happy path, error cases, edge cases, boundary conditions
- Meaningful test names describing behavior

**Integration Test Agent** generates:
- Component interaction tests
- API contracts, database interactions
- Real dependencies (test databases, in-memory services)
- Error handling across boundaries

**E2E Test Agent** generates:
- Complete user journey tests
- Critical path scenarios
- Realistic data and error handling
- Framework-appropriate (Playwright, Cypress, CLI testing)

### Phase 5: Adversarial Review
A skeptical reviewer hunts for:
- **Coverage gaps** - Missing scenarios, edge cases, code paths
- **Vanity tests** - Look good but verify nothing meaningful
- **Weak assertions** - Trivial checks instead of actual contracts
- **False positives** - Tests that pass even when code is broken
- **Redundancy** - Multiple tests checking the same thing

Each finding includes:
- Severity level (critical/high/medium/low)
- Issue type classification
- Specific reasoning
- Recommended action (strengthen/delete/replace/add_new)
- Suggested code fix

### Phase 6: Apply Fixes
Automatically applies all recommendations:
- **Strengthen** - Improve assertions, add missing cases
- **Delete** - Remove vanity or redundant tests
- **Replace** - Rewrite tests to properly verify behavior
- **Add New** - Create tests for coverage gaps

## Output

The workflow returns detailed metrics:

```json
{
  "discovery": {
    "project_type": "Full-stack TypeScript + Python",
    "language": "TypeScript, Python",
    "test_framework": "Vitest, pytest"
  },
  "generation": {
    "unit_tests": 25,
    "integration_tests": 18,
    "e2e_tests": 12,
    "total_tests_written": 55
  },
  "review": {
    "total_findings": 14,
    "by_severity": {
      "critical": 2,
      "high": 5,
      "medium": 4,
      "low": 3
    },
    "by_type": {
      "coverage_gaps": 6,
      "vanity_tests": 3,
      "weak_assertions": 4,
      "false_positives": 1
    }
  },
  "fixes": {
    "files_modified": 8,
    "total_actions": 14,
    "actions_by_type": {
      "strengthened": 7,
      "deleted": 3,
      "replaced": 2,
      "added": 2
    }
  }
}
```

## Configuration

### Customizing Test Generation

Edit `workflows/test-suite-generator.js` to customize:

- **Test framework preferences** - Modify the discovery agent prompt
- **Coverage requirements** - Adjust what the agents look for
- **Adversarial strictness** - Change review agent's effort level
- **Auto-apply behavior** - Skip phase 6 to review manually

### Schema Customization

The workflow uses structured output schemas for:
- `TEST_GENERATION_SCHEMA` - Test file structure
- `REVIEW_SCHEMA` - Finding categories and recommendations
- `FIX_APPLICATION_SCHEMA` - Applied action tracking

Modify these to capture additional metadata or change output format.

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
test-suite-generator.js
├── Meta block (name, description, phases)
├── Schemas (TEST_GENERATION, REVIEW, FIX_APPLICATION)
├── Phase 1: Discovery (1 agent)
├── Phases 2-4: Test Generation (3 parallel agents)
│   ├── Unit Test Agent
│   ├── Integration Test Agent
│   └── E2E Test Agent
├── File Writing (sequential writes to avoid conflicts)
├── Phase 5: Adversarial Review (1 agent, high effort)
└── Phase 6: Apply Fixes (parallel by file)
```

### Agent Responsibilities

| Agent | Input | Output | Key Behavior |
|-------|-------|--------|--------------|
| Discovery | Codebase | Project metadata, testable components | Scans structure, detects frameworks |
| Unit Test | Component list | Test files with isolated tests | Mocks externals, covers edge cases |
| Integration Test | Integration points | Test files with real dependencies | Tests boundaries, no internal mocks |
| E2E Test | User flows | Complete journey tests | Tests from user perspective |
| Adversarial Review | All generated tests | Findings with severity/recommendations | Skeptical, assumes tests are fooling it |
| Fix Applicator | Findings grouped by file | Applied changes summary | Reads current file, applies all fixes |

### Quality Patterns Used

- **Parallel generation** - Faster wall-clock time
- **Pipeline for fixes** - No barrier between review and fix per file
- **Adversarial mindset** - Default to finding problems
- **Structured output** - Type-safe data flow between agents
- **High effort review** - More thorough quality checking

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
