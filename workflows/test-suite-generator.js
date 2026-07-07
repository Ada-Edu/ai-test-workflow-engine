export const meta = {
  name: 'test-suite-generator',
  description: 'Generate comprehensive test suite (unit/integration/e2e) + adversarial review',
  whenToUse: 'When you need to create or improve test coverage for a codebase with multi-layer testing and quality review',
  phases: [
    { title: 'Discover', detail: 'Scan codebase structure and identify testable components' },
    { title: 'Generate Unit Tests', detail: 'Create unit tests for individual functions/modules' },
    { title: 'Generate Integration Tests', detail: 'Create integration tests for component interactions' },
    { title: 'Generate E2E Tests', detail: 'Create end-to-end tests for user flows' },
    { title: 'Adversarial Review', detail: 'Find coverage gaps, vanity tests, weak assertions' },
    { title: 'Apply Fixes', detail: 'Strengthen, delete, or replace tests based on findings' }
  ]
}

// Schema for test generation output
const TEST_GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: 'Where to write the test file' },
          content: { type: 'string', description: 'Complete test file content' },
          targets: {
            type: 'array',
            items: { type: 'string' },
            description: 'Source files or functions being tested'
          },
          test_count: { type: 'number', description: 'Number of test cases' }
        },
        required: ['file_path', 'content', 'targets', 'test_count']
      }
    },
    summary: { type: 'string', description: 'Brief summary of what was tested' }
  },
  required: ['tests', 'summary']
}

// Schema for adversarial review findings
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          test_file: { type: 'string', description: 'Path to test file with issue' },
          test_name: { type: 'string', description: 'Specific test case name if applicable' },
          issue_type: {
            type: 'string',
            enum: ['coverage_gap', 'vanity_test', 'weak_assertion', 'false_positive', 'missing_edge_case', 'redundant_test'],
            description: 'Category of issue found'
          },
          severity: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low'],
            description: 'How important this issue is'
          },
          description: { type: 'string', description: 'What is wrong and why' },
          recommendation: {
            type: 'string',
            enum: ['strengthen', 'delete', 'replace', 'add_new'],
            description: 'What action to take'
          },
          reasoning: { type: 'string', description: 'Why this recommendation' },
          suggested_code: { type: 'string', description: 'Proposed fix or replacement code if applicable' }
        },
        required: ['test_file', 'issue_type', 'severity', 'description', 'recommendation', 'reasoning']
      }
    },
    coverage_summary: {
      type: 'object',
      properties: {
        total_tests: { type: 'number' },
        strong_tests: { type: 'number' },
        weak_tests: { type: 'number' },
        vanity_tests: { type: 'number' },
        critical_gaps: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  required: ['findings', 'coverage_summary']
}

// Schema for fix application
const FIX_APPLICATION_SCHEMA = {
  type: 'object',
  properties: {
    actions_taken: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['strengthened', 'deleted', 'replaced', 'added'] },
          file: { type: 'string' },
          test_name: { type: 'string' },
          rationale: { type: 'string' }
        }
      }
    },
    summary: { type: 'string' }
  },
  required: ['actions_taken', 'summary']
}

// === PHASE 1: Discovery ===
phase('Discover')

log('Scanning codebase to identify testable components...')

const discovery = await agent(
  `Analyze this codebase and identify:
1. Project type (language, framework, test framework used or recommended)
2. Source code structure (where production code lives)
3. Existing test structure (where tests are located, naming conventions)
4. Key components that need testing (modules, APIs, user flows)
5. Test infrastructure already in place (test runners, mocking libraries, etc.)

Return a structured analysis that will guide test generation. Look for:
- Entry points and main workflows
- Core business logic functions/classes
- API endpoints or service interfaces
- UI components or user-facing features
- Database/external service interactions

If tests already exist, note their coverage and patterns.`,
  {
    label: 'Discover testable components',
    schema: {
      type: 'object',
      properties: {
        project_type: { type: 'string' },
        language: { type: 'string' },
        test_framework: { type: 'string' },
        source_paths: { type: 'array', items: { type: 'string' } },
        test_paths: { type: 'array', items: { type: 'string' } },
        components: {
          type: 'object',
          properties: {
            unit_targets: { type: 'array', items: { type: 'string' } },
            integration_targets: { type: 'array', items: { type: 'string' } },
            e2e_flows: { type: 'array', items: { type: 'string' } }
          }
        },
        existing_test_count: { type: 'number' },
        recommended_setup: { type: 'string' }
      },
      required: ['project_type', 'language', 'test_framework', 'components']
    }
  }
)

if (!discovery) {
  throw new Error('Discovery failed - cannot proceed without codebase analysis')
}

log(`Found ${discovery.components.unit_targets.length} unit targets, ${discovery.components.integration_targets.length} integration targets, ${discovery.components.e2e_flows.length} e2e flows`)

// === PHASE 2-4: Parallel test generation ===
log('Generating tests across all layers...')

const testGenerationResults = await parallel([
  // Unit tests
  () => agent(
    `Generate comprehensive unit tests for this codebase using ${discovery.test_framework}.

Project context:
- Language: ${discovery.language}
- Test framework: ${discovery.test_framework}
- Existing tests: ${discovery.existing_test_count}

Targets: ${discovery.components.unit_targets.join(', ')}

For each target:
1. Test individual functions/methods in isolation
2. Mock external dependencies
3. Cover happy path, error cases, edge cases, boundary conditions
4. Use meaningful test names that describe behavior
5. Assert on outcomes, not implementation details
6. Include setup/teardown as needed

Return complete test files ready to write to disk.
File paths should follow convention: ${discovery.test_paths.length > 0 ? discovery.test_paths[0] : 'tests/'} or match existing patterns.`,
    {
      label: 'Generate unit tests',
      phase: 'Generate Unit Tests',
      schema: TEST_GENERATION_SCHEMA
    }
  ),

  // Integration tests
  () => agent(
    `Generate integration tests for this codebase using ${discovery.test_framework}.

Project context:
- Language: ${discovery.language}
- Test framework: ${discovery.test_framework}

Targets: ${discovery.components.integration_targets.join(', ')}

For each target:
1. Test how components work together (no mocking internal components)
2. Test API contracts, database interactions, service boundaries
3. Use real dependencies where possible (test databases, in-memory services)
4. Test request/response flows, data transformations
5. Verify error handling across component boundaries
6. Test authentication, authorization, middleware chains if applicable

Return complete test files. Integration tests should be clearly separated from unit tests.`,
    {
      label: 'Generate integration tests',
      phase: 'Generate Integration Tests',
      schema: TEST_GENERATION_SCHEMA
    }
  ),

  // E2E tests
  () => agent(
    `Generate end-to-end tests for this codebase.

Project context:
- Language: ${discovery.language}
- Project type: ${discovery.project_type}

Flows to test: ${discovery.components.e2e_flows.join(', ')}

For each flow:
1. Test complete user journeys from start to finish
2. Use appropriate E2E framework (Playwright, Cypress, Selenium, or CLI testing as appropriate)
3. Test critical paths users take through the system
4. Include realistic data and scenarios
5. Verify UI state, API responses, data persistence
6. Test error scenarios and recovery
7. Keep tests maintainable - use page objects or helpers

If this is a library/CLI/API without UI, focus on command-line usage or API call sequences.
Return complete test files with necessary setup/configuration.`,
    {
      label: 'Generate E2E tests',
      phase: 'Generate E2E Tests',
      schema: TEST_GENERATION_SCHEMA
    }
  )
])

const [unitResults, integrationResults, e2eResults] = testGenerationResults.filter(Boolean)

if (!unitResults && !integrationResults && !e2eResults) {
  throw new Error('All test generation failed')
}

// Write all generated tests to disk
log('Writing generated tests to disk...')

const allTests = [
  ...(unitResults?.tests || []),
  ...(integrationResults?.tests || []),
  ...(e2eResults?.tests || [])
]

// Write tests sequentially to avoid conflicts
for (const test of allTests) {
  await agent(
    `Write this test file to disk:

Path: ${test.file_path}
Content:
${test.content}

Use the Write tool to create the file.`,
    {
      label: `Write ${test.file_path}`,
      phase: 'Generate E2E Tests' // Keep in last generation phase
    }
  )
}

log(`Wrote ${allTests.length} test files (${unitResults?.tests.length || 0} unit, ${integrationResults?.tests.length || 0} integration, ${e2eResults?.tests.length || 0} e2e)`)

// === PHASE 5: Adversarial review ===
phase('Adversarial Review')

log('Running adversarial review to find weaknesses...')

const review = await agent(
  `You are a skeptical test quality reviewer. Your job is to find problems with the test suite that was just generated.

Test files written:
${allTests.map(t => `- ${t.file_path} (${t.test_count} tests, targets: ${t.targets.join(', ')})`).join('\n')}

Read each test file and identify:

1. **Coverage gaps**: What scenarios, edge cases, or code paths are NOT tested?
2. **Vanity tests**: Tests that look good but don't actually verify meaningful behavior (e.g., testing that a getter returns a value you just set)
3. **Weak assertions**: Tests that assert on trivial things or don't verify the actual contract (e.g., checking that a response exists but not what's in it)
4. **Tests that pass for the wrong reasons**: Tests that would pass even if the code is broken (e.g., mocking everything so there's no real verification)
5. **Redundant tests**: Multiple tests checking the exact same thing
6. **Missing edge cases**: Null/undefined handling, empty arrays, boundary values, concurrent access, etc.

For each finding:
- Classify severity: critical (major functionality not tested), high (important cases missing), medium (weak coverage), low (nice to have)
- Recommend action: strengthen (improve assertions/coverage), delete (remove vanity test), replace (rewrite entirely), add_new (write a new test for gap)
- Provide specific reasoning and suggested code where applicable

Be thorough and adversarial - assume the tests are trying to fool you into thinking they're better than they are.`,
  {
    label: 'Adversarial review',
    phase: 'Adversarial Review',
    schema: REVIEW_SCHEMA,
    effort: 'high'
  }
)

if (!review) {
  log('⚠️  Review failed - skipping fix phase')
  return {
    tests_written: allTests.length,
    unit_tests: unitResults?.tests.length || 0,
    integration_tests: integrationResults?.tests.length || 0,
    e2e_tests: e2eResults?.tests.length || 0,
    review_completed: false
  }
}

log(`Found ${review.findings.length} issues: ${review.coverage_summary.critical_gaps.length} critical gaps, ${review.coverage_summary.weak_tests} weak tests, ${review.coverage_summary.vanity_tests} vanity tests`)

// === PHASE 6: Apply fixes ===
phase('Apply Fixes')

log('Applying recommended improvements...')

// Group findings by file for efficient processing
const findingsByFile = {}
for (const finding of review.findings) {
  if (!findingsByFile[finding.test_file]) {
    findingsByFile[finding.test_file] = []
  }
  findingsByFile[finding.test_file].push(finding)
}

const fixResults = await pipeline(
  Object.entries(findingsByFile),
  ([testFile, findings]) => agent(
    `Apply these adversarial review findings to improve the test file: ${testFile}

Findings (${findings.length}):
${findings.map((f, i) => `
${i + 1}. [${f.severity}] ${f.issue_type}
   ${f.test_name ? `Test: ${f.test_name}` : 'General issue'}
   Problem: ${f.description}
   Action: ${f.recommendation}
   Reasoning: ${f.reasoning}
   ${f.suggested_code ? `Suggested code:\n${f.suggested_code}` : ''}
`).join('\n')}

Read the current test file, then:
1. For "strengthen": improve assertions, add missing test cases, fix weak verification
2. For "delete": remove vanity or redundant tests entirely
3. For "replace": rewrite the test to properly verify behavior
4. For "add_new": create new test cases for coverage gaps

Apply ALL recommendations for this file. Use Edit tool to modify the file.
Return a summary of what you changed.`,
    {
      label: `Fix ${testFile.split('/').pop()}`,
      phase: 'Apply Fixes',
      schema: FIX_APPLICATION_SCHEMA
    }
  )
)

const successfulFixes = fixResults.filter(Boolean)
const totalActions = successfulFixes.reduce((sum, result) => sum + result.actions_taken.length, 0)

log(`Applied ${totalActions} improvements across ${successfulFixes.length} test files`)

// === Return summary ===
return {
  discovery: {
    project_type: discovery.project_type,
    language: discovery.language,
    test_framework: discovery.test_framework
  },
  generation: {
    unit_tests: unitResults?.tests.length || 0,
    integration_tests: integrationResults?.tests.length || 0,
    e2e_tests: e2eResults?.tests.length || 0,
    total_tests_written: allTests.length
  },
  review: {
    total_findings: review.findings.length,
    by_severity: {
      critical: review.findings.filter(f => f.severity === 'critical').length,
      high: review.findings.filter(f => f.severity === 'high').length,
      medium: review.findings.filter(f => f.severity === 'medium').length,
      low: review.findings.filter(f => f.severity === 'low').length
    },
    by_type: {
      coverage_gaps: review.findings.filter(f => f.issue_type === 'coverage_gap').length,
      vanity_tests: review.findings.filter(f => f.issue_type === 'vanity_test').length,
      weak_assertions: review.findings.filter(f => f.issue_type === 'weak_assertion').length,
      false_positives: review.findings.filter(f => f.issue_type === 'false_positive').length
    },
    coverage_summary: review.coverage_summary
  },
  fixes: {
    files_modified: successfulFixes.length,
    total_actions: totalActions,
    actions_by_type: {
      strengthened: successfulFixes.reduce((sum, r) => sum + r.actions_taken.filter(a => a.action === 'strengthened').length, 0),
      deleted: successfulFixes.reduce((sum, r) => sum + r.actions_taken.filter(a => a.action === 'deleted').length, 0),
      replaced: successfulFixes.reduce((sum, r) => sum + r.actions_taken.filter(a => a.action === 'replaced').length, 0),
      added: successfulFixes.reduce((sum, r) => sum + r.actions_taken.filter(a => a.action === 'added').length, 0)
    }
  }
}
