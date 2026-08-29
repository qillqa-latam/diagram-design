export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'tokens',
        'layout',
        'svg',
        'icons',
        'diagrams',
        'structural',
        'hierarchical',
        'workflow',
        'quantitative',
        'data-platform',
        'semantic-patterns',
        'renderers',
        'linter',
        'importers',
        'cli',
        'playground',
        'packaging',
        'config',
        'deps'
      ]
    ]
  }
};
