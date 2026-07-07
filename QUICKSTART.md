# Quick Start Guide

## Installation

### Option 1: Copy to Your Project
```bash
git clone https://github.com/Ada-Edu/ai-test-workflow-engine.git
cp ai-test-workflow-engine/workflows/test-suite-generator.md .claude/
```

### Option 2: Install as Reusable Skill
```bash
git clone https://github.com/Ada-Edu/ai-test-workflow-engine.git
cp ai-test-workflow-engine/workflows/test-suite-generator.md ~/.claude/skills/
```

## Usage

### If Installed as Skill
Simply type in Claude Code:
```
/test-suite-generator
```

### If Copied to Project
Ask Claude:
```
Follow the test-suite-generator.md workflow to create comprehensive tests
```

### Using Natural Language
```
create comprehensive tests with adversarial review for this project
generate a complete test suite with unit, integration, and e2e tests
```

## What Happens

Claude will follow the 6-phase markdown workflow:

1. **Discovery** (1-2 min)
   - Analyzes your codebase
   - Identifies testable components
   - Detects frameworks and conventions

2. **Generate Unit Tests** (3-5 min)
   - Creates isolated function/module tests
   - Mocks external dependencies
   - Covers happy path, errors, edge cases

3. **Generate Integration Tests** (3-5 min)
   - Tests components working together
   - Uses real dependencies
   - Verifies data flows and boundaries

4. **Generate E2E Tests** (3-5 min)
   - Tests complete user journeys
   - Uses appropriate framework (Playwright, etc.)
   - Verifies outcomes and side effects

5. **Adversarial Review** (5-10 min)
   - Skeptically audits all tests
   - Finds coverage gaps, vanity tests, weak assertions
   - Categorizes by severity

6. **Apply Fixes** (5-10 min)
   - Strengthens weak assertions
   - Deletes vanity tests
   - Replaces false positives
   - Adds tests for gaps

**Total Time**: ~20-40 minutes depending on project size

## Example Output

```
# Test Suite Generation Report

## Discovery
- Project: React + TypeScript frontend
- Framework: Vitest + React Testing Library + Playwright

## Generated
- Unit: 15 files, 87 tests
- Integration: 8 files, 42 tests
- E2E: 6 files, 28 tests
- Total: 29 files, 157 tests

## Review Findings
- 18 issues found (5 critical, 6 high, 5 medium, 2 low)
- Coverage gaps: 4
- Vanity tests: 5
- Weak assertions: 7
- False positives: 2

## Improvements Applied
- 12 files modified
- 15 tests strengthened
- 5 tests deleted
- 8 tests replaced
- 12 new tests added
```

## Customization

Edit `workflows/test-suite-generator.md` to customize:

- **Agent prompts** - Change what gets generated
- **Coverage requirements** - Adjust thoroughness
- **Review strictness** - Tune quality standards
- **Auto-fix behavior** - Control what applies automatically

## Tips

1. **Run from project root** for best discovery
2. **Use `--no-fix` first time** to preview changes
3. **Review git diff** to see what improved
4. **Re-run after major refactors** to update tests

## Troubleshooting

**"Discovery failed"**
- Ensure you're in a code directory
- Check file permissions

**"Tests don't match conventions"**
- Edit the discovery prompt in the workflow
- Specify test framework explicitly

**"Too many/few tests"**
- Adjust agent prompts for coverage breadth
- Modify what discovery considers "testable"

**"Review finds nothing"**
- Tests might actually be strong!
- Increase review strictness in prompt

## Next Steps

After generation:
1. Run your test suite: `npm test` / `pytest`
2. Review changes: `git diff`
3. Commit: `git commit -m "Add comprehensive test suite with adversarial review"`
4. Push: `git push`

## Learn More

- [Full Documentation](README.md)
- [Usage Examples](examples/EXAMPLES.md)
- [Workflow Details](workflows/test-suite-generator.md)
- [Issues & Questions](https://github.com/Ada-Edu/ai-test-workflow-engine/issues)
